import test from 'node:test';
import assert from 'node:assert/strict';
import {PGlite} from '@electric-sql/pglite';
import {build} from 'esbuild';
import {mkdtemp,readFile,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {fileURLToPath} from 'node:url';
const temporary=await mkdtemp(join(tmpdir(),'ojiisan-postgres-'));
await build({stdin:{contents:'export * from "./backend/supabase/router"; export * from "./backend/supabase/postgres-adapter"; export * from "./backend/supabase/import-snapshot"; export {defaultBlocks} from "./lib/method-blocks";',resolveDir:fileURLToPath(new URL('../',import.meta.url))},outfile:join(temporary,'api.mjs'),bundle:true,platform:'node',format:'esm',target:'node22'});
const {createApi,PostgresDatabase,postgresQuery,defaultBlocks,importSnapshot,importColumns}=await import(join(temporary,'api.mjs'));
const pg=new PGlite();
await pg.exec('CREATE ROLE anon; CREATE ROLE authenticated;');
await pg.exec(await readFile(new URL('../backend/supabase/schema.sql',import.meta.url),'utf8'));
const db=new PostgresDatabase(async(q,v)=>(await pg.query(q,v)).rows,async work=>pg.transaction(async tx=>work(async(q,v)=>(await tx.query(q,v)).rows)));
let upstreamCalls=0;
const api=createApi(db,{fetcher:async()=>{upstreamCalls++;throw new Error('Unexpected legacy dependency');}});
const origin='https://identidadeancestral.github.io';
const base='https://isolated.example.test/functions/v1/ojiisan-api';
const password='Uma frase privada para teste 2026!';
async function call(path,body,token,extra={}){
 const r=await api(new Request(base+path,{method:body?'POST':'GET',headers:{Origin:origin,...(body?{'Content-Type':'application/json'}:{}),...(token?{Authorization:'Bearer '+token}:{}),...extra},body:body?JSON.stringify(body):undefined}));
 return {status:r.status,data:await r.json(),headers:r.headers};
}
const account=(body,token)=>call('/api/account',body,token);
const chat=(token,body,path='')=>call('/api/chat'+path,body,token);
async function profile(token,name){const r=await chat(token,{action:'profile',nickname:name,language:'Português',level:'beginner',avatar:'🌱',available:true});assert.equal(r.status,200);return r.data.me;}
let a,b,c,pa,pb,pc,room,group;
test('Postgres schema keeps all app tables private from public browser roles',async()=>{
 const rows=(await pg.query("SELECT tablename,rowsecurity FROM pg_tables WHERE schemaname='ojiisan'")).rows;
 assert.equal(rows.length,13);assert.ok(rows.every(r=>r.rowsecurity));
 for(const role of ['anon','authenticated']){
  await pg.exec('SET ROLE '+role);
  try{await assert.rejects(pg.query('SELECT * FROM ojiisan.email_accounts'),/permission denied/);await assert.rejects(pg.query('SELECT * FROM ojiisan.messages'),/permission denied/);await assert.rejects(pg.query('SELECT * FROM ojiisan.visit_sessions'),/permission denied/);await assert.rejects(pg.query("UPDATE ojiisan.visit_totals SET visits=999999"),/permission denied/);}finally{await pg.exec('RESET ROLE');}
 }
});
test('SQL parameters, identifiers, quoted question marks and atomic batches survive migration',async()=>{
 const q=postgresQuery("SELECT '?' AS literal FROM profiles WHERE nickname=? AND auth_key=?");
 assert.equal(q.text,"SELECT '?' AS literal FROM ojiisan.profiles WHERE nickname=$1 AND auth_key=$2");assert.equal(q.count,2);
 await assert.rejects(db.batch([
  db.prepare("INSERT INTO frontend_sessions(token_hash,auth_key,expires_at) VALUES(?,?,?)").bind('rollback-token','x',1),
  db.prepare("INSERT INTO members(room_id,user_id,state,inviter_id,invited_at) VALUES(?,?,'active',?,?)").bind('missing-room','missing-user','missing-user',1)
 ]));
 assert.equal(await db.prepare('SELECT * FROM frontend_sessions WHERE token_hash=?').bind('rollback-token').first(),null);
});
test('email accounts sign up and sign in with no ChatGPT service or identity',async()=>{
 assert.equal((await chat(null)).status,401);
 assert.equal((await call('/api/account',{action:'register',email:'bad@example.test',password},null,{Origin:'https://attacker.example'})).status,403);
 a=await account({action:'register',email:'postgres-a@example.test',password});
 b=await account({action:'register',email:'postgres-b@example.test',password});
 c=await account({action:'register',email:'postgres-c@example.test',password});
 for(const user of [a,b,c]){assert.equal(user.status,201);assert.match(user.data.token,/^oj1_/);}
 assert.equal((await account({action:'login',email:'POSTGRES-A@example.test',password})).status,200);
 assert.equal((await account({action:'login',email:'postgres-a@example.test',password:'Uma frase que está incorreta'})).status,401);
 pa=await profile(a.data.token,"Aluno '?; DROP TABLE profiles;");pb=await profile(b.data.token,'Aluno B');pc=await profile(c.data.token,'Aluno C');
 assert.equal(upstreamCalls,0);assert.equal((await chat(a.data.token)).data.people.length,2);
 assert.equal((await chat(a.data.token)).data.me.auth_key,undefined);
});
test('Postgres conversations require consent, reject outsiders and preserve Japanese blocks',async()=>{
 room=(await chat(a.data.token,{action:'dm',targetId:pb.id})).data.roomId;assert.ok(room);
 const send={action:'send',roomId:room,clientId:'postgres-message-unique',payload:{...defaultBlocks('consume'),adverb:'sometimes'}};
 assert.equal((await chat(a.data.token,send)).status,409);
 assert.equal((await chat(b.data.token,null,'?room='+room)).status,403);
 assert.equal((await chat(b.data.token,{action:'accept',roomId:room})).status,200);
 const sent=await chat(a.data.token,send);assert.equal(sent.status,200);assert.equal(typeof sent.data.id,'number');
 assert.equal((await chat(a.data.token,send)).data.id,sent.data.id);
 assert.equal((await chat(c.data.token,null,'?room='+room)).status,403);
 const view=(await chat(b.data.token,null,'?room='+room)).data;
 assert.equal(view.messages.length,1);assert.equal(view.messages[0].japanese,'コーヒーを時々飲みます。');
 assert.ok(!JSON.stringify(view).includes('postgres-a@example.test'));
 assert.equal((await chat(b.data.token,{action:'heartbeat',roomId:room,lastRead:sent.data.id})).status,200);
 assert.equal((await chat(b.data.token,{action:'heartbeat',roomId:room,lastRead:0})).status,200);
 assert.equal((await chat(b.data.token)).data.rooms[0].last_read,sent.data.id);
});
test('Postgres groups, administrator transfer and blocking retain access rules',async()=>{
 group=(await chat(a.data.token,{action:'group',title:'Grupo de prática',targets:[pb.id,pc.id]})).data.roomId;assert.ok(group);
 assert.equal((await chat(b.data.token,{action:'accept',roomId:group})).status,200);
 assert.equal((await chat(c.data.token,{action:'accept',roomId:group})).status,200);
 assert.equal((await chat(a.data.token,{action:'leave',roomId:group})).status,200);
 assert.equal((await chat(a.data.token,null,'?room='+group)).status,403);
 assert.equal((await chat(b.data.token,{action:'block',targetId:pa.id})).status,200);
 assert.equal((await chat(a.data.token,null,'?room='+room)).status,403);
 const blocked=await chat(a.data.token,{action:'sync',roomId:room});
 assert.equal(blocked.status,200);assert.equal(blocked.data.conversation,null);assert.equal(blocked.data.roomError,'blocked');
 assert.ok(!blocked.data.overview.rooms.some(r=>r.id===room));
 assert.equal((await chat(b.data.token,{action:'unblock',targetId:pa.id})).status,200);
 assert.equal((await chat(a.data.token,null,'?room='+room)).status,200);
});
test('one sync request refreshes presence and messages without bypassing membership or leaking identity',async()=>{
 await db.prepare('UPDATE profiles SET last_seen=? WHERE id=?').bind(1,pb.id).run();
 const first=await chat(b.data.token,{action:'sync',roomId:room});
 assert.equal(first.status,200);assert.equal(first.data.overview.me.id,pb.id);assert.ok(first.data.overview.me.last_seen>1);
 assert.equal(first.data.conversation.messages.length,1);assert.equal(first.data.roomError,null);
 const last=first.data.conversation.messages.at(-1).id;
 const next=await chat(b.data.token,{action:'sync',roomId:room,after:last,lastRead:last});
 assert.equal(next.status,200);assert.equal(next.data.conversation.messages.length,0);
 assert.equal(next.data.overview.rooms.find(r=>r.id===room).last_read,last);
 assert.ok(!JSON.stringify(next.data).includes('auth_key'));assert.ok(!JSON.stringify(next.data).includes('postgres-b@example.test'));
 const outsider=await chat(c.data.token,{action:'sync',roomId:room,after:0,lastRead:last});
 assert.equal(outsider.status,200);assert.equal(outsider.data.conversation,null);assert.equal(outsider.data.roomError,'not_member');
 assert.equal((await chat(b.data.token,{action:'sync',after:-1})).status,400);
 assert.equal((await chat(null,{action:'sync'})).status,401);
});
test('account request limits are atomic, shared across sessions and readable across origins',async()=>{
 const user=await account({action:'register',email:'rate@example.test',password});assert.equal(user.status,201);
 const empty=await chat(user.data.token,{action:'sync'});assert.equal(empty.status,200);assert.equal(empty.data.overview.me,null);
 const another=await account({action:'login',email:'rate@example.test',password});assert.equal(another.status,200);
 const key=(await db.prepare('SELECT auth_key FROM email_accounts WHERE email=?').bind('rate@example.test').first()).auth_key;
 const hash=Buffer.from(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(key))).toString('base64url');
 const window=Math.floor(Date.now()/60000);
 // Cover a possible minute boundary without altering any production clock.
 for(let w=window;w<=window+1;w++)await db.prepare('INSERT INTO account_rate_limits(bucket,hits,expires_at) VALUES(?,119,?) ON CONFLICT(bucket) DO UPDATE SET hits=119').bind('api:'+hash+':'+w,(w+1)*60000).run();
 const results=await Promise.all([chat(user.data.token),chat(another.data.token),call('/api/study',null,user.data.token)]);
 assert.deepEqual(results.map(r=>r.status).sort(),[200,429,429]);
 for(const r of results.filter(r=>r.status===429)){
  assert.equal(r.data.error,'slow_down');assert.ok(Number(r.headers.get('Retry-After'))>=1);assert.ok(Number(r.headers.get('Retry-After'))<=60);
  assert.equal(r.headers.get('Access-Control-Expose-Headers'),'Retry-After');
 }
 assert.equal((await chat(b.data.token)).status,200);
 assert.equal((await chat('oj1_'+'x'.repeat(43))).status,401);
});
test('Postgres study progress belongs to its learner',async()=>{
 assert.equal((await call('/api/study',{storyId:'method:consume',rating:'remembered'},a.data.token)).status,200);
 const mine=await call('/api/study',null,a.data.token),other=await call('/api/study',null,b.data.token);
 assert.equal(mine.data.progress.length,1);assert.equal(other.data.progress.length,0);
});
test('password change and private recovery revoke old PostgreSQL sessions',async()=>{
 const changed=await account({action:'change',currentPassword:password,password:'Minha outra frase privada 123!'},c.data.token);assert.equal(changed.status,200);
 assert.equal((await chat(c.data.token)).status,401);
 assert.equal((await account({action:'recover',email:'postgres-c@example.test',recoveryCode:c.data.recoveryCode,password})).status,400);
 assert.equal((await account({action:'recover',email:'postgres-c@example.test',recoveryCode:changed.data.recoveryCode,password})).status,200);
 assert.equal((await account({action:'recover',email:'postgres-c@example.test',recoveryCode:changed.data.recoveryCode,password})).status,400);
 const signed=await account({action:'login',email:'postgres-c@example.test',password});assert.equal(signed.status,200);
 assert.equal((await account({action:'logout'},signed.data.token)).status,200);assert.equal((await chat(signed.data.token)).status,401);
 assert.equal(upstreamCalls,0);
});
test('API bounds, methods and CORS protect all migrated endpoints',async()=>{
 assert.equal((await call('/api/chat',{action:'profile',nickname:'a'.repeat(11000)},a.data.token)).status,413);
 const response=await api(new Request(base+'/api/chat',{method:'OPTIONS',headers:{Origin:origin}}));assert.equal(response.status,204);assert.equal(response.headers.get('Access-Control-Allow-Origin'),origin);
 const refused=await api(new Request(base+'/api/chat',{method:'OPTIONS',headers:{Origin:'https://attacker.example'}}));assert.equal(refused.status,403);assert.equal(refused.headers.get('Access-Control-Allow-Origin'),null);
 assert.equal((await call('/health')).data.backend,'supabase');
 assert.equal((await call('/arbitrary-query',{sql:'SELECT * FROM email_accounts'},a.data.token)).status,404);
});
test('the optional bridge links only the verified imported profile and cannot overwrite an email account',async()=>{
 const token='L'.repeat(43),id='imported-profile-id',key='legacy-imported-key',now=Date.now();
 await db.prepare('INSERT INTO profiles(id,auth_key,nickname,language,level,avatar,available,last_seen,created_at) VALUES(?,?,?,?,?,?,?,?,?)').bind(id,key,'Perfil antigo','Português','beginner','🌱',1,now,now).run();
 let checks=0;
 const bridge=createApi(db,{legacyBridge:true,fetcher:async(url,options)=>{checks++;assert.equal(url,'https://kotoba-chat-identidadeancestral.aaaaasssdd.chatgpt.site/api/legacy-profile');return options.headers.Authorization==='Bearer '+token?Response.json({me:{id}}):Response.json({error:'sign_in'},{status:401});}});
 const linked=await bridge(new Request(base+'/api/account',{method:'POST',headers:{Origin:origin,Authorization:'Bearer '+token,'Content-Type':'application/json'},body:JSON.stringify({action:'link',email:'imported@example.test',password,authKey:'untrusted-key'})}));
 assert.equal(linked.status,201);const value=await linked.json();assert.equal((await chat(value.token)).data.me.id,id);
 const normalChecks=checks;await chat(value.token,{action:'heartbeat'});assert.equal(checks,normalChecks);
 const duplicate=await bridge(new Request(base+'/api/account',{method:'POST',headers:{Origin:origin,Authorization:'Bearer '+token,'Content-Type':'application/json'},body:JSON.stringify({action:'link',email:'takeover@example.test',password})}));assert.equal(duplicate.status,409);
 const status=await bridge(new Request(base+'/api/account',{headers:{Origin:origin,Authorization:'Bearer '+token}}));assert.equal((await status.json()).alreadyLinked,true);
});
test('snapshot import preserves identifiers, credentials and history, rejects partial exports, and rolls back errors',async()=>{
 const snapshot={format:'ojiisan-export-v1',complete:true,tables:{}};
 for(const [table,columns] of Object.entries(importColumns))snapshot.tables[table]={columns,rows:(await pg.query('SELECT * FROM ojiisan.'+table)).rows};
 const target=new PGlite();
 try{
  await target.exec('CREATE ROLE anon; CREATE ROLE authenticated;');await target.exec(await readFile(new URL('../backend/supabase/schema.sql',import.meta.url),'utf8'));
  const transaction=work=>target.transaction(async tx=>work(async(q,v)=>(await tx.query(q,v)).rows));
  await assert.rejects(importSnapshot({...snapshot,complete:false},transaction),/Incomplete export/);
  const broken=structuredClone(snapshot);broken.tables.profiles.rows=[];
  await assert.rejects(importSnapshot(broken,transaction));assert.equal((await target.query('SELECT count(*) AS n FROM ojiisan.rooms')).rows[0].n,0);
  const counts=await importSnapshot(snapshot,transaction);
  for(const [table,part] of Object.entries(snapshot.tables)){
   assert.equal(counts[table],part.rows.length);
   const rows=(await target.query('SELECT * FROM ojiisan.'+table)).rows;
   const canonical=list=>list.map(row=>JSON.stringify(Object.fromEntries(Object.entries(row).sort()))).sort();
   assert.deepEqual(canonical(rows),canonical(part.rows));
  }
  await assert.rejects(importSnapshot(snapshot,transaction),/not empty/);
  const largest=Math.max(...snapshot.tables.messages.rows.map(r=>r.id));
  const next=await target.query('INSERT INTO ojiisan.messages(client_id,room_id,user_id,japanese,payload,created_at) VALUES($1,$2,$3,$4,$5,$6) RETURNING id',['after-import',room,pa.id,'こんにちは。','{}',Date.now()]);assert.ok(next.rows[0].id>largest);
 }finally{await target.close();}
});
test('public visits persist and count concurrent sessions once without storing identities',async()=>{
 const initial=await call('/api/visits');assert.equal(initial.status,200);assert.equal(initial.data.visits,0);
 const id=crypto.randomUUID();
 const duplicates=await Promise.all(Array.from({length:8},()=>call('/api/visits',{visitId:id})));
 assert.ok(duplicates.every(r=>r.status===200&&r.data.visits===1));
 const more=await Promise.all(Array.from({length:12},()=>call('/api/visits',{visitId:crypto.randomUUID()})));
 assert.ok(more.every(r=>r.status===200));
 const freshApi=createApi(db);
 const total=await freshApi(new Request(base+'/api/visits',{headers:{Origin:origin}}));
 assert.equal((await total.json()).visits,13);
 const rows=(await pg.query('SELECT * FROM ojiisan.visit_sessions')).rows;
 assert.equal(rows.length,13);assert.ok(rows.every(r=>/^[A-Za-z0-9_-]{43}$/.test(r.session_hash)&&r.expires_at>Date.now()));
 assert.ok(!JSON.stringify(rows).includes(id));assert.equal((await chat(null)).status,401);
});
test('visits reject malformed payloads and other origins without changing the total',async()=>{
 for(const visitId of ['',123,null,'arbitrary-value'])assert.equal((await call('/api/visits',{visitId})).status,400);
 assert.equal((await call('/api/visits',{visitId:crypto.randomUUID(),padding:'x'.repeat(300)})).status,413);
 assert.equal((await call('/api/visits',{visitId:crypto.randomUUID()},null,{Origin:'https://attacker.example'})).status,403);
 assert.equal((await call('/api/visits')).data.visits,13);
});
test('expired anonymous visit records are cleaned up and the counter has a bounded write budget',async()=>{
 await pg.query('INSERT INTO ojiisan.visit_sessions(session_hash,expires_at) VALUES($1,$2)',['0'.repeat(43),Date.now()-1]);
 const freshApi=createApi(db);
 assert.equal((await freshApi(new Request(base+'/api/visits',{headers:{Origin:origin}}))).status,200);
 assert.equal((await pg.query('SELECT count(*) AS n FROM ojiisan.visit_sessions WHERE session_hash=$1',['0'.repeat(43)])).rows[0].n,0);
 await pg.query("UPDATE ojiisan.account_rate_limits SET hits=600 WHERE bucket=$1",['visits:'+Math.floor(Date.now()/60000)]);
 const limited=await call('/api/visits',{visitId:crypto.randomUUID()});
 assert.equal(limited.status,429);assert.ok(Number(limited.headers.get('Retry-After'))>0);
 assert.equal((await pg.query("SELECT visits FROM ojiisan.visit_totals WHERE id='main'")).rows[0].visits,13);
});
test.after(async()=>{await pg.close();await rm(temporary,{recursive:true,force:true});});

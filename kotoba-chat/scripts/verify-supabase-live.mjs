// Runs only on an explicitly selected backend. Creates isolated synthetic users.
// Keep the generated cleanup manifest private; remove these exact rows afterwards.
import assert from 'node:assert/strict';
import {randomUUID} from 'node:crypto';
import {mkdir,writeFile} from 'node:fs/promises';
const base=process.env.OJIISAN_API_BASE;
if(!base?.endsWith('/functions/v1/ojiisan-api'))throw new Error('Set the deployed OJIISAN_API_BASE explicitly');
const origin='https://identidadeancestral.github.io';
const runId=randomUUID(),password='Ojiisan teste privado '+randomUUID();
const manifest={runId,emails:[],profileIds:[],roomIds:[],finished:false};
await mkdir('.migration-data',{recursive:true,mode:0o700});
const save=()=>writeFile('.migration-data/live-test.json',JSON.stringify(manifest),{mode:0o600});
await save();
async function call(path,body,token,expected=200,extra={}){
 const r=await fetch(base+path,{method:body?'POST':'GET',headers:{Origin:origin,'x-region':'sa-east-1',...(body?{'Content-Type':'application/json'}:{}),...(token?{Authorization:'Bearer '+token}:{}),...extra},body:body?JSON.stringify(body):undefined,signal:AbortSignal.timeout(30000)});
 const data=await r.json();assert.equal(r.status,expected,path+': '+JSON.stringify(data?.error||r.status));return data;
}
const account=(body,token,status=200)=>call('/api/account',body,token,status);
const chat=(token,body,status=200,path='')=>call('/api/chat'+path,body,token,status);
assert.equal((await call('/health')).backend,'supabase');
await chat(null,null,401);
await call('/api/account',{action:'register'},null,403,{Origin:'https://attacker.example'});
const users=[];
for(let i=0;i<3;i++){
 const email=`ojiisan-check-${runId}-${i}@example.test`;manifest.emails.push(email);await save();
 const user=await account({action:'register',email,password},null,201);users.push(user);
 const profile=(await chat(user.token,{action:'profile',nickname:'Verificação '+i,language:'Português',level:'beginner',avatar:'🌱',available:true})).me;
 manifest.profileIds.push(profile.id);await save();
}
console.log('PASS deployed registration and password hashing');
const [a,b,c]=users;
await account({action:'login',email:manifest.emails[0],password});
await account({action:'login',email:manifest.emails[0],password:'Senha incorreta de verificação'},null,401);
const room=(await chat(a.token,{action:'dm',targetId:manifest.profileIds[1]})).roomId;assert.ok(room);manifest.roomIds.push(room);await save();
const send={action:'send',roomId:room,clientId:'verify-'+runId,payload:{kind:'text',text:'今日は日本語を勉強します。'}};
await chat(a.token,send,409);
await chat(b.token,{action:'accept',roomId:room});
const sent=await chat(a.token,send);assert.equal(typeof sent.id,'number');assert.equal((await chat(a.token,send)).id,sent.id);
assert.equal((await chat(b.token,null,200,'?room='+room)).messages[0].japanese,send.payload.text);
await chat(c.token,null,403,'?room='+room);
console.log('PASS deployed conversation, consent, persistence and outsider protection');
const group=(await chat(a.token,{action:'group',title:'Verificação privada',targets:[manifest.profileIds[1],manifest.profileIds[2]]})).roomId;assert.ok(group);manifest.roomIds.push(group);await save();
await chat(b.token,{action:'accept',roomId:group});await chat(c.token,{action:'accept',roomId:group});
await chat(a.token,{action:'leave',roomId:group});await chat(a.token,null,403,'?room='+group);
await call('/api/study',{storyId:'method:consume',rating:'remembered'},a.token);
assert.equal((await call('/api/study',null,a.token)).progress.length,1);assert.equal((await call('/api/study',null,b.token)).progress.length,0);
console.log('PASS deployed groups and private study progress');
const changed=await account({action:'change',currentPassword:password,password:password+' novo'},c.token);
await chat(c.token,null,401);
await account({action:'recover',email:manifest.emails[2],recoveryCode:changed.recoveryCode,password});
await account({action:'recover',email:manifest.emails[2],recoveryCode:changed.recoveryCode,password},null,400);
const signed=await account({action:'login',email:manifest.emails[2],password});await account({action:'logout'},signed.token);await chat(signed.token,null,401);
manifest.finished=true;await save();
console.log('PASS deployed recovery, single use code, session revocation and logout');

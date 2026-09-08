import test from "node:test";
import assert from "node:assert/strict";
import {DatabaseSync} from "node:sqlite";
import {readFile,writeFile,mkdtemp,rm,readdir} from "node:fs/promises";
import {tmpdir} from "node:os";
import {join} from "node:path";
import ts from "typescript";

const temporary=await mkdtemp(join(tmpdir(),"kotoba-test-"));
for(const name of ["study-data","japanese","stories","vocabulary","chat-server"]) {
  const source=(await readFile(new URL("../lib/"+name+".ts",import.meta.url),"utf8")).replace(/"\.\/(vocabulary|japanese|stories|study-data)"/g,'"./$1.mjs"');
  await writeFile(join(temporary,name+".mjs"),ts.transpileModule(source,{compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.ES2022}}).outputText);
}
const {handleChat}=await import(join(temporary,"chat-server.mjs"));
const {compose,templates}=await import(join(temporary,"vocabulary.mjs"));
const {entries,entryById}=await import(join(temporary,"study-data.mjs"));
const {formsFor,romanize}=await import(join(temporary,"japanese.mjs"));
const {stories}=await import(join(temporary,"stories.mjs"));
const sql=new DatabaseSync(":memory:");
sql.exec("PRAGMA foreign_keys=ON");
for(const file of (await readdir(new URL("../drizzle/",import.meta.url))).filter(f=>f.endsWith(".sql")).sort())sql.exec(await readFile(new URL("../drizzle/"+file,import.meta.url),"utf8"));
function statement(query,values=[]) {
  return {bind(...v){return statement(query,v);},async first(){return sql.prepare(query).get(...values)||null;},async all(){return {results:sql.prepare(query).all(...values)};},async run(){return sql.prepare(query).run(...values);}};
}
const db={prepare:statement,async batch(list){sql.exec("BEGIN");try{const results=[];for(const item of list)results.push(await item.run());sql.exec("COMMIT");return results;}catch(e){sql.exec("ROLLBACK");throw e;}}};
const request=async(auth,body,path="")=>{
  const response=await handleChat(new Request("https://kotoba.test/api/chat"+path,{method:body?"POST":"GET",headers:body?{"Content-Type":"application/json","Origin":"https://kotoba.test"}:undefined,body:body?JSON.stringify(body):undefined}),db,auth);
  return {status:response.status,data:await response.json()};
};
const create=async(auth,name)=>(await request(auth,{action:"profile",nickname:name,language:"Português",level:"beginner",avatar:"🌱",available:true})).data.me;
let a,b,c,d,dm,group;
test("anonymous access is rejected and profiles expose no authentication key",async()=>{
  assert.equal((await request(null)).status,401);
  a=await create("auth-a","Alice");b=await create("auth-b","Bruno");c=await create("auth-c","Carla");d=await create("auth-d","Davi");
  assert.ok(a.id);assert.equal(a.auth_key,undefined);
  const view=await request("auth-a");assert.equal(view.data.people.length,3);
  assert.ok(!JSON.stringify(view.data).includes("auth-b"));
});
test("availability controls directory and new invitations",async()=>{
  await request("auth-b",{action:"availability",available:false});
  assert.ok(!(await request("auth-a")).data.people.some(p=>p.id===b.id));
  assert.equal((await request("auth-a",{action:"dm",targetId:b.id})).status,409);
  await request("auth-b",{action:"availability",available:true});
});
test("direct messages require recipient consent and exclude outsiders",async()=>{
  dm=(await request("auth-a",{action:"dm",targetId:b.id})).data.roomId;assert.ok(dm);
  assert.equal((await request("auth-c",null,"?room="+dm)).status,403);
  assert.equal((await request("auth-b",null,"?room="+dm)).status,403);
  assert.equal((await request("auth-a",{action:"send",roomId:dm,clientId:"test-before-consent",payload:{kind:"visual",template:"hello"}})).status,409);
  assert.equal((await request("auth-b",{action:"accept",roomId:dm})).status,200);
  const send={action:"send",roomId:dm,clientId:"test-idempotent-message",japanese:"untrusted",payload:{kind:"visual",template:"drink",noun:"water"}};
  const sent=await request("auth-a",send);assert.equal(sent.status,200);
  assert.equal((await request("auth-a",send)).data.id,sent.data.id);
  const received=await request("auth-b",null,"?room="+dm);
  assert.equal(received.data.messages.length,1);assert.equal(received.data.messages[0].japanese,"水を飲みます。");
  assert.equal((await request("auth-c",{...send,clientId:"outsider-attempt"})).status,403);
});
test("group invitations, admin checks, acceptance, decline and owner transfer",async()=>{
  const created=await request("auth-a",{action:"group",title:"Japonês juntos",targets:[b.id,c.id]});group=created.data.roomId;assert.ok(group);
  assert.equal((await request("auth-b",null,"?room="+group)).status,403);
  assert.equal((await request("auth-b",{action:"accept",roomId:group})).status,200);
  assert.equal((await request("auth-c",{action:"decline",roomId:group})).status,200);
  assert.equal((await request("auth-c",null,"?room="+group)).status,403);
  assert.equal((await request("auth-b",{action:"invite",roomId:group,targetId:d.id})).status,403);
  assert.equal((await request("auth-a",{action:"invite",roomId:group,targetId:d.id})).status,200);
  assert.equal((await request("auth-d",{action:"accept",roomId:group})).status,200);
  assert.equal((await request("auth-a",{action:"send",roomId:group,clientId:"group-first-message",payload:{kind:"visual",template:"go",noun:"school"}})).status,200);
  assert.equal((await request("auth-b",null,"?room="+group)).data.messages[0].japanese,"学校に行きます。");
});
test("blocking stops direct access and hides shared-group messages",async()=>{
  assert.equal((await request("auth-b",{action:"block",targetId:a.id})).status,200);
  assert.equal((await request("auth-b",null,"?room="+dm)).status,403);
  assert.equal((await request("auth-a",null,"?room="+dm)).status,403);
  assert.equal((await request("auth-a",{action:"dm",targetId:b.id})).status,409);
  assert.equal((await request("auth-b",null,"?room="+group)).data.messages.length,0);
  const visibleGroup=(await request("auth-b")).data.rooms.find(r=>r.id===group);
  assert.equal(visibleGroup.last_message,null);assert.equal(visibleGroup.unread,0);
  assert.equal((await request("auth-b",{action:"unblock",targetId:a.id})).status,200);
  assert.equal((await request("auth-a",{action:"leave",roomId:group})).status,200);
  assert.equal((await request("auth-a",null,"?room="+group)).status,403);
  assert.notEqual((await request("auth-b",null,"?room="+group)).data.room.owner_id,a.id);
});
test("invalid visual combinations and cross-origin writes are rejected",async()=>{
  const bad=await request("auth-b",{action:"send",roomId:dm,clientId:"invalid-visual-phrase",payload:{kind:"visual",template:"drink",noun:"school"}});
  assert.equal(bad.status,400);
  const cross=await handleChat(new Request("https://kotoba.test/api/chat",{method:"POST",headers:{"Content-Type":"application/json","Origin":"https://evil.test"},body:JSON.stringify({action:"availability",available:false})}),db,"auth-b");
  assert.equal(cross.status,403);
  for(const t of templates)for(const noun of t.choices){const value=compose({kind:"visual",template:t.id,noun});assert.ok(value.japanese.endsWith("。"));assert.ok(value.tokens.every(Boolean));}
  assert.equal(compose({kind:"visual",template:"where",noun:"station"}).japanese,"駅はどこですか。");
});
test("message history survives independent request sessions and cursor pagination",async()=>{
  for(let n=0;n<61;n++)await db.prepare("INSERT INTO messages(client_id,room_id,user_id,japanese,payload,created_at) VALUES(?,?,?,?,?,?)").bind("history-"+n,dm,a.id,"はい。",JSON.stringify({kind:"visual",template:"yes"}),Date.now()-200000).run();
  const first=(await request("auth-b",null,"?room="+dm)).data;
  assert.equal(first.messages.length,60);assert.equal(first.hasOlder,true);
  const previous=(await request("auth-b",null,"?room="+dm+"&before="+first.messages[0].id)).data;
  assert.ok(previous.messages.length>0);assert.ok(previous.messages.at(-1).id<first.messages[0].id);
  const after=(await request("auth-b",null,"?room="+dm+"&after="+first.messages.at(-1).id)).data;
  assert.equal(after.messages.length,0);
});
test("300 distinct vocabulary entries and valid forms for every entry",()=>{
  assert.equal(entries.length,300);assert.equal(new Set(entries.map(e=>e.id)).size,300);
  for(const category of ["verb","noun","adjective"])assert.equal(entries.filter(e=>e.category===category).length,100);
  for(const e of entries){assert.ok(e.jp&&e.kana&&e.pt&&e.en&&e.icon);assert.equal(formsFor(e).length,e.category==="verb"?9:e.category==="adjective"?7:1);for(const f of formsFor(e)){const sentence=compose({kind:"word",entry:e.id,form:f.id});assert.equal(sentence.japanese,f.jp);assert.ok(!/[ぁ-ゖァ-ヺ]/u.test(sentence.romaji),sentence.romaji);}}
});
test("Japanese verb groups, irregular forms and adjective distinctions",()=>{
 const form=(id,key)=>formsFor(entryById[id]).find(f=>f.id===key);
 for(const [id,key,jp,kana] of [
  ["verb:go","te","行って","いって"],["verb:go","plainPast","行った","いった"],
  ["verb:return","polite","帰ります","かえります"],["verb:wear","polite","着ます","きます"],["verb:cut","polite","切ります","きります"],
  ["verb:come","plainNegative","来ない","こない"],["verb:come","past","来ました","きました"],
  ["verb:study","te","勉強して","べんきょうして"],["verb:swim","te","泳いで","およいで"],
  ["verb:play","plainPast","遊んだ","あそんだ"],["verb:buy","plainNegative","買わない","かわない"],
  ["verb:exist-object","plainNegative","ない","ない"],["verb:exist-object","plainPastNegative","なかった","なかった"],
  ["verb:need","polite","要ります","いります"],["verb:exist-living","polite","います","います"],
  ["adjective:good","past","よかったです","よかったです"],["adjective:good","negative","よくないです","よくないです"],
  ["adjective:beautiful","adnominal","きれいな","きれいな"],["adjective:dislike","past","嫌いでした","きらいでした"]
 ]){assert.equal(form(id,key).jp,jp);assert.equal(form(id,key).kana,kana);}
 assert.equal(romanize("がっこう"),"gakkou");assert.equal(romanize("おじいさん"),"ojiisan");assert.equal(romanize("コーヒー"),"koohii");assert.equal(romanize("きっぷ"),"kippu");
});
test("scene order reconstructs Japanese, and new messages are server-validated",async()=>{
 for(const story of stories){const c=compose({kind:"story",story:story.id});assert.equal(c.words.map(w=>w.jp).join(""),story.jp.replace(/[、。]/g,""));}
 assert.deepEqual(compose({kind:"story",story:"today-sun"}).words.map(w=>w.jp),["今日","起きて","太陽","を","見ました"]);
 for(const payload of [{kind:"story",story:"today-sun"},{kind:"word",entry:"verb:come",form:"plainNegative"}]){
  const sent=await request("auth-b",{action:"send",roomId:dm,clientId:crypto.randomUUID(),payload,japanese:"ignored"});assert.equal(sent.status,200);
  const got=(await request("auth-a",null,"?room="+dm)).data.messages.at(-1);assert.equal(got.japanese,compose(payload).japanese);assert.deepEqual(got.payload,payload);
 }
 for(const payload of [{kind:"story",story:"invented"},{kind:"word",entry:"verb:come",form:"invented"},{kind:"word",entry:"noun:tree",form:"past"},{kind:"word",entry:"__proto__",form:"dictionary"}])assert.equal((await request("auth-b",{action:"send",roomId:dm,clientId:crypto.randomUUID(),payload})).status,400);
});
test.after(async()=>{sql.close();await rm(temporary,{recursive:true,force:true});});

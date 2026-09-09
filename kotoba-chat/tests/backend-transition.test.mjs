import test from 'node:test';
import assert from 'node:assert/strict';
import {build} from 'esbuild';
import {mkdtemp,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
const dir=await mkdtemp(join(tmpdir(),'ojiisan-transition-'));
await build({entryPoints:['lib/backend-transition.ts'],outfile:join(dir,'transition.mjs'),bundle:true,platform:'node',format:'esm'});
const {transitionRequest}=await import(join(dir,'transition.mjs'));
const old='https://kotoba-chat-identidadeancestral.aaaaasssdd.chatgpt.site';
const origin='https://identidadeancestral.github.io';
const request=(method='GET',originValue=origin,body)=>new Request(old+'/api/chat?room=abc',{method,headers:{Origin:originValue,Authorization:'Bearer test-session','Content-Type':'application/json',Cookie:'legacy-cookie'},body});
test('migration freezes writes while preserving reads and legacy mode',async()=>{
 assert.equal(await transitionRequest(request(),'freeze'),null);
 assert.equal(await transitionRequest(request('POST',origin,'{}'),'legacy'),null);
 const frozen=await transitionRequest(request('POST',origin,'{}'),'freeze');
 assert.equal(frozen.status,503);assert.equal((await frozen.json()).error,'maintenance');
});
test('cached clients reach only the fixed new API with scoped headers and limits',async()=>{
 let calls=0;
 const upstream=async(url,options)=>{calls++;assert.equal(url,'https://yediixixaxqcwzymhcxf.supabase.co/functions/v1/ojiisan-api/api/chat?room=abc');assert.equal(options.headers.get('origin'),origin);assert.equal(options.headers.get('authorization'),'Bearer test-session');assert.equal(options.headers.get('cookie'),null);assert.equal(options.redirect,'error');return Response.json({ok:true});};
 const result=await transitionRequest(request('POST',old,'{}'),'supabase',upstream);assert.equal(result.status,200);
 assert.equal((await transitionRequest(request('POST','https://attacker.example','{}'),'supabase',upstream)).status,403);
 assert.equal((await transitionRequest(request('POST',origin,'x'.repeat(10001)),'supabase',upstream)).status,413);
 assert.equal(calls,1);
});
test.after(()=>rm(dir,{recursive:true,force:true}));

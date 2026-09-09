import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile,mkdtemp,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {build} from 'esbuild';
import {alignApiCsp,assertApiCsp} from '../github/csp.mjs';
const dir=await mkdtemp(join(tmpdir(),'ojiisan-production-client-'));
await build({entryPoints:['lib/api-response.ts'],outfile:join(dir,'response.mjs'),bundle:true,platform:'node',format:'esm'});
const {readApiResponse}=await import(join(dir,'response.mjs'));
test('production CSP rejects the migration regression and follows an API origin change',async()=>{
 const html=await readFile('github/index.html','utf8'),base='https://yediixixaxqcwzymhcxf.supabase.co/functions/v1/ojiisan-api';
 const broken=html.replace("connect-src 'self' https://yediixixaxqcwzymhcxf.supabase.co","connect-src https://kotoba-chat-identidadeancestral.aaaaasssdd.chatgpt.site");
 assert.throws(()=>assertApiCsp(broken,base),/does not match/);assert.doesNotThrow(()=>assertApiCsp(alignApiCsp(broken,base),base));
 const next='https://next-project.example.test/functions/v1/ojiisan-api';assertApiCsp(alignApiCsp(html,next),next);
 assert.throws(()=>alignApiCsp(html,'https://secret:password@example.test/functions/v1/ojiisan-api'),/Invalid/);
});
test('gateway failures preserve sessions while explicit application expiry revokes them',async()=>{
 let expired=0;const revoke=()=>expired++;
 await assert.rejects(readApiResponse(Response.json({code:401,message:'Invalid JWT'},{status:401}),revoke),/gateway_auth/);
 await assert.rejects(readApiResponse(Response.json({error:'credentials'},{status:401}),revoke),/credentials/);
 await assert.rejects(readApiResponse(new Response('<html>Service unavailable</html>',{status:503}),revoke),/unavailable/);
 assert.equal(expired,0);
 await assert.rejects(readApiResponse(Response.json({error:'sign_in'},{status:401}),revoke),/sign_in/);assert.equal(expired,1);
});
test.after(()=>rm(dir,{recursive:true,force:true}));

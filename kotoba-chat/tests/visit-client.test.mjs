import test from 'node:test';
import assert from 'node:assert/strict';
import {build} from 'esbuild';
import {mkdtemp,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {fileURLToPath} from 'node:url';
const dir=await mkdtemp(join(tmpdir(),'ojiisan-visits-'));
await build({entryPoints:[fileURLToPath(new URL('../lib/visit-client.ts',import.meta.url))],outfile:join(dir,'client.mjs'),bundle:true,platform:'node',format:'esm'});
const {visitSession,registerPageVisit}=await import(join(dir,'client.mjs'));
const storage=()=>{const values=new Map();return {getItem:k=>values.get(k)||null,setItem:(k,v)=>values.set(k,v)};};
test('a temporary visit session survives reloads, expires after 30 minutes and tolerates disabled storage',()=>{
 const memory=storage(),now=Date.now();
 const a=visitSession(memory,now);assert.equal(visitSession(memory,now+10000).id,a.id);
 assert.notEqual(visitSession(memory,now+1800001).id,a.id);
 memory.setItem('ojiisan-visit-session','corrupt JSON');assert.match(visitSession(memory,now).id,/^[a-f0-9-]{36}$/);
 assert.doesNotThrow(()=>visitSession({getItem(){throw Error('disabled');},setItem(){throw Error('disabled');}},now));
});
test('React remounts share one public request and never transmit account credentials',async()=>{
 const originalFetch=globalThis.fetch,originalWindow=globalThis.window;let calls=0;
 globalThis.window={sessionStorage:storage()};
 globalThis.fetch=async(url,options)=>{
  calls++;assert.match(url,/\/api\/visits\?/);assert.equal(options.credentials,'omit');assert.equal(options.headers.Authorization,undefined);
  assert.deepEqual(Object.keys(JSON.parse(options.body)),['visitId']);
  return Response.json({visits:123,startedAt:Date.now()});
 };
 try{const a=registerPageVisit(),b=registerPageVisit();assert.equal(a,b);assert.equal((await a).visits,123);assert.equal(calls,1);}
 finally{globalThis.fetch=originalFetch;if(originalWindow===undefined)delete globalThis.window;else globalThis.window=originalWindow;}
});
test.after(()=>rm(dir,{recursive:true,force:true}));

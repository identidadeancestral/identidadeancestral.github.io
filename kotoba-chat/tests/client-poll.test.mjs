import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {build} from 'esbuild';
const dir=await mkdtemp(join(tmpdir(),'ojiisan-poll-'));
await build({stdin:{contents:'export * from "./lib/client-poll";export * from "./lib/api-response";',resolveDir:process.cwd()},outfile:join(dir,'poll.mjs'),bundle:true,platform:'node',format:'esm'});
const {startPolling,ApiError}=await import(join(dir,'poll.mjs'));
const settle=()=>new Promise(resolve=>setImmediate(resolve));
function clock(){
 let now=0,id=0;const queue=new Map();
 return {now:()=>now,schedule:(fn,delay)=>{queue.set(++id,{fn,at:now+delay});return id;},cancel:id=>queue.delete(id),async advance(ms){
  const end=now+ms;
  for(;;){const next=[...queue].filter(([,v])=>v.at<=end).sort((a,b)=>a[1].at-b[1].at)[0];if(!next)break;now=next[1].at;queue.delete(next[0]);next[1].fn();await settle();}
  now=end;await settle();
 }};
}
test('hidden/offline chat sends no polls, and resuming does not overlap requests',async()=>{
 const time=clock();let active=false,wake,calls=0,resolve,signal,unsubscribed=false;
 const stop=startPolling({...time,isActive:()=>active,subscribe:cb=>{wake=cb;return()=>{unsubscribed=true;};},onError:assert.fail,run:s=>{calls++;signal=s;return new Promise(r=>{resolve=r;});}});
 await time.advance(60000);assert.equal(calls,0);
 active=true;wake();await time.advance(0);assert.equal(calls,1);
 wake();await time.advance(10000);assert.equal(calls,1);
 resolve();await settle();active=false;wake();await time.advance(60000);assert.equal(calls,1);
 active=true;wake();await time.advance(0);assert.equal(calls,2);
 stop();assert.equal(signal.aborted,true);assert.equal(unsubscribed,true);resolve();await settle();
 await time.advance(60000);assert.equal(calls,2);
});
test('429 cooldown survives visibility events and successful polling resumes normally',async()=>{
 const time=clock();let wake,calls=0,errors=0,active=true;
 const stop=startPolling({...time,isActive:()=>active,subscribe:cb=>{wake=cb;return()=>{};},onError:()=>errors++,run:async()=>{calls++;if(calls===1)throw new ApiError('slow_down',429,45000);}});
 await settle();assert.equal(errors,1);
 await time.advance(1000);active=false;wake();active=true;wake();
 await time.advance(43999);assert.equal(calls,1);
 await time.advance(1);assert.equal(calls,2);
 await time.advance(4999);assert.equal(calls,2);await time.advance(1);assert.equal(calls,3);stop();
});
test('repeated server failures back off and an in-flight request is aborted after 20 seconds',async()=>{
 const time=clock();let calls=0;
 const stop=startPolling({...time,isActive:()=>true,subscribe:()=>()=>{},onError:()=>{},run:async()=>{calls++;throw new TypeError('Network failed');}});
 await settle();await time.advance(9999);assert.equal(calls,1);await time.advance(1);assert.equal(calls,2);
 await time.advance(19999);assert.equal(calls,2);await time.advance(1);assert.equal(calls,3);stop();
 let signal;const abort=startPolling({...time,isActive:()=>true,subscribe:()=>()=>{},onError:()=>{},run:s=>{signal=s;return new Promise((resolve,reject)=>s.addEventListener('abort',()=>reject(s.reason),{once:true}));}});
 await time.advance(20000);assert.equal(signal.aborted,true);abort();
});
test.after(()=>rm(dir,{recursive:true,force:true}));

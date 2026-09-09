import { ApiError } from "./api-response";

type Options={
 run:(signal:AbortSignal)=>Promise<void>;
 onError:(error:unknown)=>void;
 isActive:()=>boolean;
 subscribe:(wake:()=>void)=>()=>void;
 interval?:number;
 now?:()=>number;
 schedule?:typeof setTimeout;
 cancel?:typeof clearTimeout;
};

// One request at a time. Visibility/online events cannot bypass Retry-After.
export function startPolling(options:Options) {
 const {run,onError,isActive,subscribe,interval=5000,now=Date.now,schedule=setTimeout,cancel=clearTimeout}=options;
 let stopped=false,running=false,failures=0,notBefore=0;
 let timer:ReturnType<typeof setTimeout>|undefined;
 let controller:AbortController|undefined;
 const arm=(delay:number)=>{if(timer!==undefined)cancel(timer);timer=schedule(()=>void tick(),Math.min(delay,2147483647));};
 const tick=async()=>{
  if(stopped||running||!isActive())return;
  if(now()<notBefore){arm(notBefore-now());return;}
  running=true;controller=new AbortController();
  const timeout=schedule(()=>controller?.abort(),20000);
  let delay=interval;
  try{await run(controller.signal);failures=0;}
  catch(error){
   if(!stopped){
    failures++;delay=Math.max(Math.min(60000,interval*2**Math.min(failures,4)),error instanceof ApiError?error.retryAfterMs:0);
    onError(error);
   }
  }finally{
   cancel(timeout);running=false;controller=undefined;
   if(!stopped){notBefore=now()+delay;if(isActive())arm(delay);}
  }
 };
 const wake=()=>{
  if(timer!==undefined){cancel(timer);timer=undefined;}
  if(!stopped&&!running&&isActive())arm(Math.max(0,notBefore-now()));
 };
 const unsubscribe=subscribe(wake);
 void tick();
 return()=>{stopped=true;if(timer!==undefined)cancel(timer);controller?.abort();unsubscribe();};
}

import { FRONTEND_ORIGIN, LEGACY_ORIGIN, SUPABASE_API } from "./frontend-config";
import { cors } from "./frontend-session";
export type BackendMode="legacy"|"freeze"|"supabase";
export async function transitionRequest(req:Request,mode:BackendMode,fetcher:typeof fetch=fetch):Promise<Response|null> {
 if(mode==="legacy")return null;
 const reply=(data:unknown,status:number)=>cors(req,Response.json(data,{status}));
 if(mode==="freeze")return req.method==="POST"?reply({error:"maintenance"},503):null;
 const url=new URL(req.url),origin=req.headers.get("origin");
 if(!["/api/account","/api/chat","/api/study"].includes(url.pathname))return reply({error:"not_found"},404);
 if(origin!==FRONTEND_ORIGIN&&origin!==LEGACY_ORIGIN&&!(req.method==="GET"&&!origin&&url.origin===LEGACY_ORIGIN&&req.headers.get("sec-fetch-site")!=="cross-site"))return reply({error:"origin"},403);
 if(!["GET","POST"].includes(req.method))return reply({error:"method"},405);
 const headers=new Headers({Origin:FRONTEND_ORIGIN,"x-region":"sa-east-1"});
 for(const key of ["authorization","content-type"]){const value=req.headers.get(key);if(value)headers.set(key,value);}
 let body:Uint8Array<ArrayBuffer>|undefined;
 if(req.method==="POST"){
  if(Number(req.headers.get("content-length"))>10000)return reply({error:"invalid_input"},413);
  const reader=req.body?.getReader(),parts:Uint8Array[]=[];let size=0;
  if(reader)try{for(;;){const {done,value}=await reader.read();if(done)break;size+=value.length;if(size>10000){await reader.cancel();return reply({error:"invalid_input"},413);}parts.push(value);}}finally{reader.releaseLock();}
  body=new Uint8Array(size);let at=0;for(const part of parts){body.set(part,at);at+=part.length;}
 }
 try{
  const result=await fetcher(SUPABASE_API+url.pathname+url.search,{method:req.method,headers,body,redirect:"error",signal:AbortSignal.timeout(20000)});
  return cors(req,new Response(result.body,{status:result.status,headers:{"Content-Type":"application/json",...(result.headers.has("Retry-After")?{"Retry-After":result.headers.get("Retry-After")!}:{})}}));
 }catch{return reply({error:"unavailable"},503);}
}

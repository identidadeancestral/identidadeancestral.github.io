import type { Database } from "../../lib/chat-server";
import { handleChat } from "../../lib/chat-server";
import { handleStudy } from "../../lib/study-server";
import { handleAccount } from "../../lib/account-server";
import { accountIdentity } from "../../lib/account-session";
import { cors, frontendIdentity, preflight } from "../../lib/frontend-session";
import { FRONTEND_ORIGIN, LEGACY_ORIGIN } from "../../lib/frontend-config";
type Options={legacyBridge?:boolean;fetcher?:typeof fetch};
const reply=(req:Request,data:unknown,status=200)=>cors(req,Response.json(data,{status}));
async function boundedBody(req:Request,max=10000) {
 if(Number(req.headers.get("content-length"))>max)throw new Error("too_large");
 const reader=req.body?.getReader();if(!reader)return null;
 const parts:Uint8Array[]=[];let size=0;
 try{for(;;){const {value,done}=await reader.read();if(done)break;size+=value.byteLength;if(size>max){await reader.cancel();throw new Error("too_large");}parts.push(value);}}finally{reader.releaseLock();}
 const result=new Uint8Array(size);let at=0;for(const part of parts){result.set(part,at);at+=part.byteLength;}return result;
}
async function legacyIdentity(req:Request,db:Database,options:Options) {
 const own=await frontendIdentity(req,db);if(own)return own;
 const token=req.headers.get("authorization");
 if(!options.legacyBridge||!/^Bearer [A-Za-z0-9_-]{43}$/.test(token||""))return null;
 // Prove ownership of an imported profile through the old authenticated API.
 // Email is never proof, and ordinary email sessions never call the old site.
 const response=await (options.fetcher||fetch)(LEGACY_ORIGIN+"/api/legacy-profile",{headers:{Origin:FRONTEND_ORIGIN,Authorization:token!},signal:AbortSignal.timeout(7000)});
 if(!response.ok)return null;
 const data=await response.json();if(typeof data?.me?.id!=="string")return null;
 const row=await db.prepare("SELECT auth_key FROM profiles WHERE id=?").bind(data.me.id).first<{auth_key:string}>();return row?.auth_key||null;
}
export function createApi(db:Database,options:Options={}) {
 return async function handle(request:Request) {
  try {
   if(request.method==="OPTIONS")return preflight(request);
   if(request.headers.get("origin")!==FRONTEND_ORIGIN)return reply(request,{error:"origin"},403);
   if(!["GET","POST"].includes(request.method))return reply(request,{error:"method"},405);
   const path=new URL(request.url).pathname.replace(/^\/functions\/v1\/ojiisan-api/,"").replace(/^\/ojiisan-api/,"");
   if(!["/api/account","/api/chat","/api/study","/api/frontend-session","/health"].includes(path))return reply(request,{error:"not_found"},404);
   const body=request.method==="POST"?await boundedBody(request,path==="/api/account"?8192:10000):null;
   const req=new Request(request.url,{method:request.method,headers:request.headers,body});
   if(path==="/health"){
    if(req.method!=="GET")return reply(req,{error:"method"},405);
    await db.prepare("SELECT 1 FROM profiles LIMIT 1").first();return reply(req,{ok:true,backend:"supabase",schema:1});
   }
   if(path==="/api/frontend-session"){
    if(!options.legacyBridge||req.method!=="POST")return reply(req,{error:"sign_in"},401);
    const r=await (options.fetcher||fetch)(LEGACY_ORIGIN+"/api/frontend-session",{method:"POST",headers:{Origin:FRONTEND_ORIGIN,"Content-Type":"application/json"},body,signal:AbortSignal.timeout(7000)});
    return reply(req,await r.json(),r.status);
   }
   if(path==="/api/account"){
    const legacy=await legacyIdentity(req,db,options);
    // Do not trust arbitrary forwarded-IP headers. Bound total work globally,
    // with a separate 20-attempt per-email limit and two hashes per isolate.
    return handleAccount(req,db,legacy,"supabase-edge",{attempts:600,registrations:100});
   }
   const identity=await accountIdentity(req,db);
   return cors(req,path==="/api/chat"?await handleChat(req,db,identity?.auth_key||null,true):await handleStudy(req,db,identity?.auth_key||null,true));
  }catch(e){
   if(e instanceof Error&&e.message==="too_large")return reply(request,{error:"invalid_input"},413);
   console.error("Ojiisan API unavailable");return reply(request,{error:"unavailable"},503);
  }
 };
}

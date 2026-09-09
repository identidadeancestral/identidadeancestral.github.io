import type { Database } from "./chat-server";
import { FRONTEND_ORIGIN } from "./frontend-config";
const tokenPattern=/^[A-Za-z0-9_-]{43}$/;
export const validProof=(s:unknown):s is string=>typeof s==="string"&&tokenPattern.test(s);
export const randomToken=()=>btoa(String.fromCharCode(...crypto.getRandomValues(new Uint8Array(32)))).replaceAll("+","-").replaceAll("/","_").replaceAll("=","");
export async function digest(value:string) {return btoa(String.fromCharCode(...new Uint8Array(await crypto.subtle.digest("SHA-256",new TextEncoder().encode(value))))).replaceAll("+","-").replaceAll("/","_").replaceAll("=","");}
export function cors(req:Request,response:Response) {
 const headers=new Headers(response.headers);headers.set("Cache-Control","no-store");headers.set("Vary","Origin, Cookie");headers.set("X-Content-Type-Options","nosniff");
 if(req.headers.get("origin")===FRONTEND_ORIGIN){headers.set("Access-Control-Allow-Origin",FRONTEND_ORIGIN);headers.set("Access-Control-Allow-Methods","GET, POST, OPTIONS");headers.set("Access-Control-Allow-Headers","Authorization, Content-Type");headers.set("Access-Control-Expose-Headers","Retry-After");headers.set("Access-Control-Max-Age","600");}
 return new Response(response.body,{status:response.status,headers});
}
export function preflight(req:Request) {return cors(req,new Response(null,{status:req.headers.get("origin")===FRONTEND_ORIGIN?204:403}));}
export async function issueFrontendCode(db:Database,authKey:string,challenge:string) {
 if(!authKey||!validProof(challenge))throw new Error("invalid_connect");
 const now=Date.now();
 const count=await db.prepare("SELECT count(*) AS n FROM frontend_codes WHERE auth_key=? AND expires_at>?").bind(authKey,now).first<{n:number}>();
 if((count?.n||0)>=10)throw new Error("slow_down");
 const code=randomToken();
 await db.batch([
  db.prepare("DELETE FROM frontend_codes WHERE expires_at<=?").bind(now),
  db.prepare("DELETE FROM frontend_sessions WHERE expires_at<=?").bind(now),
  db.prepare("INSERT INTO frontend_codes(code_hash,auth_key,challenge,expires_at) VALUES(?,?,?,?)").bind(await digest(code),authKey,challenge,now+120000),
 ]);
 return code;
}
export async function frontendIdentity(req:Request,db:Database):Promise<string|null> {
 if(req.headers.get("origin")!==FRONTEND_ORIGIN)return null;
 const token=req.headers.get("authorization")?.match(/^Bearer ([A-Za-z0-9_-]{43})$/)?.[1];if(!token)return null;
 const row=await db.prepare("SELECT auth_key FROM frontend_sessions WHERE token_hash=? AND expires_at>?").bind(await digest(token),Date.now()).first<{auth_key:string}>();
 return row?.auth_key||null;
}
export async function handleFrontendSession(req:Request,db:Database) {
 const reply=(data:unknown,status=200)=>cors(req,Response.json(data,{status}));
 if(req.method==="OPTIONS")return preflight(req);
 if(req.headers.get("origin")!==FRONTEND_ORIGIN)return reply({error:"origin"},403);
 if(req.method!=="POST")return reply({error:"method"},405);
 if(!req.headers.get("content-type")?.includes("application/json"))return reply({error:"invalid_input"},415);
 const raw=await req.text();if(raw.length>2048)return reply({error:"invalid_input"},413);
 let body;try{body=JSON.parse(raw);}catch{return reply({error:"invalid_input"},400);}
 if(body?.action==="logout") {
  const token=req.headers.get("authorization")?.match(/^Bearer ([A-Za-z0-9_-]{43})$/)?.[1];
  if(token)await db.prepare("DELETE FROM frontend_sessions WHERE token_hash=?").bind(await digest(token)).run();
  return reply({ok:true});
 }
 if(body?.action!=="exchange"||!validProof(body.code)||!validProof(body.verifier))return reply({error:"invalid_input"},400);
 // Atomic consume prevents replay; a wrong proof does not consume the code.
 const row=await db.prepare("DELETE FROM frontend_codes WHERE code_hash=? AND challenge=? AND expires_at>? RETURNING auth_key").bind(await digest(body.code),await digest(body.verifier),Date.now()).first<{auth_key:string}>();
 if(!row)return reply({error:"sign_in"},401);
 const token=randomToken(),expiresAt=Date.now()+8*60*60*1000;
 await db.prepare("INSERT INTO frontend_sessions(token_hash,auth_key,expires_at) VALUES(?,?,?)").bind(await digest(token),row.auth_key,expiresAt).run();
 return reply({token,expiresAt});
}

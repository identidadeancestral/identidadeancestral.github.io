import { getChatDb } from "@/db/chat-db";
import { handleAccount } from "@/lib/account-server";
import { legacyRequestIdentity } from "../request-identity";
import { cors, preflight } from "@/lib/frontend-session";
export const dynamic="force-dynamic";
async function route(request:Request) {
 try{
  const db=getChatDb(),legacy=await legacyRequestIdentity(request,db);
  return await handleAccount(request,db,legacy.authKey,request.headers.get("cf-connecting-ip")||"unknown");
 }catch{console.error("Account service unavailable");return cors(request,Response.json({error:"unavailable"},{status:503}));}
}
export const OPTIONS=preflight;
export const GET=route;
export const POST=route;

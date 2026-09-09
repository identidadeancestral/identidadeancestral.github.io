import { getChatDb } from "@/db/chat-db";
import { handleChat } from "@/lib/chat-server";
import { requestIdentity } from "../request-identity";
import { cors, preflight } from "@/lib/frontend-session";
import { transitionRequest } from "@/lib/backend-transition";
import { backendMode } from "../backend-mode";
export const dynamic="force-dynamic";
async function route(request:Request) {
  try{const transitioned=await transitionRequest(request,backendMode());if(transitioned)return transitioned;const db=getChatDb();const identity=await requestIdentity(request,db);return cors(request,await handleChat(request,db,identity.authKey,identity.external&&!!identity.authKey));}
  catch(error){console.error("Chat unavailable",error);return cors(request,Response.json({error:"unavailable"},{status:503}));}
}
export const OPTIONS=preflight;
export const GET=route;
export const POST=route;

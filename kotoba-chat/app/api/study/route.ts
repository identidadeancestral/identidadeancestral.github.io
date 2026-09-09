import { getChatDb } from "@/db/chat-db";
import { handleStudy } from "@/lib/study-server";
import { cors, preflight } from "@/lib/frontend-session";
import { requestIdentity } from "../request-identity";
import { transitionRequest } from "@/lib/backend-transition";
import { backendMode } from "../backend-mode";
export const dynamic="force-dynamic";
export const OPTIONS=preflight;
async function route(req:Request) {
 try{const transitioned=await transitionRequest(req,backendMode());if(transitioned)return transitioned;const db=getChatDb(),identity=await requestIdentity(req,db);return cors(req,await handleStudy(req,db,identity.authKey,identity.external&&!!identity.authKey));}
 catch(error){console.error("Study unavailable",error);return cors(req,Response.json({error:"unavailable"},{status:503}));}
}
export const GET=route;
export const POST=route;

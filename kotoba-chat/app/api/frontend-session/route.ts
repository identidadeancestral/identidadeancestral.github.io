import { getChatDb } from "@/db/chat-db";
import { handleFrontendSession, preflight, cors } from "@/lib/frontend-session";
export const dynamic="force-dynamic";
export const OPTIONS=preflight;
export async function POST(request:Request) {
 try{return await handleFrontendSession(request,getChatDb());}
 catch(error){console.error("Session unavailable",error);return cors(request,Response.json({error:"unavailable"},{status:503}));}
}

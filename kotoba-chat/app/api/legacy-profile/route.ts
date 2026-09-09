import { getChatDb } from "@/db/chat-db";
import { legacyRequestIdentity } from "../request-identity";
import { cors, preflight } from "@/lib/frontend-session";
export const dynamic="force-dynamic";
export const OPTIONS=preflight;
export async function GET(req:Request){
 try{
  const db=getChatDb(),identity=await legacyRequestIdentity(req,db);
  const row=identity.authKey?await db.prepare("SELECT id FROM profiles WHERE auth_key=?").bind(identity.authKey).first<{id:string}>():null;
  return cors(req,Response.json(row?{me:{id:row.id}}:{error:"sign_in"},{status:row?200:401}));
 }catch{return cors(req,Response.json({error:"unavailable"},{status:503}));}
}

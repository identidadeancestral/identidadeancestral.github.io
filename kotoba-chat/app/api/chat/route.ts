import { headers } from "next/headers";
import { getChatGPTUser } from "@/app/chatgpt-auth";
import { getChatDb } from "@/db/chat-db";
import { handleChat } from "@/lib/chat-server";
export const dynamic="force-dynamic";
async function route(request:Request) {
  const user=await getChatGPTUser();
  const authKey=user?(await headers()).get("oai-authenticated-user-id"):null;
  if(!authKey)return Response.json({error:"sign_in"},{status:401,headers:{"Cache-Control":"no-store"}});
  try{return await handleChat(request,getChatDb(),authKey);}
  catch(error){console.error("Chat unavailable",error);return Response.json({error:"unavailable"},{status:503,headers:{"Cache-Control":"no-store"}});}
}
export const GET=route;
export const POST=route;

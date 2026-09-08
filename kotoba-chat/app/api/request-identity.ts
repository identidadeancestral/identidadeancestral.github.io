import { headers } from "next/headers";
import { getChatGPTUser } from "@/app/chatgpt-auth";
import { FRONTEND_ORIGIN } from "@/lib/frontend-config";
import { frontendIdentity } from "@/lib/frontend-session";
import type { Database } from "@/lib/chat-server";
export async function requestIdentity(request:Request,db:Database) {
 const external=request.headers.has("authorization")||request.headers.get("origin")===FRONTEND_ORIGIN;
 if(external)return {authKey:await frontendIdentity(request,db),external:true};
 const user=await getChatGPTUser();
 return {authKey:user?(await headers()).get("oai-authenticated-user-id"):null,external:false};
}

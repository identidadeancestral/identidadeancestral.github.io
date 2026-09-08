import { headers } from "next/headers";
import { getChatGPTUser } from "@/app/chatgpt-auth";
import { FRONTEND_ORIGIN } from "@/lib/frontend-config";
import { frontendIdentity } from "@/lib/frontend-session";
import { accountIdentity } from "@/lib/account-session";
import type { Database } from "@/lib/chat-server";
export async function legacyRequestIdentity(request:Request,db:Database) {
 const external=request.headers.has("authorization")||request.headers.get("origin")===FRONTEND_ORIGIN;
 if(external)return {authKey:await frontendIdentity(request,db),external:true};
 const user=await getChatGPTUser();
 return {authKey:user?(await headers()).get("oai-authenticated-user-id"):null,external:false};
}
export async function requestIdentity(request:Request,db:Database) {
 if(request.headers.get("authorization")?.startsWith("Bearer oj1_"))return {authKey:(await accountIdentity(request,db))?.auth_key||null,external:true};
 const legacy=await legacyRequestIdentity(request,db);
 if(legacy.authKey&&await db.prepare("SELECT 1 FROM email_accounts WHERE auth_key=?").bind(legacy.authKey).first())return {authKey:null,external:legacy.external};
 return legacy;
}

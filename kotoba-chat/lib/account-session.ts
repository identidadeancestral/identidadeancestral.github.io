import type { Database } from "./chat-server";
import { digest, randomToken } from "./frontend-session";
import { FRONTEND_ORIGIN, SERVER_ORIGIN } from "./frontend-config";
export const accountToken=(req:Request)=>req.headers.get("authorization")?.match(/^Bearer (oj1_[A-Za-z0-9_-]{43})$/)?.[1]||null;
export function accountOriginAllowed(req:Request) {
 const origin=req.headers.get("origin");
 if(origin)return origin===FRONTEND_ORIGIN||origin===SERVER_ORIGIN;
 return req.method==="GET"&&new URL(req.url).origin===SERVER_ORIGIN&&req.headers.get("sec-fetch-site")!=="cross-site";
}
export async function accountIdentity(req:Request,db:Database) {
 if(!accountOriginAllowed(req))return null;
 const token=accountToken(req);if(!token)return null;
 return await db.prepare("SELECT s.auth_key,a.email,s.expires_at FROM account_sessions s JOIN email_accounts a ON a.auth_key=s.auth_key WHERE s.token_hash=? AND s.expires_at>? AND s.session_epoch=a.session_epoch").bind(await digest(token),Date.now()).first<{auth_key:string;email:string;expires_at:number}>();
}
export async function newAccountSession() {
 const token="oj1_"+randomToken();
 return {token,tokenHash:await digest(token),expiresAt:Date.now()+8*60*60*1000};
}

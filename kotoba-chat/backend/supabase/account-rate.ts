import type { Database } from "../../lib/chat-server";
import { digest } from "../../lib/frontend-session";

export const ACCOUNT_REQUESTS_PER_MINUTE=120;
export async function accountAllowance(db:Database,authKey:string,now=Date.now()) {
 const window=Math.floor(now/60000),expiresAt=(window+1)*60000;
 // Verified account identity, shared by all sessions. Never trust a forwarded IP.
 const bucket="api:"+await digest(authKey)+":"+window;
 const row=await db.prepare("INSERT INTO account_rate_limits(bucket,hits,expires_at) VALUES(?,1,?) ON CONFLICT(bucket) DO UPDATE SET hits=account_rate_limits.hits+1 WHERE account_rate_limits.hits<? RETURNING hits")
  .bind(bucket,expiresAt,ACCOUNT_REQUESTS_PER_MINUTE).first<{hits:number}>();
 return {allowed:!!row,retryAfter:Math.max(1,Math.ceil((expiresAt-now)/1000))};
}

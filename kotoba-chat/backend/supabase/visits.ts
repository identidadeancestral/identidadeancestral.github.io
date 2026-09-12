import type { Database } from "../../lib/chat-server";
import { digest } from "../../lib/frontend-session";

export function createVisitHandler(db:Database) {
 let nextCleanup=0;
 return async(req:Request)=>{
  if(req.method!=="GET"&&req.method!=="POST")return Response.json({error:"method"},{status:405});
  let visitId:string|undefined;
  if(req.method==="POST"){
   let body;try{body=await req.json();}catch{return Response.json({error:"invalid_input"},{status:400});}
   if(typeof body?.visitId!=="string"||!/^[a-f0-9]{8}-[a-f0-9]{4}-4[a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/.test(body.visitId))return Response.json({error:"invalid_input"},{status:400});
   visitId=body.visitId;
  }
  const now=Date.now(),window=Math.floor(now/60000),expiresAt=(window+1)*60000;
  const allowed=await db.prepare("INSERT INTO account_rate_limits(bucket,hits,expires_at) VALUES(?,1,?) ON CONFLICT(bucket) DO UPDATE SET hits=account_rate_limits.hits+1 WHERE account_rate_limits.hits<600 RETURNING hits")
   .bind("visits:"+window,expiresAt).first();
  if(!allowed)return Response.json({error:"slow_down"},{status:429,headers:{"Retry-After":String(Math.max(1,Math.ceil((expiresAt-now)/1000)))}});
  if(now>=nextCleanup){
   nextCleanup=now+60000;
   await db.prepare("DELETE FROM visit_sessions WHERE expires_at<=?").bind(now).run();
   await db.prepare("DELETE FROM account_rate_limits WHERE expires_at<=? AND bucket LIKE 'visits:%'").bind(now).run();
  }
  // Atomic deduplication and increment: retries and concurrent visits cannot lose counts.
  // Only a random session hash is retained for 24 hours; no IP, email or referrer.
  const row=visitId?await db.prepare(`WITH new_visit AS (
   INSERT INTO visit_sessions(session_hash,expires_at) VALUES(?,?)
   ON CONFLICT(session_hash) DO NOTHING RETURNING session_hash
  ) INSERT INTO visit_totals(id,visits,started_at)
   SELECT 'main',COUNT(*),? FROM new_visit
   ON CONFLICT(id) DO UPDATE SET visits=visit_totals.visits+EXCLUDED.visits
   RETURNING visits,started_at`).bind(await digest(visitId),now+86400000,now).first<{visits:number;started_at:number}>():
   await db.prepare("SELECT visits,started_at FROM visit_totals WHERE id='main'").first<{visits:number;started_at:number}>();
  return Response.json({visits:row?.visits||0,startedAt:row?.started_at||now},{headers:{"Cache-Control":"no-store"}});
 };
}

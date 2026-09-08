import type { Database } from "./chat-server";
import { storyById } from "./stories";
import { patternById } from "./method-blocks";
import { FRONTEND_ORIGIN } from "./frontend-config";
export async function handleStudy(req:Request,db:Database,authKey:string|null,external=false) {
 const json=(v:unknown,status=200)=>Response.json(v,{status,headers:{"Cache-Control":"no-store"}});
 if(!authKey)return json({error:"sign_in"},401);
 if(req.method==="GET")return json({progress:(await db.prepare("SELECT story_id,step,due_at,reviewed_at,attempts FROM study_progress WHERE auth_key=?").bind(authKey).all()).results});
 if(req.method!=="POST")return json({error:"method"},405);
 const origin=req.headers.get("origin");
 const trusted=external&&origin===FRONTEND_ORIGIN;
 if((origin&&origin!==new URL(req.url).origin&&!trusted)||(req.headers.get("sec-fetch-site")==="cross-site"&&!trusted))return json({error:"origin"},403);
 if(!req.headers.get("content-type")?.includes("application/json"))return json({error:"invalid_input"},415);
 const raw=await req.text();if(raw.length>1024)return json({error:"invalid_input"},413);
 let body;try{body=JSON.parse(raw);}catch{return json({error:"invalid_input"},400);}
 if(typeof body?.storyId!=="string"||!(Object.hasOwn(storyById,body.storyId)||(body.storyId.startsWith("method:")&&Object.hasOwn(patternById,body.storyId.slice(7))))||!["again","remembered"].includes(body.rating))return json({error:"invalid_input"},400);
 const row=await db.prepare("SELECT step,due_at,reviewed_at FROM study_progress WHERE auth_key=? AND story_id=?").bind(authKey,body.storyId).first<{step:number;due_at:number;reviewed_at:number}>();
 const now=Date.now();
 // Repeated early practice is welcome, but does not skip review intervals.
 if(row&&body.rating==="remembered"&&row.step>0&&row.due_at>now)return json({ok:true,dueAt:row.due_at,step:row.step});
 const intervals=[10*60*1000,86400000,3*86400000,7*86400000,21*86400000,60*86400000];
 const step=body.rating==="again"?0:Math.min((row?.step||0)+1,intervals.length-1),dueAt=now+intervals[step];
 await db.prepare("INSERT INTO study_progress(auth_key,story_id,step,due_at,reviewed_at,attempts) VALUES(?,?,?,?,?,1) ON CONFLICT(auth_key,story_id) DO UPDATE SET step=excluded.step,due_at=excluded.due_at,reviewed_at=excluded.reviewed_at,attempts=study_progress.attempts+1").bind(authKey,body.storyId,step,dueAt,now).run();
 return json({ok:true,dueAt,step});
}

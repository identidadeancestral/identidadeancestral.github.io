import { avatars, compose, type MessagePayload } from "./vocabulary";
export type Statement = {bind(...values:unknown[]):Statement;first<T=Record<string,unknown>>():Promise<T|null>;all<T=Record<string,unknown>>():Promise<{results:T[]}>;run():Promise<unknown>};
export type Database = {prepare(sql:string):Statement;batch(statements:Statement[]):Promise<unknown>};
type Row=Record<string,any>;
class ChatError extends Error { constructor(public code:string,public status=400){super(code);} }
const fail=(code:string,status=400):never=>{throw new ChatError(code,status);};
const json=(body:unknown,status=200)=>Response.json(body,{status,headers:{"Cache-Control":"no-store","X-Content-Type-Options":"nosniff","Vary":"Cookie, oai-authenticated-user-id"}});
const string=(value:unknown,min:number,max:number)=>typeof value==="string"&&value.trim().length>=min&&value.trim().length<=max?value.trim():fail("invalid_input");
const columns="p.id,p.nickname,p.language,p.level,p.avatar,p.available,p.last_seen";
const blocked="NOT EXISTS (SELECT 1 FROM blocks b WHERE (b.user_id=? AND b.target_id=p.id) OR (b.target_id=? AND b.user_id=p.id))";
function payloadOf(raw:unknown):MessagePayload {
  if(!raw||typeof raw!=="object")return fail("invalid_message");
  const r=raw as Row;
  if(r.kind==="text") return {kind:"text",text:string(r.text,1,1500)};
  if(r.kind!=="visual"||typeof r.template!=="string"||(r.question!==undefined&&typeof r.question!=="boolean"))return fail("invalid_message");
  const value:MessagePayload={kind:"visual",template:r.template,noun:typeof r.noun==="string"?r.noun:undefined,question:r.question===true};
  try{compose(value);}catch{return fail("invalid_message");}
  return value;
}
export async function handleChat(req:Request,db:Database,authKey:string|null):Promise<Response> {
  try {
    if(!authKey)return json({error:"sign_in"},401);
    const now=Date.now();
    const first=(sql:string,...v:unknown[])=>db.prepare(sql).bind(...v).first<Row>();
    const all=async(sql:string,...v:unknown[])=>(await db.prepare(sql).bind(...v).all<Row>()).results;
    const run=(sql:string,...v:unknown[])=>db.prepare(sql).bind(...v).run();
    let me=await first("SELECT * FROM profiles WHERE auth_key=?",authKey);
    const publicMe=()=>me?Object.fromEntries(Object.entries(me).filter(([k])=>k!=="auth_key")):null;
    const isBlocked=async(a:string,b:string)=>!!await first("SELECT 1 FROM blocks WHERE (user_id=? AND target_id=?) OR (user_id=? AND target_id=?)",a,b,b,a);
    const member=async(roomId:string)=>{
      const r=await first("SELECT r.*,m.state,m.last_read FROM rooms r JOIN members m ON m.room_id=r.id WHERE r.id=? AND m.user_id=?",roomId,me!.id);
      if(!r||r.state!=="active")return fail("not_member",403);
      if(r.kind==="dm") {
        const other=await first("SELECT user_id FROM members WHERE room_id=? AND user_id<>?",roomId,me!.id);
        if(other&&await isBlocked(me!.id,other.user_id))return fail("blocked",403);
      }
      return r;
    };
    if(req.method==="GET") {
      if(!me)return json({me:null});
      const u=new URL(req.url),roomId=u.searchParams.get("room");
      if(roomId) {
        const room=await member(roomId);
        const before=Number(u.searchParams.get("before")||0),after=Number(u.searchParams.get("after")||0);
        if(!Number.isSafeInteger(before)||!Number.isSafeInteger(after)||before<0||after<0)return fail("invalid_input");
        const condition=before?" AND m.id<?":after?" AND m.id>?":"";
        const order=before||!after?"DESC":"ASC";
        const values:unknown[]=[roomId,me.id,me.id];if(before||after)values.push(before||after);
        const list=await all("SELECT m.*,p.nickname,p.avatar FROM messages m JOIN profiles p ON p.id=m.user_id WHERE m.room_id=? AND "+blocked.replaceAll("p.id","m.user_id")+condition+" ORDER BY m.id "+order+" LIMIT 60",...values);
        if(order==="DESC")list.reverse();
        const people=await all("SELECT "+columns+",m.state FROM members m JOIN profiles p ON p.id=m.user_id WHERE m.room_id=? ORDER BY m.invited_at",roomId);
        return json({room,messages:list.map(m=>({...m,payload:JSON.parse(m.payload)})),members:people,hasOlder:list.length===60&&order==="DESC"});
      }
      const conversations=await all("SELECT r.*,m.state,m.last_read, (SELECT count(*) FROM messages x WHERE x.room_id=r.id AND x.id>m.last_read AND x.user_id<>? AND NOT EXISTS (SELECT 1 FROM blocks b WHERE (b.user_id=m.user_id AND b.target_id=x.user_id) OR (b.target_id=m.user_id AND b.user_id=x.user_id))) AS unread, (SELECT japanese FROM messages x WHERE x.room_id=r.id AND NOT EXISTS (SELECT 1 FROM blocks b WHERE (b.user_id=m.user_id AND b.target_id=x.user_id) OR (b.target_id=m.user_id AND b.user_id=x.user_id)) ORDER BY id DESC LIMIT 1) AS last_message, (SELECT p.nickname FROM members x JOIN profiles p ON p.id=x.user_id WHERE x.room_id=r.id AND x.user_id<>? LIMIT 1) AS other_name, (SELECT p.avatar FROM members x JOIN profiles p ON p.id=x.user_id WHERE x.room_id=r.id AND x.user_id<>? LIMIT 1) AS other_avatar FROM rooms r JOIN members m ON m.room_id=r.id WHERE m.user_id=? AND m.state='active' AND NOT EXISTS (SELECT 1 FROM members x JOIN blocks b ON (b.user_id=? AND b.target_id=x.user_id) OR (b.target_id=? AND b.user_id=x.user_id) WHERE x.room_id=r.id AND r.kind='dm') ORDER BY r.updated_at DESC LIMIT 100",me.id,me.id,me.id,me.id,me.id,me.id);
      const people=await all("SELECT "+columns+" FROM profiles p WHERE p.id<>? AND p.available=1 AND p.last_seen>? AND "+blocked+" ORDER BY p.last_seen DESC LIMIT 100",me.id,now-75000,me.id,me.id);
      const invitations=await all("SELECT r.id,r.kind,r.title,p.nickname,p.avatar,m.invited_at FROM members m JOIN rooms r ON r.id=m.room_id JOIN profiles p ON p.id=m.inviter_id WHERE m.user_id=? AND m.state='pending' AND "+blocked+" ORDER BY m.invited_at DESC LIMIT 50",me.id,me.id,me.id);
      const blocks=await all("SELECT p.id,p.nickname,p.avatar FROM blocks b JOIN profiles p ON p.id=b.target_id WHERE b.user_id=?",me.id);
      return json({me:publicMe(),rooms:conversations,people,invitations,blocks,serverTime:now});
    }
    if(req.method!=="POST")return json({error:"method"},405);
    const origin=req.headers.get("origin");
    if(origin&&origin!==new URL(req.url).origin)return fail("origin",403);
    if(req.headers.get("sec-fetch-site")==="cross-site")return fail("origin",403);
    if(!req.headers.get("content-type")?.includes("application/json"))return fail("invalid_input",415);
    if(Number(req.headers.get("content-length")||0)>10000)return fail("too_large",413);
    const raw=await req.text();if(raw.length>10000)return fail("too_large",413);
    let b:Row;try{b=JSON.parse(raw);}catch{return fail("invalid_input");}
    if(!b||typeof b!=="object"||Array.isArray(b))return fail("invalid_input");
    if(b.action==="profile") {
      const nickname=string(b.nickname,2,32),language=string(b.language,2,40);
      const level=["beginner","learning","advanced"].includes(b.level)?b.level:fail("invalid_input");
      const avatar=avatars.includes(b.avatar)?b.avatar:fail("invalid_input");
      if(typeof b.available!=="boolean")return fail("invalid_input");
      const id=me?.id||crypto.randomUUID();
      await run("INSERT INTO profiles(id,auth_key,nickname,language,level,avatar,available,last_seen,created_at) VALUES(?,?,?,?,?,?,?,?,?) ON CONFLICT(auth_key) DO UPDATE SET nickname=excluded.nickname,language=excluded.language,level=excluded.level,avatar=excluded.avatar,available=excluded.available,last_seen=excluded.last_seen",id,authKey,nickname,language,level,avatar,+b.available,now,now);
      me=await first("SELECT * FROM profiles WHERE auth_key=?",authKey);
      return json({me:publicMe()});
    }
    if(!me)return fail("profile_required",409);
    if(b.action==="heartbeat") {
      await run("UPDATE profiles SET last_seen=? WHERE id=?",now,me.id);
      if(typeof b.roomId==="string"&&Number.isSafeInteger(b.lastRead)&&b.lastRead>=0)
        await run("UPDATE members SET last_read=MAX(last_read,?) WHERE room_id=? AND user_id=? AND state='active'",b.lastRead,b.roomId,me.id);
      return json({ok:true});
    }
    if(b.action==="availability") {
      if(typeof b.available!=="boolean")return fail("invalid_input");
      await run("UPDATE profiles SET available=?,last_seen=? WHERE id=?",+b.available,now,me.id);
      return json({ok:true});
    }
    if(b.action==="block"||b.action==="unblock") {
      const target=string(b.targetId,1,80);
      if(target===me.id||!await first("SELECT id FROM profiles WHERE id=?",target))return fail("invalid_input");
      if(b.action==="block")await run("INSERT OR IGNORE INTO blocks(user_id,target_id,created_at) VALUES(?,?,?)",me.id,target,now);
      else await run("DELETE FROM blocks WHERE user_id=? AND target_id=?",me.id,target);
      return json({ok:true});
    }
    if(b.action==="dm"||b.action==="group"||b.action==="invite") {
      const count=await first("SELECT count(*) AS n FROM members WHERE inviter_id=? AND user_id<>? AND invited_at>?",me.id,me.id,now-60000);
      if(count!.n>=15)return fail("slow_down",429);
      const ids:string[]= b.action==="group"?(Array.isArray(b.targets)?Array.from(new Set(b.targets)):fail("invalid_input")):[string(b.targetId,1,80)];
      if(ids.length>15||(b.action==="group"&&ids.length===0))return fail("choose_people");
      for(const id of ids) {
        if(typeof id!=="string"||id===me.id)return fail("invalid_input");
        const target=await first("SELECT id FROM profiles WHERE id=? AND available=1",id);
        if(!target||await isBlocked(me.id,id))return fail("unavailable",409);
      }
      if(b.action==="dm") {
        const key=[me.id,ids[0]].sort().join(":");
        const existing=await first("SELECT * FROM rooms WHERE dm_key=?",key);
        if(existing) {
          const states=await all("SELECT * FROM members WHERE room_id=?",existing.id);
          const other=states.find(x=>x.user_id===ids[0]);
          const mine=states.find(x=>x.user_id===me!.id);
          if(other?.state==="active"&&mine?.state==="active")return json({roomId:existing.id,existing:true});
          if(other?.state==="pending")return json({roomId:existing.id,pending:true});
          if(mine?.state==="pending")return json({roomId:existing.id,incoming:true});
          if(other&&now-other.invited_at<600000)return fail("invite_cooldown",429);
          await db.batch([
            db.prepare("UPDATE members SET state='active' WHERE room_id=? AND user_id=?").bind(existing.id,me.id),
            db.prepare("UPDATE members SET state='pending',inviter_id=?,invited_at=? WHERE room_id=? AND user_id=?").bind(me.id,now,existing.id,ids[0])
          ]);
          return json({roomId:existing.id,pending:true});
        }
        const id=crypto.randomUUID();
        await db.batch([
          db.prepare("INSERT INTO rooms(id,kind,title,owner_id,dm_key,created_at,updated_at) VALUES(?,'dm','',?,?,?,?)").bind(id,me.id,key,now,now),
          db.prepare("INSERT INTO members(room_id,user_id,state,inviter_id,invited_at) VALUES(?,?,'active',?,?)").bind(id,me.id,me.id,now),
          db.prepare("INSERT INTO members(room_id,user_id,state,inviter_id,invited_at) VALUES(?,?,'pending',?,?)").bind(id,ids[0],me.id,now)
        ]);return json({roomId:id,pending:true});
      }
      if(b.action==="group") {
        const title=string(b.title,2,60),id=crypto.randomUUID();
        await db.batch([
          db.prepare("INSERT INTO rooms(id,kind,title,owner_id,created_at,updated_at) VALUES(?,'group',?,?,?,?)").bind(id,title,me.id,now,now),
          db.prepare("INSERT INTO members(room_id,user_id,state,inviter_id,invited_at) VALUES(?,?,'active',?,?)").bind(id,me.id,me.id,now),
          ...ids.map(userId=>db.prepare("INSERT INTO members(room_id,user_id,state,inviter_id,invited_at) VALUES(?,?,'pending',?,?)").bind(id,userId,me!.id,now))
        ]);return json({roomId:id});
      }
      const roomId=string(b.roomId,1,80),r=await member(roomId);
      if(r.kind!=="group"||r.owner_id!==me.id)return fail("owner_only",403);
      const countMembers=await first("SELECT count(*) AS n FROM members WHERE room_id=? AND state IN ('active','pending')",roomId);
      if(countMembers!.n>=25)return fail("group_full",409);
      const old=await first("SELECT * FROM members WHERE room_id=? AND user_id=?",roomId,ids[0]);
      if(old&&["active","pending"].includes(old.state))return json({ok:true});
      if(old&&now-old.invited_at<600000)return fail("invite_cooldown",429);
      await run("INSERT INTO members(room_id,user_id,state,inviter_id,invited_at) VALUES(?,?,'pending',?,?) ON CONFLICT(room_id,user_id) DO UPDATE SET state='pending',inviter_id=excluded.inviter_id,invited_at=excluded.invited_at",roomId,ids[0],me.id,now);
      return json({ok:true});
    }
    const roomId=string(b.roomId,1,80);
    if(b.action==="accept"||b.action==="decline") {
      const invite=await first("SELECT * FROM members WHERE room_id=? AND user_id=? AND state='pending'",roomId,me.id);
      if(!invite)return fail("invite_missing",404);
      if(await isBlocked(me.id,invite.inviter_id))return fail("blocked",403);
      await run("UPDATE members SET state=? WHERE room_id=? AND user_id=? AND state='pending'",b.action==="accept"?"active":"declined",roomId,me.id);
      return json({ok:true,roomId});
    }
    const room=await member(roomId);
    if(b.action==="leave") {
      const next=await first("SELECT user_id FROM members WHERE room_id=? AND user_id<>? AND state='active' LIMIT 1",roomId,me.id);
      const statements=[db.prepare("UPDATE members SET state='left' WHERE room_id=? AND user_id=?").bind(roomId,me.id)];
      if(room.owner_id===me.id&&next)statements.push(db.prepare("UPDATE rooms SET owner_id=? WHERE id=?").bind(next.user_id,roomId));
      await db.batch(statements);return json({ok:true});
    }
    if(b.action==="send") {
      const clientId=string(b.clientId,10,80),payload=payloadOf(b.payload),composed=compose(payload);
      const existing=await first("SELECT id,room_id FROM messages WHERE user_id=? AND client_id=?",me.id,clientId);
      if(existing){if(existing.room_id!==roomId)return fail("invalid_input");return json({ok:true,id:existing.id});}
      if(room.kind==="dm"&&!await first("SELECT 1 FROM members WHERE room_id=? AND user_id<>? AND state='active'",roomId,me.id))return fail("wait_for_accept",409);
      const rate=await first("SELECT count(*) AS n FROM messages WHERE user_id=? AND created_at>?",me.id,now-60000);
      if(rate!.n>=30)return fail("slow_down",429);
      await db.batch([
        db.prepare("INSERT OR IGNORE INTO messages(client_id,room_id,user_id,japanese,payload,created_at) VALUES(?,?,?,?,?,?)").bind(clientId,roomId,me.id,composed.japanese,JSON.stringify(payload),now),
        db.prepare("UPDATE rooms SET updated_at=? WHERE id=?").bind(now,roomId)
      ]);
      const saved=await first("SELECT id FROM messages WHERE user_id=? AND client_id=?",me.id,clientId);
      return json({ok:true,id:saved!.id});
    }
    return fail("invalid_action");
  }catch(error) {
    if(error instanceof ChatError)return json({error:error.code},error.status);
    console.error("Chat request failed",error instanceof Error?error.message:"unknown");
    return json({error:"unavailable"},503);
  }
}

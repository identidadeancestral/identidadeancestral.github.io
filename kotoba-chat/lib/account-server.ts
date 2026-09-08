import type { Database, Statement } from "./chat-server";
import { cors, digest, randomToken } from "./frontend-session";
import { accountIdentity, accountOriginAllowed, accountToken, newAccountSession } from "./account-session";
import { hashPassword, verifyPassword, validPassword } from "./passwords";
type Account={auth_key:string;email:string;password_hash:string;recovery_hash:string};
class AccountError extends Error {constructor(public code:string,public status=400){super(code);}}
const fail=(code:string,status=400):never=>{throw new AccountError(code,status);};
export function normalizedEmail(value:unknown) {
 if(typeof value!=="string")return null;
 const email=value.trim().toLowerCase();
 return email.length<=254&&/^[^\s@\u0000-\u001f\u007f]+@[^\s@.]+(?:\.[^\s@.]+)+$/u.test(email)?email:null;
}
async function readBody(req:Request) {
 if(!req.headers.get("content-type")?.toLowerCase().includes("application/json"))return fail("invalid_input",415);
 if(Number(req.headers.get("content-length"))>8192)return fail("invalid_input",413);
 const reader=req.body?.getReader();if(!reader)return fail("invalid_input");
 let size=0;const chunks:Uint8Array[]=[];
 try{for(;;){const {value,done}=await reader.read();if(done)break;size+=value.byteLength;if(size>8192){await reader.cancel();return fail("invalid_input",413);}chunks.push(value);}}finally{reader.releaseLock();}
 const all=new Uint8Array(size);let offset=0;for(const part of chunks){all.set(part,offset);offset+=part.length;}
 try{const value=JSON.parse(new TextDecoder().decode(all));if(!value||typeof value!=="object"||Array.isArray(value))return fail("invalid_input");return value as Record<string,unknown>;}catch{return fail("invalid_input");}
}
async function limit(db:Database,key:string,max:number,window:number) {
 const now=Date.now(),bucket=(await digest(key))+":"+Math.floor(now/window);
 const row=await db.prepare("INSERT INTO account_rate_limits(bucket,hits,expires_at) VALUES(?,1,?) ON CONFLICT(bucket) DO UPDATE SET hits=account_rate_limits.hits+1 RETURNING hits").bind(bucket,(Math.floor(now/window)+1)*window).first<{hits:number}>();
 if(!row||row.hits>max)return fail("slow_down",429);
}
const recoveryToken=()=>randomToken();
const clearSessions=(db:Database,key:string):Statement[]=>[
 db.prepare("DELETE FROM account_sessions WHERE auth_key=?").bind(key),
 db.prepare("DELETE FROM frontend_sessions WHERE auth_key=?").bind(key),
 db.prepare("DELETE FROM frontend_codes WHERE auth_key=?").bind(key),
];
export async function handleAccount(req:Request,db:Database,legacyKey:string|null=null,clientIp="unknown") {
 const reply=(body:unknown,status=200)=>{const response=cors(req,Response.json(body,{status}));if(status===429)response.headers.set("Retry-After","60");return response;};
 try{
  if(!accountOriginAllowed(req))return reply({error:"origin"},403);
  if(req.method==="OPTIONS")return reply(null,200);
  const identity=await accountIdentity(req,db);
  if(req.method==="GET"){
   if(identity)return reply({signedIn:true,authType:"email",email:identity.email,expiresAt:identity.expires_at,needsPassword:false});
   if(accountToken(req))return reply({error:"sign_in"},401);
   if(legacyKey){const linked=await db.prepare("SELECT 1 FROM email_accounts WHERE auth_key=?").bind(legacyKey).first();return reply({signedIn:!linked,authType:"legacy",needsPassword:!linked,alreadyLinked:!!linked});}
   return reply({signedIn:false});
  }
  if(req.method!=="POST")return reply({error:"method"},405);
  const b=await readBody(req);
  if(b.action==="logout"){
   const token=accountToken(req);if(token)await db.prepare("DELETE FROM account_sessions WHERE token_hash=?").bind(await digest(token)).run();
   const legacyToken=req.headers.get("authorization")?.match(/^Bearer ([A-Za-z0-9_-]{43})$/)?.[1];
   if(legacyToken)await db.prepare("DELETE FROM frontend_sessions WHERE token_hash=?").bind(await digest(legacyToken)).run();
   return reply({ok:true});
  }
  if(!["register","login","link","change","recover"].includes(String(b.action)))return reply({error:"invalid_input"},400);
  await limit(db,"ip:"+clientIp,60,15*60*1000);
  await db.batch([db.prepare("DELETE FROM account_rate_limits WHERE expires_at<=?").bind(Date.now()),db.prepare("DELETE FROM account_sessions WHERE expires_at<=?").bind(Date.now())]);
  const email=b.action==="change"?identity?.email:normalizedEmail(b.email);
  if(!email)return reply({error:b.action==="change"?"sign_in":"email"},b.action==="change"?401:400);
  if(!validPassword(b.password))return reply({error:"password_length"},400);
  await limit(db,"email:"+email,20,15*60*1000);
  const account=await db.prepare("SELECT auth_key,email,password_hash,recovery_hash FROM email_accounts WHERE email=?").bind(email).first<Account>();
  if(b.action==="login"){
   if(!await verifyPassword(b.password,account?.password_hash||null)||!account)return reply({error:"credentials"},401);
   const session=await newAccountSession();
   // Compare with the credential snapshot: a concurrent password reset must not
   // allow an old-password login to create a fresh session afterwards.
   const added=await db.prepare("INSERT INTO account_sessions(token_hash,auth_key,expires_at,created_at,session_epoch) SELECT ?,auth_key,?,?,session_epoch FROM email_accounts WHERE auth_key=? AND password_hash=? RETURNING token_hash").bind(session.tokenHash,session.expiresAt,Date.now(),account.auth_key,account.password_hash).first();
   if(!added)return reply({error:"credentials"},401);
   return reply({token:session.token,expiresAt:session.expiresAt,email,authType:"email"});
  }
  if(b.action==="register"||b.action==="link"){
   if(b.action==="link"&&!legacyKey)return reply({error:"sign_in"},401);
   await limit(db,"registration:"+clientIp,10,60*60*1000);
   // Email is a private login identifier, never proof of ownership of an old
   // profile. Linking requires the existing, authenticated legacy identity.
   const key=b.action==="link"?legacyKey!:"email:"+crypto.randomUUID();
   if(account||await db.prepare("SELECT 1 FROM email_accounts WHERE auth_key=?").bind(key).first())return reply({error:"account_unavailable"},409);
   const passwordHash=await hashPassword(b.password),recoveryCode=recoveryToken(),now=Date.now();
   const added=await db.prepare("INSERT INTO email_accounts(auth_key,email,password_hash,recovery_hash,created_at,updated_at) VALUES(?,?,?,?,?,?) ON CONFLICT DO NOTHING RETURNING auth_key").bind(key,email,passwordHash,await digest(recoveryCode),now,now).first();
   if(!added)return reply({error:"account_unavailable"},409);
   const session=await newAccountSession();
   await db.batch([...clearSessions(db,key),db.prepare("INSERT INTO account_sessions(token_hash,auth_key,expires_at,created_at,session_epoch) VALUES(?,?,?,?,1)").bind(session.tokenHash,key,session.expiresAt,now)]);
   return reply({token:session.token,expiresAt:session.expiresAt,email,authType:"email",recoveryCode},201);
  }
  if(b.action==="change"){
   if(!identity||!account||account.auth_key!==identity.auth_key)return reply({error:"sign_in"},401);
   if(typeof b.currentPassword!=="string"||b.currentPassword.length>512||!await verifyPassword(b.currentPassword,account.password_hash))return reply({error:"credentials"},401);
  }else{
   if(typeof b.recoveryCode!=="string"||!/^[A-Za-z0-9_-]{43}$/.test(b.recoveryCode)||!account||await digest(b.recoveryCode)!==account.recovery_hash)return reply({error:"recovery"},400);
  }
  const passwordHash=await hashPassword(b.password),recoveryCode=recoveryToken(),recoveryHash=await digest(recoveryCode),now=Date.now();
  // Claim the current credential snapshot once. Concurrent reuse of a recovery
  // code or stale password change cannot win after the credential has changed.
  const changed=await db.prepare("UPDATE email_accounts SET password_hash=?,recovery_hash=?,updated_at=?,session_epoch=session_epoch+1 WHERE auth_key=? AND password_hash=? AND recovery_hash=? RETURNING auth_key").bind(passwordHash,recoveryHash,now,account!.auth_key,account!.password_hash,account!.recovery_hash).first();
  if(!changed)return reply({error:"recovery"},400);
  await db.batch(clearSessions(db,account!.auth_key));
  return reply({ok:true,recoveryCode,signInAgain:true});
 }catch(error){
  if(error instanceof AccountError)return reply({error:error.code},error.status);
  if(error instanceof Error&&error.message==="auth_busy")return reply({error:"slow_down"},429);
  console.error("Account operation unavailable");
  return reply({error:"unavailable"},503);
 }
}

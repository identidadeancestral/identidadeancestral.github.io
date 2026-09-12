import { API_BASE, apiEndpoint } from "./frontend-config";

const SESSION_KEY="ojiisan-visit-session";
const SESSION_MS=30*60*1000;
export type VisitStats={visits:number;startedAt:number};
type Session={id:string;expiresAt:number};
export function visitSession(storage:Pick<Storage,"getItem"|"setItem">,now=Date.now()):Session {
 try {
  const saved=JSON.parse(storage.getItem(SESSION_KEY)||"null");
  if(typeof saved?.id==="string"&&/^[a-f0-9-]{36}$/.test(saved.id)&&saved.expiresAt>now&&saved.expiresAt<=now+SESSION_MS)return saved;
 }catch{}
 const session={id:crypto.randomUUID(),expiresAt:now+SESSION_MS};
 try{storage.setItem(SESSION_KEY,JSON.stringify(session));}catch{}
 return session;
}
let request:Promise<VisitStats>|undefined;
// One request for the whole page, even across React remounts or tab changes.
export function registerPageVisit():Promise<VisitStats> {
 if(request)return request;
 let session:Session;
 try{session=visitSession(window.sessionStorage);}catch{session={id:crypto.randomUUID(),expiresAt:Date.now()+SESSION_MS};}
 request=fetch(apiEndpoint(API_BASE,"/api/visits"),{
  method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({visitId:session.id}),
  credentials:"omit",cache:"no-store",signal:AbortSignal.timeout(10000)
 }).then(async response=>{
  if(!response.ok)throw new Error("Visit counter unavailable");
  const data=await response.json();
  if(!Number.isSafeInteger(data.visits)||data.visits<0||!Number.isSafeInteger(data.startedAt)||data.startedAt<=0)throw new Error("Invalid visit count");
  return {visits:data.visits,startedAt:data.startedAt};
 });
 return request;
}

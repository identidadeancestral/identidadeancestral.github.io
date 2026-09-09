"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import OjiisanApp from "./ojiisan-app";
import AccountDialog, { type AccountMode, type AccountResult } from "./account-dialog";
import { SERVER_ORIGIN, apiEndpoint } from "@/lib/frontend-config";
import { readApiResponse } from "@/lib/api-response";
type Session={token?:string;expiresAt:number;email?:string;needsPassword:boolean;authType:"email"|"legacy"};
const KEY="ojiisan-session",PENDING="ojiisan-pending-login",IGNORE="ojiisan-ignore-legacy";
const validToken=(token:unknown):token is string=>typeof token==="string"&&/^(?:oj1_)?[A-Za-z0-9_-]{43}$/.test(token);
const random=()=>btoa(String.fromCharCode(...crypto.getRandomValues(new Uint8Array(32)))).replaceAll("+","-").replaceAll("/","_").replaceAll("=","");
const proof=async(value:string)=>btoa(String.fromCharCode(...new Uint8Array(await crypto.subtle.digest("SHA-256",new TextEncoder().encode(value))))).replaceAll("+","-").replaceAll("/","_").replaceAll("=","");
export default function AccountGateway({apiOrigin="",legacySignInPath="/signin-with-chatgpt?return_to=%2F"}:{apiOrigin?:string;legacySignInPath?:string}) {
 const [session,setSession]=useState<Session|null>(null),[loading,setLoading]=useState(true),[notice,setNotice]=useState(""),[open,setOpen]=useState(false),[mode,setMode]=useState<AccountMode>("login");
 const started=useRef(false);
 const call=useCallback(async(body?:Record<string,string>,token?:string)=>{
  const response=await fetch(apiEndpoint(apiOrigin,"/api/account"),{method:body?"POST":"GET",credentials:apiOrigin?"omit":"same-origin",cache:"no-store",headers:{...(body?{"Content-Type":"application/json"}:{}),...(token?{Authorization:"Bearer "+token}:{})},body:body?JSON.stringify(body):undefined});
  return readApiResponse(response);
 },[apiOrigin]);
 const clear=useCallback(()=>{try{sessionStorage.removeItem(KEY);sessionStorage.setItem(IGNORE,"1");}catch{}setSession(null);},[]);
 useEffect(()=>{if(started.current)return;started.current=true;void(async()=>{
  let retained:Session|null=null;
  try{
   let saved=JSON.parse(sessionStorage.getItem(KEY)||"null");
   const hash=new URLSearchParams(location.hash.slice(1)),code=hash.get("code");
   if(code&&apiOrigin){
    history.replaceState(null,"",location.pathname+location.search);
    const pending=JSON.parse(sessionStorage.getItem(PENDING)||"null");sessionStorage.removeItem(PENDING);
    if(!pending||pending.state!==hash.get("state")||Date.now()-pending.createdAt>10*60*1000)throw new Error("A confirmação do perfil anterior expirou. Tente novamente.");
    const response=await fetch(apiEndpoint(apiOrigin,"/api/frontend-session"),{method:"POST",credentials:"omit",headers:{"Content-Type":"application/json"},body:JSON.stringify({action:"exchange",code,verifier:pending.verifier})});
    saved=await response.json();if(!response.ok||!validToken(saved.token)||!Number.isFinite(saved.expiresAt)||saved.expiresAt<=Date.now())throw new Error("Não foi possível confirmar o perfil anterior.");
    sessionStorage.setItem(KEY,JSON.stringify(saved));sessionStorage.removeItem(IGNORE);
   }
   if(saved&&(!validToken(saved.token)||!Number.isFinite(saved.expiresAt)||saved.expiresAt<=Date.now())){sessionStorage.removeItem(KEY);saved=null;}
   if(saved)retained={token:saved.token,expiresAt:saved.expiresAt,email:typeof saved.email==="string"?saved.email:undefined,needsPassword:saved.needsPassword===true,authType:saved.token.startsWith("oj1_")?"email":"legacy"};
   const result=await call(undefined,saved?.token);
   if(result.alreadyLinked){clear();setNotice("Seu perfil já tem e-mail e senha. Use esses dados para entrar.");setMode("login");setOpen(true);}
   else if(result.signedIn&&!(result.authType==="legacy"&&sessionStorage.getItem(IGNORE)==="1")){
    const value:Session={token:saved?.token,expiresAt:result.expiresAt||saved?.expiresAt||Date.now()+8*60*60*1000,email:result.email,needsPassword:!!result.needsPassword,authType:result.authType};
    setSession(value);if(result.needsPassword){setMode("link");setOpen(true);}
   }else if(saved){sessionStorage.removeItem(KEY);}
  }catch(e){
   if(e instanceof Error&&e.message==="sign_in"){clear();setNotice("Sua sessão terminou. Entre com e-mail e senha.");}
   else{if(retained)setSession(retained);setNotice(e instanceof Error&&e.message.startsWith("A confirmação")?e.message:retained?"Não foi possível verificar a conexão. Sua sessão foi mantida; tente novamente em instantes.":"Não foi possível verificar a entrada. Você pode tentar novamente ou estudar sem entrar.");}
  }
  finally{setLoading(false);}
 })();},[apiOrigin,call,clear]);
 useEffect(()=>{const expired=()=>{clear();setNotice("Sua sessão terminou. Entre novamente para continuar a conversa.");};window.addEventListener("ojiisan-session-expired",expired);return()=>window.removeEventListener("ojiisan-session-expired",expired);},[clear]);
 useEffect(()=>{if(!session)return;const timer=setTimeout(clear,Math.max(0,session.expiresAt-Date.now()));return()=>clearTimeout(timer);},[session,clear]);
 const submit=async(body:Record<string,string>):Promise<AccountResult>=>{
  const result=await call(body,session?.token);
  if(result.token){
   if(!validToken(result.token)||!Number.isFinite(result.expiresAt)||result.expiresAt<=Date.now())throw new Error("unavailable");
   const next:Session={token:result.token,expiresAt:result.expiresAt,email:result.email,needsPassword:false,authType:"email"};
   try{sessionStorage.setItem(KEY,JSON.stringify(next));sessionStorage.setItem(IGNORE,"1");}catch{/* A blocked store limits this session to the open page. */}
   setSession(next);setNotice("");
  }else if(result.signInAgain){clear();}
  return result;
 };
 const startLegacy=async()=>{
  sessionStorage.removeItem(IGNORE);
  if(session?.needsPassword){setMode("link");return;}
  if(!apiOrigin){location.assign(legacySignInPath);return;}
  const verifier=random(),state=random();sessionStorage.setItem(PENDING,JSON.stringify({verifier,state,createdAt:Date.now()}));
  location.assign(SERVER_ORIGIN+"/connect?"+new URLSearchParams({challenge:await proof(verifier),state}));
 };
 const signOut=async()=>{try{await call({action:"logout"},session?.token);clear();setNotice("");}catch{setNotice("Não foi possível sair agora. Tente novamente.");}};
 if(loading)return <main className="app-opening" role="status"><p>Abrindo o Ojiisan Chat…</p></main>;
 return <>{notice&&<div className="connection-notice" role="status">{notice}<button onClick={()=>setNotice("")}>Fechar</button></div>}
 <OjiisanApp key={session?.token||(session?"legacy":"guest")} signedIn={!!session} signInPath="#" signOutPath="#" apiOrigin={apiOrigin} sessionToken={session?.token} onSignIn={()=>{setMode("login");setOpen(true);}} onManageAccount={()=>{setMode(session?.needsPassword?"link":"change");setOpen(true);}} onSignOut={()=>void signOut()}/>
 <AccountDialog open={open} onOpenChange={setOpen} mode={mode} setMode={setMode} email={session?.email} onSubmit={submit} onLegacy={startLegacy}/>
 </>;
}

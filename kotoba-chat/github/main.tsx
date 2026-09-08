import { useCallback, useEffect, useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import OjiisanApp from "../app/ojiisan-app";
import { SERVER_ORIGIN } from "../lib/frontend-config";
import "../app/globals.css";
type Session={token:string;expiresAt:number};
const KEY="ojiisan-session",PENDING="ojiisan-pending-login";
const random=()=>btoa(String.fromCharCode(...crypto.getRandomValues(new Uint8Array(32)))).replaceAll("+","-").replaceAll("/","_").replaceAll("=","");
const proof=async(value:string)=>btoa(String.fromCharCode(...new Uint8Array(await crypto.subtle.digest("SHA-256",new TextEncoder().encode(value))))).replaceAll("+","-").replaceAll("/","_").replaceAll("=","");
function GithubApp() {
 const [session,setSession]=useState<Session|null>(null),[signInPath,setSignInPath]=useState(""),[loading,setLoading]=useState(true),[error,setError]=useState("");
 const started=useRef(false);
 const prepareLogin=useCallback(async()=>{
  const verifier=random(),state=random();sessionStorage.setItem(PENDING,JSON.stringify({verifier,state,createdAt:Date.now()}));
  setSignInPath(SERVER_ORIGIN+"/connect?"+new URLSearchParams({challenge:await proof(verifier),state}));
 },[]);
 useEffect(()=>{
  if(started.current)return;started.current=true;
  void(async()=>{try{
   const hash=new URLSearchParams(location.hash.slice(1)),code=hash.get("code");
   if(code){
    history.replaceState(null,"",location.pathname+location.search);
    const pending=JSON.parse(sessionStorage.getItem(PENDING)||"null");sessionStorage.removeItem(PENDING);
    if(!pending||pending.state!==hash.get("state")||Date.now()-pending.createdAt>10*60*1000)throw new Error("A entrada expirou. Toque em Entrar para tentar novamente.");
    const response=await fetch(SERVER_ORIGIN+"/api/frontend-session",{method:"POST",credentials:"omit",headers:{"Content-Type":"application/json"},body:JSON.stringify({action:"exchange",code,verifier:pending.verifier})});
    const value=await response.json();if(!response.ok||!/^[A-Za-z0-9_-]{43}$/.test(value.token||"")||!Number.isFinite(value.expiresAt)||value.expiresAt<=Date.now())throw new Error("Não foi possível concluir a entrada. Tente novamente.");
    sessionStorage.setItem(KEY,JSON.stringify(value));setSession(value);
   }else{
    const value=JSON.parse(sessionStorage.getItem(KEY)||"null");
    if(value?.expiresAt>Date.now()&&/^[A-Za-z0-9_-]{43}$/.test(value.token||""))setSession(value);else sessionStorage.removeItem(KEY);
   }
  }catch(e){setError(e instanceof Error?e.message:"Não foi possível entrar agora.");try{sessionStorage.removeItem(KEY);}catch{}}finally{setLoading(false);try{await prepareLogin();}catch{setError("O navegador precisa permitir armazenamento nesta aba para entrar. Você pode estudar sem entrar.");}}})();
 },[prepareLogin]);
 const clear=useCallback(()=>{try{sessionStorage.removeItem(KEY);}catch{}setSession(null);void prepareLogin().catch(()=>setError("Permita o armazenamento nesta aba para entrar novamente."));},[prepareLogin]);
 useEffect(()=>{const expired=()=>{clear();setError("Sua sessão terminou. Entre novamente para continuar a conversa.");};window.addEventListener("ojiisan-session-expired",expired);return()=>window.removeEventListener("ojiisan-session-expired",expired);},[clear]);
 useEffect(()=>{if(!session)return;const timer=setTimeout(()=>clear(),Math.max(0,session.expiresAt-Date.now()));return()=>clearTimeout(timer);},[session,clear]);
 const signOut=async()=>{const token=session?.token;clear();if(token)try{await fetch(SERVER_ORIGIN+"/api/frontend-session",{method:"POST",credentials:"omit",headers:{"Content-Type":"application/json",Authorization:"Bearer "+token},body:JSON.stringify({action:"logout"})});}catch{/* The tab no longer retains its credential; server expiry still applies. */}};
 if(loading)return <main className="app-opening" role="status"><span aria-hidden="true">👴</span><p>Abrindo o Ojiisan Chat…</p></main>;
 return <>{error&&<div className="connection-notice" role="alert">{error}<button onClick={()=>setError("")}>Fechar</button></div>}<OjiisanApp key={session?.token||"guest"} signedIn={!!session} signInPath={signInPath} signOutPath="#" apiOrigin={SERVER_ORIGIN} sessionToken={session?.token} onSignOut={()=>void signOut()}/></>;
}
createRoot(document.getElementById("root")!).render(<GithubApp/>);

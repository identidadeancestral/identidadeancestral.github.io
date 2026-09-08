import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { requireChatGPTUser } from "../chatgpt-auth";
import { getChatDb } from "@/db/chat-db";
import { issueFrontendCode, validProof } from "@/lib/frontend-session";
import { FRONTEND_URL } from "@/lib/frontend-config";
export const dynamic="force-dynamic";
async function Connect({challenge,state}:{challenge:string;state:string}) {
 const returnTo="/connect?"+new URLSearchParams({challenge,state});
 await requireChatGPTUser(returnTo);
 const authKey=(await headers()).get("oai-authenticated-user-id");
 if(!authKey)return <p>Não foi possível identificar sua conta. Volte e entre novamente.</p>;
 let code:string;
 try{code=await issueFrontendCode(getChatDb(),authKey,challenge);}
 catch{return <main style={{padding:32}}><h1>Não foi possível conectar agora.</h1><p>Tente entrar novamente em alguns minutos.</p><a href={FRONTEND_URL}>Voltar ao Ojiisan Chat</a></main>;}
 redirect(FRONTEND_URL+"#"+new URLSearchParams({code,state}));
}
export default async function ConnectPage({searchParams}:{searchParams:Promise<Record<string,string|string[]|undefined>>}) {
 const params=await searchParams;
 if(!validProof(params.challenge)||!validProof(params.state))return <main style={{padding:32}}><h1>Entre pelo Ojiisan Chat</h1><a href={FRONTEND_URL}>Abrir o app</a></main>;
 return <Connect challenge={params.challenge} state={params.state}/>;
}

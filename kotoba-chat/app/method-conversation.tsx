"use client";
import { useState } from "react";
import { ChevronRight, MessageCircle, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { compose, type Lang, type MessagePayload } from "@/lib/vocabulary";
import { methodDialogue } from "@/lib/method-dialogue";
import MessageBlocks, { MessageExplanation } from "./message-blocks";
export default function MethodConversation({lang,onUse}:{lang:Lang;onUse:(p:MessagePayload)=>void}) {
 const [visible,setVisible]=useState(2),t=(pt:string,en:string)=>lang==="pt"?pt:en;
 return <div className="method-conversation">
  <p>{t("Roteiro de prática: duas pessoas se apresentam, falam de gostos e combinam um café. A e B são papéis do exemplo.","Practice script: two people introduce themselves, talk about likes and arrange a coffee. A and B are example roles.")}</p>
  <div className="method-dialogue" role="log" aria-live="polite">{methodDialogue.slice(0,visible).map((turn,i)=><article key={i} className={"dialogue-turn speaker-"+turn.speaker}><small>{t("Pessoa ","Person ")+turn.speaker}</small><MessageBlocks payload={turn.payload} lang={lang}/><p>{compose(turn.payload)[lang]}</p><MessageExplanation payload={turn.payload} lang={lang}/><Button variant="ghost" size="sm" onClick={()=>onUse(turn.payload)}><MessageCircle/>{t("Usar minha versão","Use my version")}</Button></article>)}</div>
  {visible<methodDialogue.length?<Button className="full-button" onClick={()=>setVisible(n=>Math.min(n+2,methodDialogue.length))}>{t("Ver a próxima troca","See the next exchange")}<ChevronRight/></Button>:<><p className="lesson-small">{t("Este roteiro mostra uma conversa possível com a base. Para avaliar seu aprendizado, troque as palavras, tente sem tradução e converse com outra pessoa.","This script shows a possible conversation using the foundation. To assess your learning, change the words, try without translation and talk to another person.")}</p><Button variant="outline" onClick={()=>setVisible(2)}><RotateCcw/>{t("Recomeçar","Start over")}</Button></>}
 </div>;
}

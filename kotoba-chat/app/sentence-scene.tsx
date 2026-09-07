"use client";
import { useEffect, useState } from "react";
import { Play, RotateCcw, Pause } from "lucide-react";
import { Button } from "@/components/ui/button";
import { compose, lexicon, type Lang, type MessagePayload } from "@/lib/vocabulary";

export default function SentenceScene({payload,lang,autoPlay=false,writing=true}:{payload:MessagePayload;lang:Lang;autoPlay?:boolean;writing?:boolean}) {
  const [playing,setPlaying]=useState(false);
  const [take,setTake]=useState(0);
  const [open,setOpen]=useState(autoPlay);
  const [reduced,setReduced]=useState(false);
  useEffect(()=>{const query=window.matchMedia("(prefers-reduced-motion: reduce)");setReduced(query.matches);const change=()=>setReduced(query.matches);query.addEventListener("change",change);return()=>query.removeEventListener("change",change);},[]);
  useEffect(()=>{if(autoPlay&&!reduced){setOpen(true);setPlaying(true);}},[autoPlay,reduced]);
  useEffect(()=>{if(!playing)return;const timer=setTimeout(()=>setPlaying(false),4400);return()=>clearTimeout(timer);},[playing,take]);
  if(payload.kind!=="visual")return null;
  const t=(pt:string,en:string)=>lang==="pt"?pt:en;
  const sentence=compose(payload),kind=payload.template;
  const noun=payload.noun?lexicon[payload.noun]:null;
  const question=!!payload.question||["where","what-see"].includes(kind);
  const icons:Record<string,string>={see:"👀",drink:"🥤",eat:"🍽️",go:"🚶",like:"💚",where:"🔎","what-see":"👀",hello:"👋",thanks:"🙏",yes:"👍",no:"🙅",again:"🔁"};
  const explain:Record<string,[string,string]>={
    see:["O olhar encontra a figura.","The gaze finds the picture."],
    drink:["A bebida chega à pessoa.","The drink reaches the person."],
    eat:["O alimento vai até a pessoa.","The food reaches the person."],
    go:["A pessoa se desloca até o destino.","The person moves to the destination."],
    like:["O coração associa a pessoa ao que ela gosta.","The heart links the person to what they like."],
    where:["A pergunta procura a localização.","The question asks for the location."],
    "what-see":["O olhar procura: o que você vê?","The gaze searches: what do you see?"],
    hello:["Um gesto para cumprimentar.","A gesture to greet someone."],
    thanks:["Um gesto de agradecimento.","A gesture of thanks."],
    yes:["Uma resposta afirmativa.","An affirmative answer."],
    no:["Uma resposta negativa.","A negative answer."],
    again:["O movimento pede uma repetição.","The motion asks for a repetition."],
  };
  const play=()=>{setOpen(true);setTake(n=>n+1);setPlaying(true);};
  return <div className="sentence-scene">
    {!open?<button className="scene-open" onClick={play}><Play/>{t("Ver a frase em movimento","See the sentence move")}</button>:<>
      <div key={take} className={"scene-stage scene-"+kind+(!reduced?" animated":"")+(playing?" playing":"")} role="img" aria-label={sentence[lang]+" "+(explain[kind]?.[lang==="pt"?0:1]||"")}>
        <div className="scene-floor" aria-hidden="true"/>
        {noun||kind==="what-see"?<>
          <span className="scene-actor" aria-hidden="true">{kind==="go"?"🚶":"🧑"}</span>
          <span className="scene-target" aria-hidden="true">{noun?.icon||"❔"}</span>
          {kind!=="go"&&<span className="scene-action" aria-hidden="true">{icons[kind]}</span>}
          {question&&<span className="scene-question" aria-hidden="true">?</span>}
        </>:<span className="scene-expression" aria-hidden="true">{icons[kind]||"💬"}</span>}
        {writing&&<div className="scene-subtitle" lang="ja">{sentence.japanese}</div>}
      </div>
      <div className="scene-controls"><span>{question?t("Cena de uma pergunta","A question scene"):t("Cena da frase","Sentence scene")}</span><Button variant="ghost" size="sm" onClick={()=>playing?setPlaying(false):play()} aria-label={playing?t("Pausar cena","Pause scene"):t("Repetir cena","Replay scene")}>{playing?<Pause/>:<RotateCcw/>}{playing?t("Pausar","Pause"):t("Repetir","Replay")}</Button></div>
      {reduced&&<p className="scene-reduced">{t("Movimento reduzido conforme a preferência do seu aparelho.","Motion reduced according to your device preference.")}</p>}
    </>}
  </div>;
}

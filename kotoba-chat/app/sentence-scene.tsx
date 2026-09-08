"use client";
import { useEffect, useState } from "react";
import { Play, RotateCcw, Pause, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { compose, sentenceWords, templates, type Lang, type MessagePayload } from "@/lib/vocabulary";
import { storyById } from "@/lib/stories";

export default function SentenceScene({payload,lang,autoPlay=false,writing=true}:{payload:MessagePayload;lang:Lang;autoPlay?:boolean;writing?:boolean}) {
 const [playing,setPlaying]=useState(false),[open,setOpen]=useState(autoPlay),[step,setStep]=useState(0),[take,setTake]=useState(0),[reduced,setReduced]=useState(false);
 const signature=JSON.stringify(payload),sentence=compose(payload),words=sentenceWords(payload);
 const supported=payload.kind==="visual"||payload.kind==="story";
 useEffect(()=>{const q=window.matchMedia("(prefers-reduced-motion: reduce)");setReduced(q.matches);const change=()=>setReduced(q.matches);q.addEventListener("change",change);return()=>q.removeEventListener("change",change);},[]);
 useEffect(()=>{setStep(0);setPlaying(false);},[signature]);
 useEffect(()=>{if(autoPlay){setOpen(true);setPlaying(!reduced);}else setPlaying(false);},[autoPlay,reduced,signature]);
 useEffect(()=>{if(!playing||!supported)return;const timer=setTimeout(()=>{if(step>=words.length-1)setPlaying(false);else setStep(n=>n+1);},1800);return()=>clearTimeout(timer);},[playing,step,words.length,take,supported]);
 if(!supported)return null;
 const t=(pt:string,en:string)=>lang==="pt"?pt:en;
 const story=payload.kind==="story"?storyById[payload.story]:undefined;
 const kind=payload.kind==="visual"?payload.template:story!.scene;
 const scene=({sun:"see",tea:"drink",park:"go",book:"read"} as Record<string,string>)[kind]||kind;
 const current=words[Math.min(step,words.length-1)];
 const targetIndex=story?story.words.findIndex(w=>["story-sun","story-tea","story-park","story-book"].includes(w.id)):payload.kind==="visual"&&payload.noun?words.findIndex(w=>w.id===payload.noun):kind==="what-see"?0:-1;
 const target=words[targetIndex];
 const template=payload.kind==="visual"?templates.find(x=>x.id===kind):null;
 const actionIndex=story?words.length-1:template?words.findIndex(w=>w.id===template.ending):kind==="what-see"?2:0;
 const wakeIndex=words.findIndex(w=>w.id==="story-wake"),homeIndex=words.findIndex(w=>w.id==="story-house");
 const grammarIndex=targetIndex>=0?words.findIndex((w,i)=>i>targetIndex&&w.grammar):-1;
 const acting=step>=actionIndex,awakened=wakeIndex>=0&&step>=wakeIndex;
 const icons:Record<string,string>={see:"👀",drink:"🥤",eat:"🍽️",go:"🚶",read:"👀",like:"💚",where:"🔎","what-see":"👀",hello:"👋",thanks:"🙏",yes:"👍",no:"🙅",again:"🔁"};
 const replay=()=>{setOpen(true);setStep(0);setTake(n=>n+1);setPlaying(!reduced);};
 return <div className="sentence-scene">
  {!open?<button className="scene-open" onClick={replay}><Play/>{t("Ver a frase em movimento","See the sentence move")}</button>:<>
   <div key={take} className={"film-stage film-"+scene+(acting?" film-acting":"")+(awakened?" film-awake":"")+(playing&&!reduced?" film-playing":"")} role="img" aria-label={sentence[lang]+" · "+current[lang]}>
    {story&&<span className="film-date" aria-hidden="true">📅 {t("hoje","today")}</span>}
    {homeIndex>=0&&step>=homeIndex&&<span className="film-home" aria-hidden="true">🏠</span>}
    {targetIndex>=0?<>
     {wakeIndex>=0&&step>=wakeIndex&&<span className="film-bed" aria-hidden="true">🛏️</span>}
     {(!story||wakeIndex<0||step>=wakeIndex)&&<span className="film-person" aria-hidden="true">{scene==="go"?"🚶":wakeIndex>=0&&!acting?"🙋":"🧑"}</span>}
     {step>=targetIndex&&<span className="film-target" aria-hidden="true">{target?.icon||"❓"}</span>}
     {grammarIndex>=0&&step>=grammarIndex&&<span className="film-relation" aria-hidden="true">{words[grammarIndex].icon}</span>}
     {acting&&scene!=="go"&&<span className="film-action" aria-hidden="true">{icons[scene]||"💬"}</span>}
    </>:<span className="film-expression" aria-hidden="true">{icons[scene]||current.icon}</span>}
    {writing&&<span className="film-active-word" lang="ja">{current.jp}</span>}
   </div>
   <div className="film-sequence" aria-label={t("Ordem dos blocos em japonês. Toque para ver um trecho.","Japanese block order. Tap to view a step.")}>{words.map((w,i)=><button key={w.id+i} className={i===step?"current":i<step?"seen":""} aria-current={i===step?"step":undefined} aria-label={w.jp+" · "+w[lang]} onClick={()=>{setStep(i);setPlaying(false);}}><span aria-hidden="true">{w.icon}</span>{writing&&<span lang="ja">{w.jp}</span>}</button>)}</div>
   <div className="scene-controls"><span>{step+1}/{words.length} · {story?t("Sequência no passado","Past sequence"):t("Ordem japonesa","Japanese order")}</span><div className="film-buttons"><Button variant="ghost" size="sm" onClick={()=>{if(step===words.length-1&&!playing)replay();else setPlaying(!playing);}} disabled={reduced} aria-label={playing?t("Pausar cena","Pause scene"):t("Reproduzir cena","Play scene")}>{playing?<Pause/>:<Play/>}{playing?t("Pausar","Pause"):t("Reproduzir","Play")}</Button><Button variant="ghost" size="icon" onClick={()=>{setStep(n=>Math.min(n+1,words.length-1));setPlaying(false);}} disabled={step===words.length-1} aria-label={t("Próximo bloco","Next block")}><ChevronRight/></Button><Button variant="ghost" size="icon" onClick={replay} aria-label={t("Recomeçar cena","Replay scene")}><RotateCcw/></Button></div></div>
   {reduced&&<p className="scene-reduced">{t("Movimento reduzido. Avance tocando nos blocos.","Reduced motion. Tap the blocks to advance.")}</p>}
  </>}
 </div>;
}

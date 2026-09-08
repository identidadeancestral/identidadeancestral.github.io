"use client";
import { useId } from "react";
import { Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { methodPatterns,patternById,defaultBlocks,methodChoices,methodNoun,methodPlaces,methodForms,hasForm,hasQuestion,composeBlocks,type BlocksPayload } from "@/lib/method-blocks";
import { entryById } from "@/lib/study-data";
import type { Lang } from "@/lib/vocabulary";
import MessageBlocks from "./message-blocks";
export default function BlockComposer({value,onChange,lang,showPattern=true,preview=true,onSend,busy=false}:{value:BlocksPayload;onChange:(p:BlocksPayload)=>void;lang:Lang;showPattern?:boolean;preview?:boolean;onSend?:()=>void;busy?:boolean}) {
 const t=(pt:string,en:string)=>lang==="pt"?pt:en,id=useId(),pattern=patternById[value.pattern],choices=methodChoices(value.pattern,value.verb);
 let valid=true;try{composeBlocks(value);}catch{valid=false;}
 const patch=(p:Partial<BlocksPayload>)=>onChange({...value,...p});
 const select=(label:string,current:string|undefined,items:{id:string;label:string}[],change:(v:string)=>void)=><div className="block-field"><Label>{label}</Label><Select value={current} onValueChange={change}><SelectTrigger aria-label={label}><SelectValue/></SelectTrigger><SelectContent>{items.map(v=><SelectItem key={v.id} value={v.id}>{v.label}</SelectItem>)}</SelectContent></Select></div>;
 return <div className="block-composer">
  <div className="block-fields">
   {showPattern&&select(t("O que quero dizer","What I want to say"),value.pattern,methodPatterns.map(p=>({id:p.id,label:String(p.number).padStart(2,"0")+" · "+p[lang]})),p=>onChange(defaultBlocks(p)))}
   {pattern.verbs.length>1&&select(t("Verbo","Verb"),value.verb,pattern.verbs.map(v=>({id:v,label:entryById["verb:"+v].jp+" · "+entryById["verb:"+v][lang]})),verb=>patch({verb,slot:methodChoices(value.pattern,verb)[0]}))}
   {value.pattern==="location"&&select(t("Onde acontece","Where it happens"),value.place,methodPlaces.map(v=>({id:v,label:methodNoun(v).jp+" · "+methodNoun(v)[lang]})),place=>patch({place}))}
   {!!choices.length&&select(value.pattern==="go"?t("Destino","Destination"):value.pattern==="like"?t("Do que gosto","What I like"):t("Qual palavra","Which word"),value.slot,choices.map(v=>({id:v,label:methodNoun(v).jp+" · "+methodNoun(v)[lang]})),slot=>patch({slot}))}
   {hasForm(value.pattern)&&select(t("Forma do verbo","Verb form"),value.form,methodForms.map(v=>({id:v.id,label:v[lang]})),form=>patch({form}))}
   {value.pattern==="introduce"&&<div className="block-field"><Label htmlFor={id+"-name"}>{t("Seu nome · kana ou letras latinas","Your name · kana or Latin letters")}</Label><Input id={id+"-name"} value={value.name||""} maxLength={40} onChange={e=>patch({name:e.target.value})}/></div>}
  </div>
  {hasQuestion(value.pattern)&&<div className="block-options"><div><Switch id={id+"-q"} checked={!!value.question} onCheckedChange={question=>patch({question,...(question?{topic:false}:{})})}/><Label htmlFor={id+"-q"}>{t("Fazer pergunta","Ask a question")}</Label></div><div><Switch id={id+"-topic"} checked={!!value.topic} disabled={value.question} onCheckedChange={topic=>patch({topic})}/><Label htmlFor={id+"-topic"}>{t("Incluir 私は (eu)","Include 私は (I)")}</Label></div></div>}
  {preview&&valid&&<MessageBlocks payload={value} lang={lang}/>}
  {!valid&&<p className="block-input-error" role="status">{t("Complete o nome ou confira as peças antes de continuar.","Complete the name or check the pieces before continuing.")}</p>}
  {onSend&&<Button className="block-send" disabled={busy||!valid} onClick={onSend}><Send/>{t("Enviar estes blocos","Send these blocks")}</Button>}
 </div>;
}

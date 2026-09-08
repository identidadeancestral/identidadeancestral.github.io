"use client";
import { useEffect, useState } from "react";
import { compose, type Lang, type MessagePayload, type Word } from "@/lib/vocabulary";
import { blockWords, blockLabel, messageExplanation } from "@/lib/block-analysis";
import { roleNames } from "@/lib/method-blocks";

export function BlockLegend({lang}:{lang:Lang}) {
 return <div className="block-legend" aria-label={lang==="pt"?"Cores e funções dos blocos":"Block colors and roles"}>{(["noun","particle","verb","adjective"] as const).map(role=><span className={"role-"+role} key={role}>{roleNames[role][lang==="pt"?0:1]}</span>)}</div>;
}
export default function MessageBlocks({payload,lang,reading=false,plain=false,onWord}:{payload:MessagePayload;lang:Lang;reading?:boolean;plain?:boolean;onWord?:(w:Word)=>void}) {
 const [selected,setSelected]=useState<Word|null>(null),signature=JSON.stringify(payload);
 useEffect(()=>setSelected(null),[signature]);
 const c=compose(payload),words=blockWords(payload);
 if(!words.length||plain)return <p className="plain-message" lang={words.length?"ja":undefined} dir="auto">{c.japanese}</p>;
 const groups:Word[][]=[];for(const w of words){if(w.role==="particle"&&groups.length)groups.at(-1)!.push(w);else groups.push([w]);}
 return <div className="block-message">
  <div className="message-blocks" aria-label={c.japanese}>{groups.map((group,i)=><span className="block-unit" key={i}>{group.map((w,j)=><button type="button" key={w.id+j} className={"language-block role-"+w.role} onClick={()=>onWord?onWord(w):setSelected(selected?.id===w.id?null:w)} aria-label={w.jp+" · "+blockLabel(w,lang)+" · "+w[lang]}><small className={w.role==="particle"?"sr-only":undefined}>{blockLabel(w,lang)}</small><strong lang="ja">{w.jp}</strong>{reading&&<span className="block-kana" lang="ja">{w.kana}</span>}</button>)}</span>)}</div>
  {selected&&<p className="block-word-note" role="status"><strong lang="ja">{selected.jp}</strong> · {selected[lang]}{(lang==="pt"?selected.notePt:selected.noteEn)?" — "+(lang==="pt"?selected.notePt:selected.noteEn):""}</p>}
 </div>;
}
export function MessageExplanation({payload,lang,initialOpen=false}:{payload:MessagePayload;lang:Lang;initialOpen?:boolean}) {
 const [open,setOpen]=useState(initialOpen),detail=messageExplanation(payload,lang);
 if(!detail)return null;
 const words=blockWords(payload),c=compose(payload);
 const groups:Word[][]=[];for(const w of words){if(w.role==="particle"&&groups.length)groups.at(-1)!.push(w);else groups.push([w]);}
 return <details className="block-explanation" open={open} onToggle={e=>setOpen(e.currentTarget.open)}><summary>{lang==="pt"?"Como foi montada":"How it was built"}</summary><div>
  <p className="block-source">{detail.source}{detail.page?" · PDF p. "+detail.page:""}</p>
  {detail.formula&&<p className="block-formula" lang="ja">{detail.formula}</p>}
  <p>{detail.summary}</p>
  <ol className="block-breakdown">{groups.map((g,i)=><li key={i}><strong lang="ja">{g.map(w=>w.jp).join("")}</strong><span>{g[0][lang]}{g.length>1?" · "+g.slice(1).map(w=>w[lang]).join("; "):" · "+blockLabel(g[0],lang)}</span></li>)}</ol>
  <div className="block-full-reading"><p lang="ja">{words.map(w=>w.kana).join(" ")}</p><p>{c.romaji}</p><p>{c[lang]}</p></div>
 </div></details>;
}

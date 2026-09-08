"use client";
import { useEffect, useMemo, useState } from "react";
import { BookOpen, Search, Send, ArrowLeft, ExternalLink } from "lucide-react";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { entries, entryById, type Category } from "@/lib/study-data";
import { formsFor, romanize, entryNote } from "@/lib/japanese";
import type { Lang, MessagePayload } from "@/lib/vocabulary";
export const EBOOK_URL="https://hotmart.com/pt-br/club/toshiro-umeda";
export default function WordLibrary({open,onOpenChange,lang,onUse,busy,initialEntry}:{open:boolean;onOpenChange:(v:boolean)=>void;lang:Lang;onUse:(p:MessagePayload)=>void;busy:boolean;initialEntry?:string}) {
 const t=(pt:string,en:string)=>lang==="pt"?pt:en;
 const [category,setCategory]=useState<Category>("verb"),[query,setQuery]=useState("");
 const [selected,setSelected]=useState<string>(""),[formId,setFormId]=useState("dictionary"),[reveal,setReveal]=useState(true);
 useEffect(()=>{if(open){if(initialEntry&&entryById[initialEntry]){setSelected(initialEntry);setCategory(entryById[initialEntry].category);setFormId("dictionary");}else setSelected("");setReveal(true);}},[open,initialEntry]);
 const list=useMemo(()=>{const clean=(s:string)=>s.normalize("NFD").replace(/[\u0300-\u036f]/g,"").toLowerCase();const q=clean(query.trim());return entries.filter(e=>e.category===category&&clean([e.jp,e.kana,e.pt,e.en,romanize(e.kana)].join(" ")).includes(q));},[category,query]);
 const entry=selected?entryById[selected]:undefined;
 const forms=entry?formsFor(entry):[],form=forms.find(f=>f.id===formId)||forms[0];
 const choose=(id:string)=>{setSelected(id);setFormId(entryById[id].category==="noun"?"dictionary":"polite");setReveal(true);};
 return <Sheet open={open} onOpenChange={onOpenChange}><SheetContent className="vocabulary-sheet"><SheetHeader><SheetTitle><BookOpen/>{t("300 palavras em imagens","300 words in pictures")}</SheetTitle><SheetDescription>{t("Escolha uma palavra, descubra suas formas e use no chat.","Choose a word, explore its forms and use it in the chat.")}</SheetDescription></SheetHeader>
  <div className="vocabulary-body">
   <Tabs value={category} onValueChange={v=>{setCategory(v as Category);setSelected("");setQuery("");}}><TabsList className="vocabulary-tabs"><TabsTrigger value="verb">{t("Verbos","Verbs")} <span>100</span></TabsTrigger><TabsTrigger value="noun">{t("Substantivos","Nouns")} <span>100</span></TabsTrigger><TabsTrigger value="adjective">{t("Adjetivos","Adjectives")} <span>100</span></TabsTrigger></TabsList></Tabs>
   {entry?<section className="study-detail">
    <Button variant="ghost" onClick={()=>setSelected("")}><ArrowLeft/>{t("Voltar às palavras","Back to words")}</Button>
    <div className="study-word-heading"><span className="study-illustration" aria-hidden="true">{entry.icon}</span><div><span className="study-group">{entry.group==="na"?t("Adjetivo な","な adjective"):entry.group==="i"?t("Adjetivo い","い adjective"):entry.group==="noun"?t("Substantivo","Noun"):entry.group==="suru"||entry.group==="kuru"?t("Verbo irregular","Irregular verb"):entry.group==="godan"?"Godan · 1":"Ichidan · 2"}</span><h2 lang="ja">{entry.jp}</h2><p lang="ja">{entry.kana}</p><p>{romanize(entry.kana)}</p></div></div>
    <div className="study-recall">{reveal?<><strong>{entry[lang]}</strong><p>{entryNote(entry,lang)}</p></>:<p>{t("O que significa? Diga a palavra em voz alta antes de revelar.","What does it mean? Say the word aloud before revealing.")}</p>}<Button variant="outline" onClick={()=>setReveal(!reveal)}>{reveal?t("Esconder o sentido","Hide meaning"):t("Revelar e conferir","Reveal and check")}</Button></div>
    {forms.length>1&&<><h3>{t("Escolha a forma","Choose the form")}</h3><div className="conjugation-grid" role="group" aria-label={t("Flexões da palavra","Word forms")}>{forms.map(f=><button key={f.id} className={form.id===f.id?"selected":""} aria-pressed={form.id===f.id} onClick={()=>setFormId(f.id)}><span>{f[lang]}</span><strong lang="ja">{f.jp}</strong><small lang="ja">{f.kana}</small></button>)}</div><p className="study-note">{t("A forma て liga construções; sozinha não significa sempre “fazendo”. Presente e futuro dependem do contexto. A linha “antes de um substantivo” precisa do substantivo depois.","The て form connects constructions; it does not always mean “doing”. Nonpast meaning depends on context. The “before a noun” form needs a following noun.")}</p></>}
    <Button className="study-use" size="lg" disabled={busy} onClick={()=>{onUse({kind:"word",entry:entry.id,form:form.id});onOpenChange(false);}}><Send/>{t("Usar esta palavra no chat","Use this word in chat")}<span lang="ja">{form.jp}</span></Button>
    <p className="study-note">{t("Envia a palavra na forma escolhida. Para enviar uma frase completa com cena, use “Frases em cenas”.", "Sends the word in the selected form. For a full sentence with a scene, use “Sentence scenes”.")}</p>
   </section>:<><div className="vocabulary-search"><Search/><Input aria-label={t("Buscar palavra","Find a word")} placeholder={t("Busque em português, japonês ou romaji…","Search English, Japanese or romaji…")} value={query} onChange={e=>setQuery(e.target.value)}/></div><p className="vocabulary-count">{list.length} {t("palavras","words")}</p><div className="vocabulary-grid">{list.map(e=><button key={e.id} onClick={()=>choose(e.id)}><span aria-hidden="true">{e.icon}</span><strong lang="ja">{e.jp}</strong><small>{e[lang]}</small></button>)}</div>{!list.length&&<p role="status">{t("Nenhuma palavra encontrada. Tente outra leitura ou sentido.","No word found. Try another reading or meaning.")}</p>}</>}
   <details className="method-note"><summary>{t("Como praticar com o Método 100 Blocos","Practice with Método 100 Blocos")}</summary><p>{t("Primeiro, veja e compreenda. Depois esconda a tradução, tente lembrar e use a palavra numa frase. Volte a ela em outros dias e em situações diferentes.","First look and understand. Then hide the translation, recall and use the word in a sentence. Return to it on later days and in different situations.")}</p><p>{t("As figuras são pistas de memória. Os kana registram sons e as partículas indicam relações na frase. Os ícones não substituem a escrita japonesa.","Pictures are memory cues. Kana record sounds and particles mark relationships in a sentence. Icons do not replace Japanese writing.")}</p><a href={EBOOK_URL} target="_blank" rel="noopener noreferrer">{t("Conhecer o ebook de Wagner Toshiro Umeda","Explore Wagner Toshiro Umeda’s ebook")}<ExternalLink/></a></details>
  </div>
 </SheetContent></Sheet>;
}

"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { BookOpen, ChevronRight, Headphones, Languages, MessageCircle, RotateCcw, Check, Eye, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import ChatApp from "./chat-app";
import SentenceScene from "./sentence-scene";
import WordLibrary, { EBOOK_URL } from "./word-library";
import { stories } from "@/lib/stories";
import { compose, sentenceWords, type Lang, type MessagePayload } from "@/lib/vocabulary";
import { jsonRequest, type AccessProps } from "@/lib/client-api";
type Review={story_id:string;step:number;due_at:number};
const titles:Record<string,[string,string]>={"today-sun":["Acordar e olhar o sol","Wake up and see the sun"],"today-tea":["Acordar e beber chá","Wake up and drink tea"],"today-park":["Ir ao parque","Go to the park"],"today-book":["Ler em casa","Read at home"]};
function shuffled(length:number) {const list=Array.from({length},(_,i)=>i);for(let i=length-1;i>0;i--){const j=crypto.getRandomValues(new Uint32Array(1))[0]%(i+1);[list[i],list[j]]=[list[j],list[i]];}return list.every((v,i)=>v===i)?list.reverse():list;}
export default function OjiisanApp(access:AccessProps) {
 const [lang,setLang]=useState<Lang>("pt"),[view,setView]=useState("learn"),[storyId,setStoryId]=useState("today-sun");
 const [stage,setStage]=useState<"watch"|"build"|"recall">("watch"),[reading,setReading]=useState(false),[meaning,setMeaning]=useState(false),[order,setOrder]=useState<number[]>([]),[bank,setBank]=useState<number[]>([]),[correct,setCorrect]=useState(false);
 const [feedback,setFeedback]=useState(""),[library,setLibrary]=useState(false),[reviews,setReviews]=useState<Review[]>([]),[saving,setSaving]=useState(false),[reviewError,setReviewError]=useState("");
 const [voices,setVoices]=useState<SpeechSynthesisVoice[]>([]),[speaking,setSpeaking]=useState(false),[chatVisited,setChatVisited]=useState(false),[seed,setSeed]=useState<{payload:MessagePayload;id:number}>();
 const [profileRequest,setProfileRequest]=useState(0);
 const utterance=useRef<SpeechSynthesisUtterance|null>(null);
 const t=(pt:string,en:string)=>lang==="pt"?pt:en;
 const story=stories.find(s=>s.id===storyId)!,payload:MessagePayload={kind:"story",story:storyId},words=sentenceWords(payload);
 useEffect(()=>{try{const value=localStorage.getItem("kotoba-language");if(value==="en"||value==="pt")setLang(value);}catch{}},[]);
 useEffect(()=>{document.documentElement.lang=lang==="pt"?"pt-BR":"en";try{localStorage.setItem("kotoba-language",lang);}catch{}},[lang]);
 useEffect(()=>{if(!("speechSynthesis" in window))return;const refresh=()=>setVoices(window.speechSynthesis.getVoices().filter(v=>v.lang.toLowerCase().startsWith("ja")));refresh();window.speechSynthesis.addEventListener("voiceschanged",refresh);return()=>{window.speechSynthesis.removeEventListener("voiceschanged",refresh);window.speechSynthesis.cancel();};},[]);
 const loadReviews=useCallback(async()=>{if(!access.signedIn){setReviews([]);return;}try{const result=await jsonRequest("/api/study",undefined,access.apiOrigin,access.sessionToken);setReviews(result.progress||[]);setReviewError("");}catch{setReviewError(lang==="pt"?"Não foi possível carregar suas revisões. Tente novamente.":"Could not load your reviews. Try again.");}},[access.signedIn,access.apiOrigin,access.sessionToken,lang]);
 useEffect(()=>{void loadReviews();},[loadReviews]);
 const reset=(id:string)=>{setStoryId(id);setStage("watch");setReading(false);setMeaning(false);setOrder([]);setCorrect(false);setFeedback("");if("speechSynthesis" in window)window.speechSynthesis.cancel();setSpeaking(false);};
 const goChat=(p?:MessagePayload)=>{if(p)setSeed({payload:p,id:Date.now()});setChatVisited(true);setView("chat");};
 const listen=()=>{
  if(!voices.length){setFeedback(t("Seu aparelho não disponibilizou uma voz japonesa. A leitura escrita continua disponível.","Your device has not provided a Japanese voice. Written readings remain available."));return;}
  window.speechSynthesis.cancel();const u=new SpeechSynthesisUtterance(story.jp);u.lang="ja-JP";u.voice=voices[0];u.rate=.8;u.onend=()=>setSpeaking(false);u.onerror=()=>{setSpeaking(false);setFeedback(t("Não foi possível reproduzir o áudio neste aparelho.","Audio could not play on this device."));};utterance.current=u;setSpeaking(true);window.speechSynthesis.speak(u);
 };
 const startBuild=()=>{setStage("build");setOrder([]);setBank(shuffled(words.length));setCorrect(false);setFeedback("");};
 const check=()=>{const ok=order.length===words.length&&order.every((v,i)=>v===i);setCorrect(ok);setFeedback(ok?t("Você montou a frase na ordem japonesa.","You built the sentence in Japanese order."):t("Comece por 今日. Mantenha cada partícula depois da palavra que ela marca e a ação final no fim.","Start with 今日. Keep each particle after the word it marks, and the final action at the end."));};
 const review=async(rating:"again"|"remembered")=>{
  if(!access.signedIn){setFeedback(t("Treino concluído. Entre na sua conta para guardar as revisões.","Practice complete. Sign in to save your reviews."));return;}
  setSaving(true);try{const result=await jsonRequest("/api/study",{storyId,rating},access.apiOrigin,access.sessionToken);await loadReviews();setFeedback(t("Revisão salva. Próxima: ","Review saved. Next: ")+new Date(result.dueAt).toLocaleString(lang==="pt"?"pt-BR":"en",{dateStyle:"short",timeStyle:"short"}));}catch{setFeedback(t("Não foi possível salvar. Tente novamente.","Could not save. Try again."));}finally{setSaving(false);}
 };
 const due=reviews.filter(r=>r.due_at<=Date.now());
 return <div className="ojiisan-app">
  <header className="simple-header"><a href="#" className="simple-brand" onClick={e=>{e.preventDefault();setView("learn");}}><span aria-hidden="true">👴</span><div><strong>Ojiisan Chat</strong><small>{t("Japonês, uma frase por vez","Japanese, one sentence at a time")}</small></div></a><div className="simple-account"><Button variant="ghost" size="icon" onClick={()=>setLang(lang==="pt"?"en":"pt")} aria-label={t("Mudar para inglês","Switch to Portuguese")}><Languages/></Button>{!access.signedIn?<Button asChild disabled={!access.signInPath}><a href={access.signInPath||undefined} target="_top">{t("Entrar","Sign in")}</a></Button>:<Button variant="outline" onClick={()=>{goChat();setProfileRequest(Date.now());}}>{t("Meu perfil","My profile")}</Button>}</div></header>
  <nav className="simple-nav" aria-label={t("Navegação principal","Main navigation")}><Tabs value={view} onValueChange={v=>{if(v==="chat")setChatVisited(true);setView(v);}}><TabsList><TabsTrigger value="learn"><BookOpen/>{t("Aprender","Learn")}</TabsTrigger><TabsTrigger value="chat"><MessageCircle/>{t("Conversar","Chat")}</TabsTrigger></TabsList></Tabs><Button variant="ghost" onClick={()=>setLibrary(true)}><BookOpen/><span>{t("Palavras","Words")}</span></Button></nav>
  {view==="learn"&&<main className="learning-page">
   <div className="lesson-top"><div><span className="lesson-eyebrow">{t("UMA CENA DO DIA A DIA","AN EVERYDAY SCENE")}</span><h1>{t("Entenda. Monte. Lembre.","Understand. Build. Recall.")}</h1></div><Select value={storyId} onValueChange={reset}><SelectTrigger aria-label={t("Escolher uma cena","Choose a scene")}><SelectValue/></SelectTrigger><SelectContent>{stories.map((s,i)=><SelectItem key={s.id} value={s.id}>{i+1}. {titles[s.id][lang==="pt"?0:1]}</SelectItem>)}</SelectContent></Select></div>
   {due.length>0&&<button className="review-due" onClick={()=>reset(due[0].story_id)}><RotateCcw/>{t("Você tem ","You have ")+due.length+t(" cena(s) para revisar."," scene(s) to review.")}<ChevronRight/></button>}
   {reviewError&&<div className="lesson-feedback" role="status">{reviewError}<Button variant="ghost" onClick={()=>void loadReviews()}>{t("Tentar novamente","Retry")}</Button></div>}
   <ol className="lesson-steps" aria-label={t("Etapas do aprendizado","Learning steps")}>{[["watch",t("Ver a cena","Watch")],["build",t("Montar a frase","Build")],["recall",t("Lembrar","Recall")]].map(([id,label],i)=><li key={id} aria-current={stage===id?"step":undefined}><span>{i+1}</span>{label}</li>)}</ol>
   <section className="lesson-card" aria-label={story[lang]}>
    {stage==="watch"?<>
     <div className="lesson-instruction"><h2>{t("Veja o sentido aparecer.","Watch the meaning appear.")}</h2><p>{t("Acompanhe os blocos da esquerda para a direita.","Follow the blocks from left to right.")}</p></div>
     <SentenceScene key={story.id} payload={payload} lang={lang} autoPlay writing/>
     <div className="lesson-japanese" lang="ja">{words.map(w=><ruby key={w.id}>{w.jp}{reading&&<rt>{w.kana}</rt>}</ruby>)}<span>。</span></div>
     <p className="lesson-meaning">{story[lang]}</p>
     <div className="lesson-tools"><Button variant="outline" onClick={listen}><Headphones/>{speaking?t("Repetir áudio","Replay audio"):t("Ouvir devagar","Listen slowly")}</Button><Button variant="ghost" onClick={()=>setReading(!reading)}><Eye/>{reading?t("Esconder leitura","Hide reading"):t("Mostrar leitura","Show reading")}</Button></div>
     <details className="lesson-grammar"><summary>{t("Por que essa ordem?","Why this order?")}</summary><p>{lang==="pt"?story.notePt:story.noteEn}</p><p>{t("As imagens são pistas. As partículas, como を, mostram a relação entre as palavras.","Pictures are cues. Particles such as を show relationships between words.")}</p></details>
     <Button size="lg" className="lesson-primary" onClick={startBuild}>{t("Agora vou montar","Now I’ll build it")}<ArrowRight/></Button>
    </>:stage==="build"?<>
     <div className="lesson-instruction"><h2>{t("Monte a frase em japonês.","Build the Japanese sentence.")}</h2><p>{story[lang]}</p></div>
     <div className="sentence-slots" aria-label={t("Sua frase; toque em um bloco para retirar","Your sentence; tap a block to remove it")}>{order.length?order.map((n,i)=><button key={n} onClick={()=>{setOrder(order.filter((_,j)=>j!==i));setCorrect(false);setFeedback("");}}><span>{words[n].icon}</span><strong lang="ja">{words[n].jp}</strong></button>):<p>{t("Toque nas peças abaixo para começar.","Tap the pieces below to start.")}</p>}</div>
     <div className="sentence-bank" role="group" aria-label={t("Peças disponíveis","Available pieces")}>{bank.map(n=><button key={n} disabled={order.includes(n)} onClick={()=>{setOrder([...order,n]);setFeedback("");}}><span>{words[n].icon}</span><strong lang="ja">{words[n].jp}</strong></button>)}</div>
     <div className="lesson-tools"><Button variant="ghost" onClick={()=>{setStage("watch");setFeedback("");}}><Eye/>{t("Ver a cena outra vez","Watch again")}</Button><Button variant="ghost" onClick={startBuild}><RotateCcw/>{t("Recomeçar","Start over")}</Button></div>
     {correct?<Button size="lg" className="lesson-primary" onClick={()=>{setStage("recall");setMeaning(false);setFeedback("");}}><Check/>{t("Tentar sem as pistas","Try without the cues")}</Button>:<Button size="lg" className="lesson-primary" disabled={order.length!==words.length} onClick={check}>{t("Conferir minha frase","Check my sentence")}<Check/></Button>}
    </>:<>
     <div className="lesson-instruction"><h2>{t("Agora, sem as figuras.","Now, without pictures.")}</h2><p>{t("Leia em voz alta e diga o sentido. Depois confira.","Read aloud and say the meaning. Then check.")}</p></div>
     <p className="recall-japanese" lang="ja">{story.jp}</p>
     {meaning?<div className="recall-answer"><p>{story[lang]}</p><p lang="ja">{words.map(w=>w.kana).join(" ")}</p></div>:<Button variant="outline" className="recall-reveal" onClick={()=>setMeaning(true)}><Eye/>{t("Revelar e comparar","Reveal and compare")}</Button>}
     <div className="review-actions"><Button size="lg" variant="outline" disabled={!meaning||saving} onClick={()=>void review("again")}><RotateCcw/>{t("Preciso rever","Review again")}</Button><Button size="lg" disabled={!meaning||saving} onClick={()=>void review("remembered")}><Check/>{t("Lembrei","Remembered")}</Button></div>
     {!access.signedIn&&<p className="lesson-small">{t("Você pode praticar sem conta. Entre para salvar suas revisões.","You can practice without an account. Sign in to save your reviews.")}</p>}
     <Button variant="ghost" onClick={()=>reset(stories[(stories.findIndex(s=>s.id===storyId)+1)%stories.length].id)}>{t("Próxima cena","Next scene")}<ChevronRight/></Button>
    </>}
    {feedback&&<p className="lesson-feedback" role="status">{feedback}</p>}
   </section>
   <div className="lesson-next"><Button variant="outline" onClick={()=>goChat(payload)}><MessageCircle/>{t("Usar esta frase numa conversa","Use this sentence in a conversation")}</Button><Button variant="ghost" onClick={()=>setLibrary(true)}><BookOpen/>{t("Explorar as 300 palavras","Explore the 300 words")}</Button></div>
   <footer className="learning-footer"><a href={EBOOK_URL} target="_blank" rel="noopener noreferrer">{t("Conheça o ebook Método 100 Blocos","Explore the Método 100 Blocos ebook")}<ChevronRight/></a><span>Wagner Toshiro Umeda</span></footer>
  </main>}
  {chatVisited&&<div hidden={view!=="chat"} className="simple-chat"><ChatApp {...access} langOverride={lang} composeSeed={seed} profileRequest={profileRequest}/></div>}
  <WordLibrary open={library} onOpenChange={setLibrary} lang={lang} busy={false} onUse={goChat}/>
 </div>;
}

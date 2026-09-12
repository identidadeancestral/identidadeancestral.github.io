"use client";
import { useCallback, useEffect, useState } from "react";
import { BookOpen, ChevronRight, Headphones, Languages, MessageCircle, RotateCcw, Check, Eye, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import ChatApp from "./chat-app";
import SentenceScene from "./sentence-scene";
import WordLibrary, { EBOOK_URL } from "./word-library";
import BlockComposer from "./block-composer";
import MessageBlocks, { BlockLegend, MessageExplanation } from "./message-blocks";
import MethodConversation from "./method-conversation";
import VisitCounter from "./visit-counter";
import { stories } from "@/lib/stories";
import { compose, type Lang, type MessagePayload } from "@/lib/vocabulary";
import { defaultBlocks, methodPatterns, patternById, type BlocksPayload } from "@/lib/method-blocks";
import { blockWords, blockLabel } from "@/lib/block-analysis";
import { jsonRequest, type AccessProps } from "@/lib/client-api";
type Review={story_id:string;step:number;due_at:number};
function shuffled(length:number) {const a=Array.from({length},(_,i)=>i);for(let i=length-1;i>0;i--){const j=crypto.getRandomValues(new Uint32Array(1))[0]%(i+1);[a[i],a[j]]=[a[j],a[i]];}return a.every((v,i)=>v===i)?a.reverse():a;}
export default function OjiisanApp(access:AccessProps) {
 const [lang,setLang]=useState<Lang>("pt"),[view,setView]=useState(access.signedIn?"chat":"learn"),[lessonId,setLessonId]=useState("method:location"),[draft,setDraft]=useState<BlocksPayload>(()=>defaultBlocks());
 const [stage,setStage]=useState<"watch"|"build"|"recall">("watch"),[reading,setReading]=useState(false),[meaning,setMeaning]=useState(false),[order,setOrder]=useState<number[]>([]),[bank,setBank]=useState<number[]>([]),[correct,setCorrect]=useState(false);
 const [feedback,setFeedback]=useState(""),[library,setLibrary]=useState(false),[reviews,setReviews]=useState<Review[]>([]),[saving,setSaving]=useState(false),[reviewError,setReviewError]=useState("");
 const [voices,setVoices]=useState<SpeechSynthesisVoice[]>([]),[speaking,setSpeaking]=useState(false),[chatVisited,setChatVisited]=useState(access.signedIn),[seed,setSeed]=useState<{payload:MessagePayload;id:number}>(),[profileRequest,setProfileRequest]=useState(0),[example,setExample]=useState(false);
 const t=(pt:string,en:string)=>lang==="pt"?pt:en;
 const isMethod=lessonId.startsWith("method:"),pattern=isMethod?patternById[lessonId.slice(7)]:undefined;
 const rawPayload:MessagePayload=isMethod?draft:{kind:"story",story:lessonId};
 let valid=true,payload=rawPayload;try{compose(payload);}catch{valid=false;payload=defaultBlocks(draft.pattern);}
 const sentence=compose(payload),words=blockWords(payload);
 useEffect(()=>{try{const value=localStorage.getItem("kotoba-language");if(value==="en"||value==="pt")setLang(value);}catch{}},[]);
 useEffect(()=>{document.documentElement.lang=lang==="pt"?"pt-BR":"en";try{localStorage.setItem("kotoba-language",lang);}catch{}},[lang]);
 useEffect(()=>{if(!("speechSynthesis" in window))return;const refresh=()=>setVoices(window.speechSynthesis.getVoices().filter(v=>v.lang.toLowerCase().startsWith("ja")));refresh();window.speechSynthesis.addEventListener("voiceschanged",refresh);return()=>{window.speechSynthesis.removeEventListener("voiceschanged",refresh);window.speechSynthesis.cancel();};},[]);
 const loadReviews=useCallback(async()=>{if(!access.signedIn){setReviews([]);return;}try{const result=await jsonRequest("/api/study",undefined,access.apiOrigin,access.sessionToken);setReviews(result.progress||[]);setReviewError("");}catch{setReviewError(lang==="pt"?"Não foi possível carregar suas revisões. Tente novamente.":"Could not load your reviews. Try again.");}},[access.signedIn,access.apiOrigin,access.sessionToken,lang]);
 useEffect(()=>{void loadReviews();},[loadReviews]);
 const clearLesson=()=>{setStage("watch");setReading(false);setMeaning(false);setOrder([]);setCorrect(false);setFeedback("");if("speechSynthesis" in window)window.speechSynthesis.cancel();setSpeaking(false);};
 const reset=(id:string)=>{setLessonId(id);if(id.startsWith("method:"))setDraft(defaultBlocks(id.slice(7)));clearLesson();};
 const goChat=(p?:MessagePayload)=>{if(p)setSeed({payload:p,id:Date.now()});setExample(false);setChatVisited(true);setView("chat");};
 const listen=()=>{if(!voices.length){setFeedback(t("Seu aparelho não disponibilizou uma voz japonesa. Use a leitura escrita.","Your device has not provided a Japanese voice. Use the written reading."));return;}window.speechSynthesis.cancel();const u=new SpeechSynthesisUtterance(sentence.japanese);u.lang="ja-JP";u.voice=voices[0];u.rate=.8;u.onend=()=>setSpeaking(false);u.onerror=()=>{setSpeaking(false);setFeedback(t("Não foi possível reproduzir o áudio neste aparelho.","Audio could not play on this device."));};setSpeaking(true);window.speechSynthesis.speak(u);};
 const startBuild=()=>{setStage("build");setOrder([]);setBank(shuffled(words.length));setCorrect(false);setFeedback("");};
 const check=()=>{const ok=order.length===words.length&&order.every((v,i)=>v===i);setCorrect(ok);setFeedback(ok?t("Você reconstruiu o molde. Agora tente entender sem as pistas.","You rebuilt the pattern. Now try understanding it without cues."):t("Nesta atividade, siga a ordem do molde: partícula depois da palavra que ela marca; predicado no fim, antes de か quando houver pergunta. O japonês admite outras ordens em certos contextos.","In this activity, follow the pattern: a particle follows the word it marks; the predicate comes at the end, before か in a question. Japanese permits other orders in some contexts."));};
 const review=async(rating:"again"|"remembered")=>{if(!access.signedIn){setFeedback(t("Treino concluído. Entre para guardar suas revisões.","Practice complete. Sign in to save your reviews."));return;}setSaving(true);try{const r=await jsonRequest("/api/study",{storyId:lessonId,rating},access.apiOrigin,access.sessionToken);await loadReviews();setFeedback(t("Revisão salva. Próxima: ","Review saved. Next: ")+new Date(r.dueAt).toLocaleString(lang==="pt"?"pt-BR":"en",{dateStyle:"short",timeStyle:"short"}));}catch{setFeedback(t("Não foi possível salvar. Tente novamente.","Could not save. Try again."));}finally{setSaving(false);}};
 const lessons=[...methodPatterns.map(p=>({id:"method:"+p.id,title:String(p.number).padStart(2,"0")+" · "+p[lang]})),...stories.map(s=>({id:s.id,title:t("História · ","Story · ")+s[lang]}))];
 const due=reviews.filter(r=>r.due_at<=Date.now()&&lessons.some(l=>l.id===r.story_id));
 return <div className="ojiisan-app blocks-edition">
  <header className="simple-header"><a href="#" className="simple-brand" onClick={e=>{e.preventDefault();setView("learn");}}><span lang="ja" aria-hidden="true">百</span><div><strong>Ojiisan Chat</strong><small>{t("Japonês com o Método 100 Blocos","Japanese with Método 100 Blocos")}</small></div></a><div className="simple-account"><Button variant="ghost" size="icon" onClick={()=>setLang(lang==="pt"?"en":"pt")} aria-label={t("Mudar para inglês","Switch to Portuguese")}><Languages/></Button>{!access.signedIn?<Button onClick={access.onSignIn}>{t("Entrar","Sign in")}</Button>:<Button variant="outline" onClick={()=>{goChat();setProfileRequest(Date.now());}}>{t("Meu perfil","My profile")}</Button>}</div></header>
  <nav className="simple-nav" aria-label={t("Navegação principal","Main navigation")}><Tabs value={view} onValueChange={v=>{if(v==="chat")setChatVisited(true);setView(v);}}><TabsList><TabsTrigger value="learn"><BookOpen/>{t("Aprender","Learn")}</TabsTrigger><TabsTrigger value="chat"><MessageCircle/>{t("Conversar","Chat")}</TabsTrigger></TabsList></Tabs><Button variant="ghost" onClick={()=>setLibrary(true)}><BookOpen/><span>{t("Palavras","Words")}</span></Button></nav>
  {view==="learn"&&<main className="learning-page">
   <div className="lesson-top"><div><span className="lesson-eyebrow">{t("DO MOLDE À CONVERSA","FROM PATTERN TO CONVERSATION")}</span><h1>{t("Troque as peças. Diga sua ideia.","Change the pieces. Say your idea.")}</h1></div><Select value={lessonId} onValueChange={reset}><SelectTrigger aria-label={t("Escolher um molde","Choose a pattern")}><SelectValue/></SelectTrigger><SelectContent>{lessons.map(l=><SelectItem key={l.id} value={l.id}>{l.title}</SelectItem>)}</SelectContent></Select></div>
   <Button variant="outline" className="try-conversation" onClick={()=>setExample(true)}><MessageCircle/>{t("Ver uma conversa com essa base","See a conversation using this foundation")}<ChevronRight/></Button>
   {due.length>0&&<button className="review-due" onClick={()=>reset(due[0].story_id)}><RotateCcw/>{due.length+t(" lição(ões) para revisar."," lesson(s) to review.")}<ChevronRight/></button>}
   {reviewError&&<div className="lesson-feedback" role="status">{reviewError}<Button variant="ghost" onClick={()=>void loadReviews()}>{t("Tentar novamente","Retry")}</Button></div>}
   <ol className="lesson-steps" aria-label={t("Etapas do aprendizado","Learning steps")}>{[["watch",t("Entender","Understand")],["build",t("Montar","Build")],["recall",t("Lembrar","Recall")]].map(([id,label],i)=><li key={id} aria-current={stage===id?"step":undefined}><span>{i+1}</span>{label}</li>)}</ol>
   <section className="lesson-card" aria-label={sentence[lang]}>
    {stage==="watch"?<>
     <div className="lesson-instruction"><h2>{pattern?t("Bloco ","Block ")+String(pattern.number).padStart(2,"0")+" · "+pattern[lang]:t("Uma história em blocos","A story in blocks")}</h2><p>{t("Cada peça tem uma função. Toque para entender; troque uma palavra para mudar o sentido.","Each piece has a role. Tap to understand; change a word to change the meaning.")}</p></div>
     {isMethod&&<BlockComposer value={draft} onChange={p=>{setDraft(p);clearLesson();}} lang={lang} showPattern={false} preview={false}/>}
     <BlockLegend lang={lang}/>
     {valid&&<><MessageBlocks payload={payload} lang={lang} reading={reading}/><p className="lesson-meaning">{sentence[lang]}</p><MessageExplanation key={JSON.stringify(payload)} payload={payload} lang={lang} initialOpen/></>}
     <div className="lesson-tools"><Button variant="outline" disabled={!valid} onClick={listen}><Headphones/>{speaking?t("Repetir áudio","Replay audio"):t("Ouvir devagar","Listen slowly")}</Button><Button variant="ghost" onClick={()=>setReading(!reading)}><Eye/>{reading?t("Esconder leitura","Hide reading"):t("Mostrar leitura","Show reading")}</Button></div>
     {!isMethod&&<details className="optional-visuals"><summary>{t("Pistas visuais opcionais","Optional visual cues")}</summary><SentenceScene payload={payload} lang={lang}/></details>}
     <Button size="lg" className="lesson-primary" disabled={!valid} onClick={startBuild}>{t("Montar sem olhar o modelo","Build without looking at the model")}<ArrowRight/></Button>
    </>:stage==="build"?<>
     <div className="lesson-instruction"><h2>{t("Reconstrua este molde.","Rebuild this pattern.")}</h2><p>{sentence[lang]}</p></div>
     <div className="sentence-slots" aria-label={t("Sua frase; toque para retirar uma peça","Your sentence; tap to remove a piece")}>{order.length?order.map((n,i)=><button key={n} className={"role-"+words[n].role} onClick={()=>{setOrder(order.filter((_,j)=>j!==i));setCorrect(false);setFeedback("");}}><small>{blockLabel(words[n],lang)}</small><strong lang="ja">{words[n].jp}</strong></button>):<p>{t("Toque nas peças abaixo para começar.","Tap the pieces below to start.")}</p>}</div>
     <div className="sentence-bank" role="group" aria-label={t("Peças disponíveis","Available pieces")}>{bank.map(n=><button key={n} className={"role-"+words[n].role} disabled={order.includes(n)} onClick={()=>{setOrder([...order,n]);setFeedback("");}}><small>{blockLabel(words[n],lang)}</small><strong lang="ja">{words[n].jp}</strong></button>)}</div>
     <div className="lesson-tools"><Button variant="ghost" onClick={()=>{setStage("watch");setFeedback("");}}><Eye/>{t("Consultar o molde","Check the pattern")}</Button><Button variant="ghost" onClick={startBuild}><RotateCcw/>{t("Recomeçar","Start over")}</Button></div>
     {correct?<Button size="lg" className="lesson-primary" onClick={()=>{setStage("recall");setMeaning(false);setFeedback("");}}><Check/>{t("Tentar sem as pistas","Try without cues")}</Button>:<Button size="lg" className="lesson-primary" disabled={order.length!==words.length} onClick={check}>{t("Conferir minha frase","Check my sentence")}<Check/></Button>}
    </>:<>
     <div className="lesson-instruction"><h2>{t("Entenda sem cores nem tradução.","Understand without colors or translation.")}</h2><p>{t("Diga o sentido e explique a função de uma partícula. Depois confira.","Say the meaning and explain one particle's role. Then check.")}</p></div>
     <p className="recall-japanese" lang="ja">{sentence.japanese}</p>
     {meaning?<div className="recall-answer"><p>{sentence[lang]}</p><p lang="ja">{words.map(w=>w.kana).join(" ")}</p><MessageExplanation payload={payload} lang={lang}/></div>:<Button variant="outline" className="recall-reveal" onClick={()=>setMeaning(true)}><Eye/>{t("Revelar e comparar","Reveal and compare")}</Button>}
     <div className="review-actions"><Button size="lg" variant="outline" disabled={!meaning||saving} onClick={()=>void review("again")}><RotateCcw/>{t("Preciso rever","Review again")}</Button><Button size="lg" disabled={!meaning||saving} onClick={()=>void review("remembered")}><Check/>{t("Lembrei","Remembered")}</Button></div>
     {!access.signedIn&&<p className="lesson-small">{t("Pratique sem conta. Entre para salvar suas revisões.","Practice without an account. Sign in to save your reviews.")}</p>}
     <Button variant="ghost" onClick={()=>reset(lessons[(lessons.findIndex(l=>l.id===lessonId)+1)%lessons.length].id)}>{t("Próximo molde","Next pattern")}<ChevronRight/></Button>
    </>}
    {feedback&&<p className="lesson-feedback" role="status">{feedback}</p>}
   </section>
   <div className="lesson-next"><Button variant="outline" disabled={!valid} onClick={()=>goChat(payload)}><MessageCircle/>{t("Usar minha frase numa conversa","Use my sentence in a conversation")}</Button><Button variant="ghost" onClick={()=>setLibrary(true)}><BookOpen/>{t("Explorar as 400 palavras","Explore the 400 words")}</Button></div>
   <footer className="learning-footer"><a href={EBOOK_URL} target="_blank" rel="noopener noreferrer">{t("O método completo no ebook","The full method in the ebook")}<ChevronRight/></a><span>Wagner Toshiro Umeda</span><p>{t("10 moldes iniciais dos 100 blocos do livro. As cores são uma ajuda criada para o app.","10 starting patterns from the book's 100 blocks. Colors are an aid created for the app.")}</p></footer>
  </main>}
  {chatVisited&&<div hidden={view!=="chat"} className="simple-chat"><ChatApp {...access} enabled={view==="chat"} langOverride={lang} composeSeed={seed} profileRequest={profileRequest}/></div>}
  <VisitCounter lang={lang}/>
  <WordLibrary open={library} onOpenChange={setLibrary} lang={lang} busy={false} onUse={goChat}/>
  <Dialog open={example} onOpenChange={setExample}><DialogContent className="conversation-example-dialog"><DialogHeader><DialogTitle>{t("Uma conversa com poucos moldes","A conversation with a few patterns")}</DialogTitle><DialogDescription>{t("Exemplo guiado · personalize e depois use com outra pessoa.","Guided example · personalize it, then use it with another person.")}</DialogDescription></DialogHeader><MethodConversation lang={lang} onUse={goChat}/></DialogContent></Dialog>
 </div>;
}

"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { ArrowLeft, ArrowUpRight, BookOpen, Clapperboard, Check, ChevronRight, Globe2, Image, Languages, Leaf, LogOut, MessageCircle, Plus, Send, Settings2, Shield, Users, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { Empty, EmptyHeader, EmptyTitle, EmptyDescription } from "@/components/ui/empty";
import { Skeleton } from "@/components/ui/skeleton";
import { Toaster } from "@/components/ui/sonner";
import { toast } from "sonner";
import { avatars, compose, sentenceWords, lexicon, templates, type Lang, type MessagePayload, type Word } from "@/lib/vocabulary";
import SentenceScene from "./sentence-scene";
import { jsonRequest, type AccessProps } from "@/lib/client-api";
import WordLibrary, { EBOOK_URL } from "./word-library";
import { stories, storyById } from "@/lib/stories";
import { AlertDialog, AlertDialogContent, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogCancel, AlertDialogAction } from "@/components/ui/alert-dialog";

type Profile={id:string;nickname:string;language:string;level:string;avatar:string;available:number;last_seen:number;state?:string};
type Room={id:string;kind:string;title:string;owner_id:string;other_name:string;other_avatar:string;unread:number;last_message:string|null};
type Invite={id:string;kind:string;title:string;nickname:string;avatar:string};
type Message={id:number;user_id:string;nickname:string;avatar:string;payload:MessagePayload;japanese:string;created_at:number};
type Overview={me:Profile|null;rooms:Room[];people:Profile[];invitations:Invite[];blocks:Profile[]};
type RoomData={room:Room;messages:Message[];members:Profile[];hasOlder:boolean};
type Mode="pictures"|"bridge"|"japanese";
const initial:Overview={me:null,rooms:[],people:[],invitations:[],blocks:[]};
const errors:Record<string,[string,string]>={
  sign_in:["Sua sessão terminou. Entre novamente.","Your session ended. Please sign in again."],
  unavailable:["Não foi possível conectar agora. Tente novamente.","Could not connect right now. Please try again."],
  invalid_input:["Confira os campos e tente novamente.","Check the fields and try again."],
  choose_people:["Escolha pelo menos uma pessoa.","Choose at least one person."],
  wait_for_accept:["Aguarde a pessoa aceitar o convite.","Wait for your invitation to be accepted."],
  not_member:["Você não participa desta conversa.","You are not a member of this conversation."],
  owner_only:["Só quem administra o grupo pode convidar.","Only the group admin can invite people."],
  blocked:["Esta conversa está bloqueada.","This conversation is blocked."],
  invite_missing:["Este convite não está mais disponível.","This invitation is no longer available."],
  slow_down:["Espere um minuto antes de continuar.","Please wait a minute before continuing."],
  invite_cooldown:["Espere alguns minutos antes de convidar novamente.","Wait a few minutes before inviting again."],
  group_full:["O grupo chegou ao limite de 25 pessoas.","The group has reached its 25-person limit."],
  invalid_message:["Escolha uma frase e uma figura compatíveis.","Choose a matching phrase and picture."],
};
const levelText=(level:string,lang:Lang)=>({beginner:lang==="pt"?"Começando":"Beginner",learning:lang==="pt"?"Em prática":"Learning",advanced:lang==="pt"?"Avançado":"Advanced"}[level]||level);
function Choice({value,onChange,items,label,id}:{value:string;onChange:(v:string)=>void;items:{value:string;label:string}[];label:string;id?:string}) {
  return <Select value={value} onValueChange={onChange}><SelectTrigger id={id} aria-label={label}><SelectValue /></SelectTrigger><SelectContent>{items.map(i=><SelectItem key={i.value} value={i.value}>{i.label}</SelectItem>)}</SelectContent></Select>;
}
function Tokens({payload,mode,lang,onWord}:{payload:MessagePayload;mode:Mode;lang:Lang;onWord:(word:Word)=>void}) {
  const sentence=compose(payload);
  if(!sentence.tokens.length)return <p className="plain-message" dir="auto">{sentence.japanese}</p>;
  return <div className={"tokens mode-"+mode} lang="ja" aria-label={sentence.japanese}>{sentenceWords(payload).map((w,index)=>{
    return <button key={w.id+index} type="button" className={"word-token"+(w.grammar?" grammar-token":"")} onClick={()=>onWord(w)} aria-label={w.jp+" · "+w[lang]}>
      <span className="token-icon" aria-hidden="true">{w.icon}</span><span className="token-japanese">{w.jp}</span>
    </button>;
  })}</div>;
}
function ProfileForm({me,lang,onSave,busy}:{me:Profile|null;lang:Lang;onSave:(v:unknown)=>void;busy:boolean}) {
  const t=(pt:string,en:string)=>lang==="pt"?pt:en;
  const [nickname,setNickname]=useState(me?.nickname||"");
  const [language,setLanguage]=useState(me?.language||(lang==="pt"?"Português":"English"));
  const [level,setLevel]=useState(me?.level||"beginner");
  const [avatar,setAvatar]=useState(me?.avatar||"🌱");
  const [available,setAvailable]=useState(me?!!me.available:true);
  return <form className="profile-form" onSubmit={e=>{e.preventDefault();onSave({action:"profile",nickname,language,level,avatar,available});}}>
    <div className="avatar-choices" role="group" aria-label={t("Escolha um avatar","Choose an avatar")}>{avatars.map(a=><button type="button" key={a} aria-pressed={a===avatar} className={avatar===a?"picked":""} onClick={()=>setAvatar(a)} aria-label={a}>{a}</button>)}</div>
    <div className="field"><Label htmlFor="nickname">{t("Seu apelido","Your nickname")}</Label><Input id="nickname" value={nickname} onChange={e=>setNickname(e.target.value)} placeholder={t("Como quer ser chamado?","What should we call you?")} minLength={2} maxLength={32} required autoComplete="nickname"/></div>
    <div className="field"><Label htmlFor="native-language">{t("Idioma que você fala","Language you speak")}</Label><Input id="native-language" value={language} onChange={e=>setLanguage(e.target.value)} maxLength={40} minLength={2} required /></div>
    <div className="field"><Label htmlFor="japanese-level">{t("Seu japonês","Your Japanese")}</Label><Choice id="japanese-level" label={t("Seu japonês","Your Japanese")} value={level} onChange={setLevel} items={["beginner","learning","advanced"].map(value=>({value,label:levelText(value,lang)}))}/></div>
    <div className="switch-row"><div><Label htmlFor="profile-available">{t("Disponível para conversar","Available to chat")}</Label><p>{t("Seu apelido, idioma e nível aparecem para outras pessoas cadastradas.","Your nickname, language and level are visible to other registered people.")}</p></div><Switch id="profile-available" checked={available} onCheckedChange={setAvailable}/></div>
    <Button type="submit" size="lg" disabled={busy} className="full-button">{busy?t("Salvando…","Saving…"):me?t("Salvar perfil","Save profile"):t("Criar meu perfil","Create my profile")}<ArrowUpRight/></Button>
  </form>;
}
export default function ChatApp({signedIn,signInPath,signOutPath,apiOrigin,sessionToken,onSignOut,langOverride,composeSeed,profileRequest}:AccessProps & {langOverride?:Lang;profileRequest?:number;composeSeed?:{payload:MessagePayload;id:number}}) {
  const api=useCallback((path="",body?:unknown)=>jsonRequest("/api/chat"+path,body,apiOrigin,sessionToken),[apiOrigin,sessionToken]);
  const [lang,setLang]=useState<Lang>("pt");
  const t=useCallback((pt:string,en:string)=>lang==="pt"?pt:en,[lang]);
  const [mode,setMode]=useState<Mode>("bridge");
  const [data,setData]=useState<Overview>(initial);
  const [loading,setLoading]=useState(signedIn);
  const [error,setError]=useState("");
  const [tab,setTab]=useState("people");
  const [active,setActive]=useState("");
  const activeRef=useRef("");
  const [roomData,setRoomData]=useState<RoomData|null>(null);
  const [messages,setMessages]=useState<Message[]>([]);
  const messagesRef=useRef<Message[]>([]);
  const [roomLoading,setRoomLoading]=useState(false);
  const [busy,setBusy]=useState(false);
  const [profileOpen,setProfileOpen]=useState(false);
  const [groupOpen,setGroupOpen]=useState(false);
  const [membersOpen,setMembersOpen]=useState(false);
  const [groupName,setGroupName]=useState("");
  const [targets,setTargets]=useState<string[]>([]);
  const [word,setWord]=useState<Word|null>(null);
  const [reveal,setReveal]=useState(true);
  const [confirmLeave,setConfirmLeave]=useState(false);
  const [composeMode,setComposeMode]=useState("story");
  const [storyId,setStoryId]=useState("today-sun");
  const [libraryOpen,setLibraryOpen]=useState(false);
  const [studyEntry,setStudyEntry]=useState("");
  const [template,setTemplate]=useState("see");
  const [noun,setNoun]=useState("tree");
  const [question,setQuestion]=useState(false);
  const [text,setText]=useState("");
  const [practice,setPractice]=useState<Message[]>([]);
  const [mobileChat,setMobileChat]=useState(false);
  const [hasOlder,setHasOlder]=useState(false);
  const [olderBusy,setOlderBusy]=useState(false);
  const bottom=useRef<HTMLDivElement>(null);
  const pendingSend=useRef<{id:string;signature:string}|null>(null);
  const chosen=templates.find(x=>x.id===template)!;
  const draft:MessagePayload=composeMode==="text"?{kind:"text",text}:composeMode==="story"?{kind:"story",story:storyId}:{kind:"visual",template,noun,question};
  useEffect(()=>{if(composeSeed){const p=composeSeed.payload;if(p.kind==="story"){setStoryId(p.story);setComposeMode("story");}else{setText(compose(p).japanese);setComposeMode("text");}setMobileChat(true);}},[composeSeed]);
  useEffect(()=>{if(langOverride)setLang(langOverride);},[langOverride]);
  useEffect(()=>{if(profileRequest){setProfileOpen(true);setMobileChat(false);}},[profileRequest]);
  const me=data.me;
  const room=data.rooms.find(r=>r.id===active)||roomData?.room;
  const msgError=useCallback((e:unknown)=>(errors[e instanceof Error?e.message:"unavailable"]||errors.unavailable)[lang==="pt"?0:1],[lang]);
  useEffect(()=>{try{const l=localStorage.getItem("kotoba-language");if(langOverride)setLang(langOverride);else if(l==="en"||l==="pt")setLang(l);else if(!navigator.language.startsWith("pt"))setLang("en");const m=localStorage.getItem("kotoba-mode");if(["pictures","bridge","japanese"].includes(m||""))setMode(m as Mode);}catch{}},[langOverride]);
  useEffect(()=>{document.documentElement.lang=lang==="pt"?"pt-BR":"en";try{localStorage.setItem("kotoba-language",lang);localStorage.setItem("kotoba-mode",mode);}catch{}},[lang,mode]);
  const overview=useCallback(async()=>{const next=await api();setData({...initial,...next});setError("");setLoading(false);return next as Overview;},[api]);
  const updateMessages=useCallback((list:Message[])=>{messagesRef.current=list;setMessages(list);},[]);
  const openRoom=useCallback(async(id:string)=>{
    activeRef.current=id;setActive(id);setRoomData(null);updateMessages([]);setMobileChat(true);setRoomLoading(true);setHasOlder(false);setTab("chats");
    try{const result:RoomData=await api("?room="+encodeURIComponent(id));if(activeRef.current!==id)return;setRoomData(result);updateMessages(result.messages);setHasOlder(result.hasOlder);await api("",{action:"heartbeat",roomId:id,lastRead:result.messages.at(-1)?.id||0});}
    catch(e){if(activeRef.current===id){setError(msgError(e));}}
    finally{if(activeRef.current===id)setRoomLoading(false);}
  },[msgError,updateMessages,api]);
  const poll=useCallback(async()=>{
    const id=activeRef.current;
    if(!id)return;
    const after=messagesRef.current.at(-1)?.id||0;
    const result:RoomData=await api("?room="+encodeURIComponent(id)+"&after="+after);
    if(activeRef.current!==id)return;
    setRoomData(result);
    if(result.messages.length){const map=new Map(messagesRef.current.map(m=>[m.id,m]));result.messages.forEach(m=>map.set(m.id,m));updateMessages(Array.from(map.values()).sort((a,b)=>a.id-b.id));}
  },[updateMessages,api]);
  useEffect(()=>{
    if(!signedIn)return;
    let disposed=false,timer:ReturnType<typeof setTimeout>;
    const sync=async()=>{
      if(document.visibilityState==="hidden"){timer=setTimeout(sync,6000);return;}
      try{const result=await overview();if(result.me){await api("",{action:"heartbeat",roomId:activeRef.current,lastRead:messagesRef.current.at(-1)?.id||0});await poll();}}
      catch(e){if(!disposed){setError(msgError(e));setLoading(false);}}
      if(!disposed)timer=setTimeout(sync,5000);
    };
    void sync();
    return()=>{disposed=true;clearTimeout(timer);};
  },[signedIn,overview,poll,msgError,api]);
  useEffect(()=>{bottom.current?.scrollIntoView({behavior:"smooth",block:"end"});},[messages.at(-1)?.id,practice.length,active]);
  const act=async(body:unknown,success?:string)=>{
    setBusy(true);
    try{const result=await api("",body);await overview();if(success)toast.success(success);return result;}
    catch(e){toast.error(msgError(e));return null;}
    finally{setBusy(false);}
  };
  const showWord=(w:Word)=>{if(w.entryId){setStudyEntry(w.entryId);setLibraryOpen(true);}else{setWord(w);setReveal(true);}};
  const invitePerson=async(p:Profile)=>{
    const result=await act({action:"dm",targetId:p.id});
    if(result?.existing)await openRoom(result.roomId);
    else if(result?.incoming)toast.info(t("Você já recebeu um convite desta pessoa. Veja a aba Pessoas.","This person has invited you. Check the People tab."));
    else if(result)toast.success(t("Convite enviado. A conversa começa quando a pessoa aceitar.","Invitation sent. Chat starts when the person accepts."));
  };
  const send=async(payload:MessagePayload=draft)=>{
    if(payload.kind==="text"&&!payload.text.trim())return;
    if(!active) {
      const sentence=compose(payload);
      setPractice(p=>[...p,{id:Date.now(),user_id:"practice",nickname:t("Você","You"),avatar:me?.avatar||"🌱",payload,japanese:sentence.japanese,created_at:Date.now()}]);
      setText("");return;
    }
    const id=active,signature=JSON.stringify({id,payload});
    if(pendingSend.current?.signature!==signature)pendingSend.current={id:crypto.randomUUID(),signature};
    setBusy(true);
    try{await api("",{action:"send",roomId:id,payload,clientId:pendingSend.current.id});pendingSend.current=null;setText("");await poll();await overview();}
    catch(e){toast.error(msgError(e));}
    finally{setBusy(false);}
  };
  const practiceRoom=()=>{activeRef.current="";setActive("");setRoomData(null);updateMessages([]);setMobileChat(true);};
  const loadOlder=async()=>{
    const id=activeRef.current,first=messagesRef.current[0]?.id;if(!id||!first)return;setOlderBusy(true);
    try{const r:RoomData=await api("?room="+encodeURIComponent(id)+"&before="+first);if(activeRef.current===id){const map=new Map([...r.messages,...messagesRef.current].map(m=>[m.id,m]));updateMessages(Array.from(map.values()).sort((a,b)=>a.id-b.id));setHasOlder(r.hasOlder);}}catch(e){toast.error(msgError(e));}finally{setOlderBusy(false);}
  };
  const title=active?(room?.kind==="group"?room.title:room?.other_name||roomData?.members.find(p=>p.id!==me?.id)?.nickname||t("Conversa","Conversation")):t("Espaço de prática","Practice space");
  const onlineCount=data.people.length;
  const rendered=active?messages:practice;
  const demo:MessagePayload={kind:"story",story:"today-sun"};
  const dmWaiting=active&&room?.kind==="dm"&&roomData&&!roomData.members.some(p=>p.id!==me?.id&&p.state==="active");
  return <div className="app-frame">
    <Toaster position="top-center" richColors/>
    <div className={"chat-shell"+(mobileChat?" mobile-chat":"")}>
      <aside className="people-panel">
        <header className="brand-row"><div className="brand"><span className="brand-mark" aria-hidden="true">👴</span><div><strong>ojiisan<span className="brand-period">.</span></strong><span>CHAT · {t("JAPONÊS EM IMAGENS","JAPANESE IN PICTURES")}</span></div></div><Button variant="ghost" size="icon" aria-label={t("Mudar idioma para inglês","Switch language to Portuguese")} onClick={()=>setLang(lang==="pt"?"en":"pt")}><Languages/></Button></header>
        <div className="learning-shortcuts"><Button variant="outline" onClick={()=>{setStudyEntry("");setLibraryOpen(true);}}><BookOpen/>{t("300 palavras ilustradas","300 illustrated words")}</Button><a href={EBOOK_URL} target="_blank" rel="noopener noreferrer">{t("Conhecer o ebook · Método 100 Blocos","Explore the ebook · Método 100 Blocos")}<ArrowUpRight/></a></div>
        {!signedIn?<div className="join-panel"><span className="eyebrow">{t("UMA CONVERSA DE CADA VEZ","ONE CONVERSATION AT A TIME")}</span><h1>{t("Seu japonês ganha companhia.","Your Japanese finds company.")}</h1><p>{t("Encontre pessoas, forme grupos e converse usando figuras e palavras japonesas.","Meet people, make groups and chat using pictures and Japanese words.")}</p><Button asChild size="lg" className="full-button"><a href={signInPath} target="_top">{t("Entrar com ChatGPT","Sign in with ChatGPT")}<ArrowUpRight/></a></Button><p className="small-note">{t("Na primeira entrada, você cria seu perfil. Seu e-mail não aparece para as outras pessoas.","On your first visit, create your profile. Your email is not shown to other people.")}</p><Button variant="outline" onClick={practiceRoom}>{t("Experimentar as figuras","Try the pictures")}<ChevronRight/></Button></div>
        :loading?<div className="loading-list" aria-label={t("Carregando","Loading")}><Skeleton className="h-16 w-full"/><Skeleton className="h-24 w-full"/><Skeleton className="h-24 w-full"/></div>
        :!me?<div className="onboarding"><span className="eyebrow">{t("PRIMEIRA VISITA","FIRST VISIT")}</span><h1>{t("Como vamos chamar você?","What should we call you?")}</h1>{error&&<p role="alert" className="error-banner">{error}</p>}<ProfileForm me={null} lang={lang} busy={busy} onSave={async value=>{await act(value);}}/></div>
        :<>
          <div className="panel-intro"><h1>{t("Conversar","Chat")}</h1><Button variant="outline" size="icon" aria-label={t("Criar grupo","Create group")} onClick={()=>setGroupOpen(true)}><Plus/></Button></div>
          <Tabs value={tab} onValueChange={setTab} className="directory-tabs"><TabsList className="directory-tabs-list"><TabsTrigger value="people"><Globe2/>{t("Pessoas","People")}{onlineCount>0&&<span className="count">{onlineCount}</span>}</TabsTrigger><TabsTrigger value="chats"><MessageCircle/>{t("Conversas","Chats")}{data.rooms.some(r=>r.unread>0)&&<span className="unread-dot"/>}</TabsTrigger></TabsList>
            <TabsContent value="people" className="directory-content">
              {data.invitations.length>0&&<section className="invites"><h2>{t("Convites para você","Your invitations")} <span>{data.invitations.length}</span></h2>{data.invitations.map(inv=><article className="invite-card" key={inv.id}><span className="avatar">{inv.avatar}</span><div><strong>{inv.kind==="group"?inv.title:inv.nickname}</strong><p>{inv.kind==="group"?t("Convite de ","Invited by ")+inv.nickname:t("Quer conversar com você","Would like to chat")}</p><div className="invite-actions"><Button size="sm" disabled={busy} onClick={async()=>{const r=await act({action:"accept",roomId:inv.id});if(r)await openRoom(inv.id);}}>{t("Aceitar","Accept")}</Button><Button size="sm" variant="ghost" disabled={busy} onClick={()=>act({action:"decline",roomId:inv.id})}>{t("Agora não","Not now")}</Button></div></div></article>)}</section>}
              <div className="section-label"><span className="online-dot"/>{t("Disponíveis agora","Available now")}</div>
              {!data.people.length?<Empty className="quiet-empty"><EmptyHeader><Globe2 className="empty-icon"/><EmptyTitle>{t("A primeira conversa começa com um convite.","A first conversation starts with an invitation.")}</EmptyTitle><EmptyDescription>{t("Ninguém disponível neste momento. Compartilhe o endereço do app com alguém e experimente juntos.","Nobody is available right now. Share the app address with someone and try it together.")}</EmptyDescription></EmptyHeader><Button variant="outline" onClick={async()=>{try{await navigator.clipboard.writeText(location.origin);toast.success(t("Link copiado.","Link copied."));}catch{toast.info(t("Copie o endereço da barra do navegador.","Copy the address from your browser."));}}}>{t("Copiar link do app","Copy app link")}</Button></Empty>:data.people.map(p=><article className="person-row" key={p.id}><span className="avatar">{p.avatar}<span className="online-dot"/></span><div className="person-info"><strong>{p.nickname}</strong><span>{p.language} · {levelText(p.level,lang)}</span></div><Button variant="ghost" size="icon" disabled={busy} onClick={()=>invitePerson(p)} aria-label={t("Convidar ","Invite ")+p.nickname}><MessageCircle/></Button></article>)}
            </TabsContent>
            <TabsContent value="chats" className="directory-content">{!data.rooms.length?<Empty className="quiet-empty"><EmptyHeader><MessageCircle className="empty-icon"/><EmptyTitle>{t("Suas conversas ficam aqui.","Your chats live here.")}</EmptyTitle><EmptyDescription>{t("Convide alguém na aba Pessoas ou crie um grupo.","Invite someone from People or create a group.")}</EmptyDescription></EmptyHeader></Empty>:data.rooms.map(r=><button key={r.id} onClick={()=>openRoom(r.id)} className={"conversation-row"+(active===r.id?" selected":"")}><span className="avatar">{r.kind==="group"?<Users/>:r.other_avatar||"🌱"}</span><div className="person-info"><strong>{r.kind==="group"?r.title:r.other_name}</strong><span lang="ja">{r.last_message||t("Conversa criada","Conversation created")}</span></div>{r.unread>0&&<span className="unread-count">{r.unread>99?"99+":r.unread}</span>}</button>)}</TabsContent>
          </Tabs>
          <button className={"practice-link"+(!active?" selected":"")} onClick={practiceRoom}><span className="practice-leaf"><Leaf/></span><div><strong>{t("Espaço de prática","Practice space")}</strong><span>{t("Experimente antes de conversar","Try it before you chat")}</span></div><ChevronRight/></button>
          <footer className="profile-footer"><button onClick={()=>setProfileOpen(true)} className="profile-button"><span className="avatar">{me.avatar}</span><div><strong>{me.nickname}</strong><span>{me.available?t("Disponível","Available"):t("Invisível","Invisible")}</span></div><Settings2/></button><Switch checked={!!me.available} aria-label={t("Disponível para conversar","Available to chat")} onCheckedChange={available=>void act({action:"availability",available})}/></footer>
        </>}
      </aside>
      <main className="conversation-panel">
        <header className="conversation-header"><Button variant="ghost" size="icon" className="mobile-back" onClick={()=>setMobileChat(false)} aria-label={t("Voltar","Back")}><ArrowLeft/></Button><div className="conversation-heading"><span className="avatar">{active?(room?.kind==="group"?<Users/>:room?.other_avatar||"🌱"):<Leaf/>}</span><div><h2>{title}</h2><p>{active?t("Conversa entre participantes","Conversation between members"):t("Só você · sem envio para outras pessoas","Only you · nothing is sent to other people")}</p></div></div>{active&&<Button variant="ghost" size="icon" onClick={()=>setMembersOpen(true)} aria-label={t("Participantes e opções","Members and options")}><Users/></Button>}<span className="header-japanese" lang="ja">ことば</span></header>
        <div className="reading-bar"><span><Image/>{t("Como você lê","How you read")}</span><Choice label={t("Modo de leitura","Reading mode")} value={mode} onChange={v=>setMode(v as Mode)} items={[{value:"pictures",label:t("Figuras","Pictures")},{value:"bridge",label:t("Figuras + japonês","Pictures + Japanese")},{value:"japanese",label:t("Só japonês","Japanese only")}]}/></div>
        {error&&<div className="error-banner" role="alert">{error}<Button variant="ghost" size="sm" onClick={async()=>{try{await overview();if(active)await openRoom(active);}catch(e){setError(msgError(e));}}}>{t("Tentar de novo","Try again")}</Button></div>}
        <div className="message-stream" role="log" aria-label={t("Mensagens","Messages")} aria-live="polite">
          {!active&&<div className="practice-intro"><h2>{t("A frase ganha uma cena.","The sentence becomes a scene.")}</h2><p>{t("Veja os acontecimentos na ordem japonesa. Toque em um bloco para descobrir seu sentido.","See events in Japanese order. Tap a block to discover its meaning.")}</p><div className="example-bubble"><span className="bubble-label">{t("EXEMPLO","EXAMPLE")}</span>{mode!=="japanese"&&<SentenceScene payload={demo} lang={lang} autoPlay writing={mode==="bridge"}/>}<Tokens payload={demo} mode={mode} lang={lang} onWord={showWord}/><details><summary>{t("Revelar leitura e sentido","Reveal reading and meaning")}</summary><p lang="ja">{sentenceWords(demo).map(w=>w.kana).join(" ")}</p><p>{compose(demo).romaji}</p><p>{compose(demo)[lang]}</p><p>{lang==="pt"?storyById["today-sun"].notePt:storyById["today-sun"].noteEn}</p></details></div></div>}
          {active&&roomLoading?<div className="message-loading"><Skeleton className="h-24 w-64"/><Skeleton className="ml-auto h-20 w-52"/></div>:active&&!rendered.length?<Empty><EmptyHeader><EmptyTitle>{dmWaiting?t("Convite enviado.","Invitation sent."):t("Sua primeira palavra pode ser um olá.","Your first word could be hello.")}</EmptyTitle><EmptyDescription>{dmWaiting?t("Aguarde a pessoa aceitar para começar a conversa.","Wait for the person to accept before chatting."):t("Escolha uma figura ou use uma das expressões abaixo.","Choose a picture or use one of the expressions below.")}</EmptyDescription></EmptyHeader></Empty>:null}
          {hasOlder&&active&&<Button variant="ghost" onClick={loadOlder} disabled={olderBusy} className="older-button">{t("Carregar mensagens anteriores","Load earlier messages")}</Button>}
          {rendered.map(m=><article key={m.id} className={"message-row "+(m.user_id===me?.id||!active?"own":"other")}><div className="message-bubble"><div className="message-author">{m.avatar} {m.user_id===me?.id||!active?t("Você","You"):m.nickname}</div>{mode!=="japanese"&&<SentenceScene payload={m.payload} lang={lang} autoPlay={m.id===rendered.at(-1)?.id} writing={mode==="bridge"}/>}{m.payload.kind==="word"&&<span className="study-message-label">{t("PALAVRA DE ESTUDO","STUDY WORD")}</span>}<Tokens payload={m.payload} mode={mode} lang={lang} onWord={showWord}/>{m.payload.kind!=="text"&&<details className="message-translation"><summary>{t("Revelar leitura e sentido","Reveal reading and meaning")}</summary><p lang="ja">{sentenceWords(m.payload).map(w=>w.kana).join(" ")}</p><p>{compose(m.payload).romaji}</p><p>{compose(m.payload)[lang]}</p></details>}<time className="message-time">{new Date(m.created_at).toLocaleTimeString(lang==="pt"?"pt-BR":"en",{hour:"2-digit",minute:"2-digit"})}{active&&m.user_id===me?.id&&<Check aria-label={t("Enviado","Sent")}/>}</time></div></article>)}
          <div ref={bottom}/>
        </div>
        <div className="composer">
          <div className="quick-phrases" aria-label={t("Expressões rápidas","Quick expressions")}>{["hello","thanks","yes","again","what-see"].map(id=><button key={id} disabled={busy||!!dmWaiting||roomLoading} onClick={()=>send({kind:"visual",template:id})}><span aria-hidden="true">{id==="what-see"?"🔎":lexicon[id].icon}</span>{id==="what-see"?t("O que você vê?","What do you see?"):id==="again"?t("Mais uma vez","Once more"):lexicon[id][lang].split(" / ")[0]}</button>)}</div>
          <Tabs value={composeMode} onValueChange={setComposeMode}><div className="composer-top"><TabsList><TabsTrigger value="story"><Clapperboard/>{t("Cenas","Scenes")}</TabsTrigger><TabsTrigger value="visual"><Image/>{t("Figuras","Pictures")}</TabsTrigger><TabsTrigger value="text"><Languages/>{t("Texto livre","Free text")}</TabsTrigger></TabsList><Button variant="ghost" size="sm" className="open-vocabulary" onClick={()=>{setStudyEntry("");setLibraryOpen(true);}} aria-label={t("Abrir as 300 palavras","Open the 300 words")}><BookOpen/><span>300</span></Button></div>
            <TabsContent value="story"><div className="story-composer"><Choice label={t("Frases em cenas","Sentence scenes")} value={storyId} onChange={setStoryId} items={stories.map(story=>({value:story.id,label:story[lang]}))}/><div className="send-row"><div className="story-draft"><p lang="ja">{storyById[storyId].jp}</p><div className="story-icon-order" aria-label={t("Figuras na ordem japonesa","Pictures in Japanese order")}>{storyById[storyId].words.map((w,i)=><span key={w.id+i} title={w.jp+" · "+w[lang]}>{w.icon}</span>)}</div></div><Button size="icon" className="send-button" disabled={busy||!!dmWaiting||roomLoading} onClick={()=>send()} aria-label={active?t("Enviar cena","Send scene"):t("Testar cena","Try scene")}><Send/></Button></div></div></TabsContent>
            <TabsContent value="visual"><div className="sentence-controls"><Choice label={t("Estrutura da frase","Sentence pattern")} value={template} onChange={value=>{setTemplate(value);setNoun(templates.find(x=>x.id===value)!.choices[0]);}} items={templates.map(v=>({value:v.id,label:v[lang]}))}/><div className="question-toggle"><Label htmlFor="question">{t("Pergunta","Question")}</Label><Switch id="question" checked={question||template==="where"} disabled={template==="where"} onCheckedChange={setQuestion}/></div></div>
              <div className="picture-keyboard" role="group" aria-label={t("Escolha uma figura","Choose a picture")}>{chosen.choices.map(id=><button key={id} className={id===noun?"picked":""} onClick={()=>setNoun(id)} aria-pressed={id===noun} aria-label={lexicon[id][lang]}><span>{lexicon[id].icon}</span><span lang="ja">{lexicon[id].jp}</span></button>)}</div>
              <div className="send-row"><div className="draft-preview"><Tokens payload={{kind:"visual",template,noun,question}} mode={mode} lang={lang} onWord={showWord}/></div><Button size="icon" className="send-button" disabled={busy||!!dmWaiting||roomLoading} onClick={()=>send()} aria-label={active?t("Enviar mensagem","Send message"):t("Testar frase","Try sentence")}><Send/></Button></div>
            </TabsContent>
            <TabsContent value="text"><form className="text-composer" onSubmit={e=>{e.preventDefault();void send();}}><Input value={text} onChange={e=>setText(e.target.value)} maxLength={1500} aria-label={t("Mensagem","Message")} placeholder={t("Escreva em japonês ou em seu idioma…","Write in Japanese or your language…")}/><Button size="icon" className="send-button" type="submit" disabled={busy||!text.trim()||!!dmWaiting||roomLoading} aria-label={t("Enviar mensagem","Send message")}><Send/></Button></form><p className="composer-note">{t("Texto livre é enviado como você escreveu. Não há tradução automática.","Free text is sent as written. There is no automatic translation.")}</p></TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
    <WordLibrary open={libraryOpen} onOpenChange={setLibraryOpen} lang={lang} initialEntry={studyEntry} busy={busy||!!dmWaiting||roomLoading} onUse={payload=>{setMobileChat(true);void send(payload);}}/>
    <Sheet open={!!word} onOpenChange={open=>{if(!open)setWord(null);}}><SheetContent className="word-sheet"><SheetHeader><SheetTitle>{t("Uma palavra de cada vez","One word at a time")}</SheetTitle><SheetDescription>{t("Observe a escrita e tente lembrar o sentido.","Look at the writing and try to recall its meaning.")}</SheetDescription></SheetHeader>{word&&<div className="word-detail"><span className="word-big" lang="ja">{word.jp}</span><p className="word-kana" lang="ja">{word.kana}</p><p className="word-romaji">{word.romaji}</p>{reveal?<><div className="word-meaning"><span>{word.icon}</span><strong>{word[lang]}</strong></div><p>{(lang==="pt"?word.notePt:word.noteEn)||t("Associe a imagem à palavra inteira. Use a frase na conversa e depois tente lembrar sem a pista.","Associate the picture with the whole word. Use the sentence in a conversation, then try recalling it without the cue.")}</p><Button variant="outline" onClick={()=>setReveal(false)}>{t("Esconder a pista e tentar lembrar","Hide the cue and try to remember")}</Button></>:<Button onClick={()=>setReveal(true)}>{t("Revelar o sentido","Reveal the meaning")}</Button>}<div className="word-footnote">{word.grammar?t("Símbolo didático do app. A função depende da frase.","This app’s learning symbol. The role depends on the sentence."):t("As imagens ajudam a lembrar; a escrita guarda a palavra.","Pictures help recall; the writing holds the word.")}</div></div>}</SheetContent></Sheet>
    <Dialog open={profileOpen} onOpenChange={setProfileOpen}><DialogContent className="scroll-dialog"><DialogHeader><DialogTitle>{t("Seu perfil","Your profile")}</DialogTitle><DialogDescription>{t("Escolha como aparece para a comunidade.","Choose how you appear to the community.")}</DialogDescription></DialogHeader><ProfileForm key={me?.id||"new"} me={me} lang={lang} busy={busy} onSave={async value=>{const r=await act(value,t("Perfil salvo.","Profile saved."));if(r)setProfileOpen(false);}}/>{data.blocks.length>0&&<div className="blocked-list"><h3><Shield/>{t("Pessoas bloqueadas","Blocked people")}</h3>{data.blocks.map(p=><div key={p.id}><span>{p.avatar} {p.nickname}</span><Button size="sm" variant="ghost" disabled={busy} onClick={()=>act({action:"unblock",targetId:p.id})}>{t("Desbloquear","Unblock")}</Button></div>)}</div>}<Button variant="ghost" asChild><a href={signOutPath} target="_top" onClick={e=>{if(onSignOut){e.preventDefault();onSignOut();}}}><LogOut/>{t("Sair da conta","Sign out")}</a></Button></DialogContent></Dialog>
    <Dialog open={groupOpen} onOpenChange={setGroupOpen}><DialogContent className="scroll-dialog"><DialogHeader><DialogTitle>{t("Criar um grupo","Create a group")}</DialogTitle><DialogDescription>{t("As pessoas recebem um convite e escolhem participar. Até 25 participantes.","People receive an invitation and choose to join. Up to 25 members.")}</DialogDescription></DialogHeader><form className="profile-form" onSubmit={async e=>{e.preventDefault();const r=await act({action:"group",title:groupName,targets});if(r){setGroupOpen(false);setGroupName("");setTargets([]);await openRoom(r.roomId);}}}><div className="field"><Label htmlFor="group-name">{t("Nome do grupo","Group name")}</Label><Input id="group-name" value={groupName} onChange={e=>setGroupName(e.target.value)} required minLength={2} maxLength={60} placeholder={t("Japonês no dia a dia","Everyday Japanese")}/></div><div className="group-people">{!data.people.length?<p className="small-note">{t("Quando outra pessoa estiver disponível, ela aparecerá aqui para você convidar.","When another person is available, they will appear here for you to invite.")}</p>:data.people.map(p=><label key={p.id} className="group-person"><Checkbox checked={targets.includes(p.id)} onCheckedChange={checked=>setTargets(old=>checked?[...old,p.id]:old.filter(id=>id!==p.id))}/><span className="avatar">{p.avatar}</span><span>{p.nickname}<small>{p.language}</small></span></label>)}</div><Button disabled={busy||!targets.length} type="submit">{t("Criar e enviar convites","Create and send invitations")}</Button></form></DialogContent></Dialog>
    <Sheet open={membersOpen} onOpenChange={setMembersOpen}><SheetContent className="members-sheet"><SheetHeader><SheetTitle>{title}</SheetTitle><SheetDescription>{t("Participantes da conversa","Conversation members")}</SheetDescription></SheetHeader><div className="members-content">{roomData?.members.map(p=><div className="member-row" key={p.id}><span className="avatar">{p.avatar}</span><div><strong>{p.nickname}</strong><small>{p.state==="active"?(p.id===room?.owner_id?t("Administração","Admin"):p.language):p.state==="pending"?t("Convite pendente","Invitation pending"):t("Saiu da conversa","Left the chat")}</small></div>{p.id!==me?.id&&<Button variant="ghost" size="sm" disabled={busy||data.blocks.some(b=>b.id===p.id)} onClick={async()=>{const r=await act({action:"block",targetId:p.id},t("Pessoa bloqueada.","Person blocked."));if(r){setMembersOpen(false);if(room?.kind==="dm")practiceRoom();else{updateMessages(messagesRef.current.filter(m=>m.user_id!==p.id));await poll();}}}}>{data.blocks.some(b=>b.id===p.id)?t("Bloqueada","Blocked"):t("Bloquear","Block")}</Button>}</div>)}{room?.kind==="group"&&room.owner_id===me?.id&&<section className="add-members"><h3>{t("Convidar para o grupo","Invite to the group")}</h3>{data.people.filter(p=>!roomData?.members.some(m=>m.id===p.id&&["active","pending"].includes(m.state||""))).map(p=><div className="member-row" key={p.id}><span>{p.avatar} {p.nickname}</span><Button variant="outline" size="sm" disabled={busy} onClick={async()=>{const r=await act({action:"invite",roomId:active,targetId:p.id},t("Convite enviado.","Invitation sent."));if(r)await poll();}}>{t("Convidar","Invite")}</Button></div>)}</section>}<p className="small-note">{t("Ao bloquear alguém, você deixa de ver as mensagens dessa pessoa e ela não pode convidar você. Em grupos compartilhados, as mensagens entre vocês também ficam ocultas.","Blocking hides that person’s messages and prevents invitations. In shared groups, messages between you are also hidden.")}</p><Button variant="outline" onClick={()=>setConfirmLeave(true)}><LogOut/>{t("Sair da conversa","Leave conversation")}</Button></div></SheetContent></Sheet>
    <AlertDialog open={confirmLeave} onOpenChange={setConfirmLeave}><AlertDialogContent><AlertDialogTitle>{t("Sair desta conversa?","Leave this conversation?")}</AlertDialogTitle><AlertDialogDescription>{t("Você precisará de um novo convite para voltar.","You will need a new invitation to return.")}</AlertDialogDescription><AlertDialogFooter><AlertDialogCancel>{t("Cancelar","Cancel")}</AlertDialogCancel><AlertDialogAction disabled={busy} onClick={async e=>{e.preventDefault();const r=await act({action:"leave",roomId:active});if(r){setMembersOpen(false);setConfirmLeave(false);practiceRoom();}}}>{t("Sair da conversa","Leave conversation")}</AlertDialogAction></AlertDialogFooter></AlertDialogContent></AlertDialog>
  </div>;
}

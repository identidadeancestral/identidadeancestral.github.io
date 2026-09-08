import { entryById } from "./study-data";
import { formsFor, romanize } from "./japanese";
import type { Word } from "./vocabulary";

export type BlockRole="topic"|"context"|"noun"|"particle"|"verb"|"adjective"|"adverb"|"expression";
export type BlocksPayload={kind:"blocks";pattern:string;slot?:string;verb?:string;place?:string;form?:string;question?:boolean;topic?:boolean;name?:string;adverb?:string};
export const roleNames:Record<BlockRole,[string,string]>={topic:["tema","topic"],context:["contexto","context"],noun:["substantivo","noun"],particle:["partícula","particle"],verb:["verbo","verb"],adjective:["adjetivo","adjective"],adverb:["advérbio","adverb"],expression:["expressão","expression"]};
export const methodPatterns=[
 {id:"activity",number:1,page:82,pt:"Fazer uma atividade",en:"Do an activity",formula:"[atividade] を します",verbs:["do"]},
 {id:"consume",number:2,page:83,pt:"Comer e beber",en:"Eat and drink",formula:"[objeto] を [verbo]",verbs:["drink","eat"]},
 {id:"go",number:5,page:84,pt:"Ir para um lugar",en:"Go to a place",formula:"[destino] に 行きます",verbs:["go"]},
 {id:"location",number:7,page:85,pt:"Fazer algo em um lugar",en:"Do something in a place",formula:"[local] で [objeto] を [verbo]",verbs:["read","drink","eat","see"]},
 {id:"like",number:16,page:91,pt:"Dizer do que gosta",en:"Say what you like",formula:"[alvo] が 好きです",verbs:[]},
 {id:"request",number:46,page:109,pt:"Pedir uma coisa",en:"Ask for something",formula:"[objeto] を ください",verbs:[]},
 {id:"please",number:47,page:110,pt:"Pedir uma ação",en:"Ask someone to act",formula:"[verbo na forma て] ください",verbs:["wait","say","write"]},
 {id:"invite",number:49,page:111,pt:"Fazer um convite",en:"Make an invitation",formula:"[objeto] を [raiz de ます]ませんか",verbs:["drink","eat","see"]},
 {id:"introduce",number:53,page:113,pt:"Dizer seu nome",en:"Introduce yourself",formula:"[nome] と いいます",verbs:[]},
 {id:"past",number:61,page:118,pt:"Contar o que fez",en:"Say what you did",formula:"昨日 [objeto] を [verbo no passado]",verbs:["drink","eat","read","see"]},
] as const;
export const patternById=Object.fromEntries(methodPatterns.map(p=>[p.id,p])) as Record<string,typeof methodPatterns[number]>;
const extra:Record<string,[string,string,string,string]>={
 newspaper:["新聞","しんぶん","jornal","newspaper"],movie:["映画","えいが","filme","movie"],music:["音楽","おんがく","música","music"],
 cafe:["カフェ","カフェ","café (local)","café"],
 study:["勉強","べんきょう","estudo","study"],work:["仕事","しごと","trabalho","work"],
 cleaning:["掃除","そうじ","limpeza","cleaning"],shopping:["買い物","かいもの","compras","shopping"],
};
const objects:Record<string,string[]>={do:["study","work","cleaning","shopping"],drink:["coffee","tea","water"],eat:["rice","bread","apple","fish"],read:["book","newspaper"],see:["movie","cat","dog"]};
export const methodPlaces=["house","cafe","park","restaurant","library","school"];
export const methodForms=[{id:"polite",pt:"Presente / futuro",en:"Nonpast"},{id:"negative",pt:"Não faço",en:"Negative"},{id:"past",pt:"Fiz",en:"Past"},{id:"pastNegative",pt:"Não fiz",en:"Negative past"}];
export function methodNoun(id:string):Word {
 const entry=entryById["noun:"+id],e=extra[id];
 if(!entry&&!e)throw new Error("invalid_message");
 const [jp,kana,pt,en]=e||[entry.jp,entry.kana,entry.pt,entry.en];
 return {id:"method:"+id,jp,kana,pt,en,romaji:romanize(kana),icon:"",role:"noun"};
}
export function methodChoices(pattern:string,verb?:string):string[] {
 if(pattern==="go")return ["house","cafe","school","station","park","japan"];
 if(pattern==="like")return ["coffee","tea","cat","dog","music","movie"];
 if(pattern==="request")return ["water","tea","coffee","bread","book"];
 if(pattern==="please"||pattern==="introduce")return [];
 return objects[verb||""]||[];
}
export function defaultBlocks(pattern="location"):BlocksPayload {
 if(!Object.hasOwn(patternById,pattern))throw new Error("invalid_message");
 const p=patternById[pattern],verb=p.verbs[0];
 return {kind:"blocks",pattern,verb,slot:methodChoices(pattern,verb)[0],place:pattern==="location"?"house":undefined,form:pattern==="past"?"past":"polite",question:false,topic:pattern==="location",name:pattern==="introduce"?"ウメダ":undefined};
}
export const hasForm=(p:string)=>["activity","consume","go","location"].includes(p);
export const hasQuestion=(p:string)=>["activity","consume","go","location","like","past"].includes(p);
// Deliberately selected combinations for the initial patterns. All 100 adverbs
// remain available as study words with their own examples in the catalogue.
export function methodAdverbChoices(p:BlocksPayload):string[] {
 if(p.pattern==="like")return ["very","quite"];
 if(hasForm(p.pattern)&&(!p.form||p.form==="polite"))return ["always","often","sometimes","usually","occasionally"];
 return [];
}
export function canonicalBlocks(raw:unknown):BlocksPayload {
 if(!raw||typeof raw!=="object")throw new Error("invalid_message");
 const r=raw as Record<string,unknown>;
 if(r.kind!=="blocks"||typeof r.pattern!=="string"||!Object.hasOwn(patternById,r.pattern))throw new Error("invalid_message");
 for(const k of ["slot","verb","place","form","name","adverb"])if(r[k]!==undefined&&(typeof r[k]!=="string"||(r[k] as string).length>40))throw new Error("invalid_message");
 for(const k of ["question","topic"])if(r[k]!==undefined&&typeof r[k]!=="boolean")throw new Error("invalid_message");
 const d=defaultBlocks(r.pattern),p={...d,...Object.fromEntries(["slot","verb","place","form","name","question","topic","adverb"].filter(k=>r[k]!==undefined).map(k=>[k,r[k]]))} as BlocksPayload;
 const pattern=patternById[p.pattern];
 if(pattern.verbs.length&&!(pattern.verbs as readonly string[]).includes(p.verb!))throw new Error("invalid_message");
 const choices=methodChoices(p.pattern,p.verb);
 if(choices.length&&!choices.includes(p.slot!))throw new Error("invalid_message");
 if(p.pattern==="location"&&!methodPlaces.includes(p.place!))throw new Error("invalid_message");
 if(hasForm(p.pattern)&&!methodForms.some(f=>f.id===p.form))throw new Error("invalid_message");
 if(p.pattern==="past"&&p.form!=="past")throw new Error("invalid_message");
 if(p.question&&(!hasQuestion(p.pattern)||p.topic))throw new Error("invalid_message");
 if(p.topic&&!hasQuestion(p.pattern))throw new Error("invalid_message");
 if(p.pattern==="introduce"&&(!p.name?.trim()||/[\u0000-\u001f\u007f<>]/u.test(p.name)))throw new Error("invalid_message");
 if(p.adverb!==undefined&&!methodAdverbChoices(p).includes(p.adverb))throw new Error("invalid_message");
 return {kind:"blocks",pattern:p.pattern,...(pattern.verbs.length?{verb:p.verb}:{}),...(choices.length?{slot:p.slot}:{}),...(p.pattern==="location"?{place:p.place}:{}),...(hasForm(p.pattern)||p.pattern==="past"?{form:p.form}:{}),...(hasQuestion(p.pattern)?{question:!!p.question,topic:!!p.topic}:{}),...(p.pattern==="introduce"?{name:p.name!.trim()}: {}),...(p.adverb?{adverb:p.adverb}:{})};
}
function word(id:string,jp:string,kana:string,pt:string,en:string,role:BlockRole,notePt=pt,noteEn=en):Word {return {id,jp,kana,romaji:romanize(kana),pt,en,role,notePt,noteEn,icon:"",grammar:role==="particle"};}
function particle(jp:string,pt:string,en:string) {return word("particle:"+jp,jp,jp==="は"?"わ":jp==="を"?"お":jp,pt,en,"particle",pt,en);}
function verbWord(id:string,form:string):Word {
 const entry=entryById["verb:"+id],f=entry&&formsFor(entry).find(f=>f.id===form);
 if(!f)throw new Error("invalid_message");
 return {...word("method-verb:"+id+":"+form,f.jp,f.kana,entry.pt,entry.en,"verb",entry.jp+" → "+f.jp+" · "+f.pt,entry.jp+" → "+f.jp+" · "+f.en),entryId:entry.id};
}
const ptVerb:Record<string,[string,string,string,string]>={do:["faço","faz","fiz","fez"],drink:["bebo","bebe","bebi","bebeu"],eat:["como","come","comi","comeu"],read:["leio","lê","li","leu"],see:["vejo","vê","vi","viu"],go:["vou","vai","fui","foi"]};
const enVerb:Record<string,[string,string]>={do:["do","did"],drink:["drink","drank"],eat:["eat","ate"],read:["read","read"],see:["see","saw"],go:["go","went"]};
const activityPt:Record<string,[string,string,string,string]>={study:["estudo","estuda","estudei","estudou"],work:["trabalho","trabalha","trabalhei","trabalhou"],cleaning:["faço limpeza","faz limpeza","fiz limpeza","fez limpeza"],shopping:["faço compras","faz compras","fiz compras","fez compras"]};
const activityEn:Record<string,[string,string]>={study:["study","studied"],work:["work","worked"],cleaning:["clean","cleaned"],shopping:["shop","shopped"]};
const objectPt:Record<string,string>={book:"um livro",newspaper:"um jornal",movie:"um filme",rice:"arroz",tea:"chá"};
const objectEn:Record<string,string>={book:"a book",newspaper:"a newspaper",movie:"a movie"};
const atPt:Record<string,string>={house:"em casa",cafe:"no café",park:"no parque",restaurant:"no restaurante",library:"na biblioteca",school:"na escola"};
const toPt:Record<string,string>={house:"para casa",cafe:"ao café",school:"à escola",station:"à estação",park:"ao parque",japan:"ao Japão"};
const verbInfPt:Record<string,string>={drink:"beber",eat:"comer",see:"ver"};
export function composeBlocks(raw:BlocksPayload) {
 const p=canonicalBlocks(raw),pattern=patternById[p.pattern],words:Word[]=[];
 const n=p.slot?methodNoun(p.slot):undefined,q=!!p.question;
 const objPt=n?(objectPt[p.slot!]||n.pt):"",objEn=n?(objectEn[p.slot!]||n.en):"";
 let pt="",en="",explainPt="",explainEn="";
 if(p.pattern==="past")words.push(word("method-yesterday","昨日","きのう","ontem","yesterday","context"));
 if(p.topic)words.push(word("method-me","私","わたし","eu","I","topic"),particle("は","marca o tema: de quem se fala","marks the topic: who we are talking about"));
 if(p.pattern==="introduce") {
  words.push(word("method-name",p.name!,p.name!,p.name!,p.name!,"noun","Nome apresentado; use a escrita que você conhece.","Name being introduced; use a spelling you know."),particle("と","marca o nome citado","marks the quoted name"),word("method-iimasu","いいます","いいます","me chamo","am called","verb"));
  pt="Me chamo "+p.name+".";en="My name is "+p.name+".";
  explainPt="O nome vem antes de と. いいます fecha a apresentação. Você pode escrever seu nome em kana ou em letras latinas.";
  explainEn="The name comes before と. いいます closes the introduction. You can write your name in kana or Latin letters.";
 } else if(p.pattern==="please") {
  if(p.verb==="wait")words.push(word("method-chotto","ちょっと","ちょっと","um momento","a moment","context"));
  if(p.verb==="say")words.push(word("method-once","もう一度","もういちど","mais uma vez","once more","context"));
  words.push(verbWord(p.verb!,"te"),word("method-kudasai","ください","ください","por favor","please","expression"));
  pt=({wait:"Espere um momento, por favor.",say:"Diga mais uma vez, por favor.",write:"Escreva, por favor."} as Record<string,string>)[p.verb!];
  en=({wait:"Please wait a moment.",say:"Please say it once more.",write:"Please write."} as Record<string,string>)[p.verb!];
  explainPt="O verbo vai para a forma て antes de ください. A forma て não significa automaticamente “fazendo”; aqui ela constrói um pedido.";
  explainEn="The verb takes its て form before ください. The て form does not automatically mean “doing”; here it builds a request.";
 } else {
  if(p.pattern==="location"){const place=methodNoun(p.place!);words.push({...place,role:"context",functionPt:"local",functionEn:"place"},particle("で","marca onde a ação acontece","marks where the action happens"));}
  words.push({...n!,functionPt:p.pattern==="go"?"destino":p.pattern==="like"?"alvo do gosto":"objeto",functionEn:p.pattern==="go"?"destination":p.pattern==="like"?"what is liked":"object"});
  words.push(particle(p.pattern==="go"?"に":p.pattern==="like"?"が":"を",p.pattern==="go"?"marca o destino do verbo ir":p.pattern==="like"?"marca aquilo de que se gosta, nesta construção":"marca o objeto da ação",p.pattern==="go"?"marks the destination of going":p.pattern==="like"?"marks what is liked in this construction":"marks the object of the action"));
  if(p.pattern==="like") {
   words.push(word("method-suki","好きです","すきです","gosto","like","adjective","好き é um adjetivo な. Com です, forma o predicado; não é um verbo equivalente a “gostar”.","好き is a な adjective. With です it forms the predicate; it is not a verb equivalent to “like”."));
   const likedPt=({cat:"gatos",dog:"cachorros",movie:"filmes"} as Record<string,string>)[p.slot!]||n!.pt,likedEn=({cat:"cats",dog:"dogs",movie:"movies"} as Record<string,string>)[p.slot!]||n!.en;
   pt=(q?"Você gosta de ":"Gosto de ")+likedPt+(q?"?":".");en=(q?"Do you like ":"I like ")+likedEn+(q?"?":".");
   explainPt="が marca o alvo do gosto neste molde. 好きです é um predicado adjetival, por isso recebe a cor de adjetivo.";
   explainEn="が marks what is liked in this pattern. 好きです is an adjective predicate, so it uses the adjective color.";
  } else if(p.pattern==="request") {
   words.push(word("method-kudasai","ください","ください","dê, por favor","please give","verb"));
   pt="Quero "+objPt+", por favor.";en="Please give me "+objEn+".";
   explainPt="O objeto pedido vem antes de を. ください completa o pedido de uma coisa. Para pedir uma ação, use o bloco 47.";
   explainEn="The requested object comes before を. ください completes a request for a thing. To request an action, use block 47.";
  } else if(p.pattern==="invite") {
   const v=verbWord(p.verb!,"negative");words.push({...v,notePt:"Neste convite, a forma ません seguida de か significa “que tal fazermos…?”.",noteEn:"In this invitation, ません followed by か means “shall we…?”."});
   pt="Que tal "+verbInfPt[p.verb!]+" "+objPt+"?";en="Shall we "+enVerb[p.verb!][0]+" "+objEn+"?";
   explainPt="Troque ます por ません e acrescente か. Neste contexto, a pergunta negativa faz um convite educado.";
   explainEn="Replace ます with ません and add か. In this context, the negative question makes a polite invitation.";
  } else {
   words.push(verbWord(p.verb!,p.form||"polite"));
   const past=p.form==="past"||p.form==="pastNegative",negative=p.form==="negative"||p.form==="pastNegative",pv=p.pattern==="activity"?activityPt[p.slot!]:ptVerb[p.verb!],ev=p.pattern==="activity"?activityEn[p.slot!]:enVerb[p.verb!];
   const complementPt=p.pattern==="activity"?"":p.pattern==="go"?toPt[p.slot!]:objPt+(p.pattern==="location"?" "+atPt[p.place!]:"");
   const placeEn=p.place==="house"?"at home":"at the "+(p.place==="cafe"?"café":p.place?methodNoun(p.place).en:"");
   const complementEn=p.pattern==="activity"?"":p.pattern==="go"?(p.slot==="house"?"home":"to "+(p.slot==="japan"?"Japan":"the "+(p.slot==="cafe"?"café":n!.en))):objEn+(p.pattern==="location"?" "+placeEn:"");
   pt=(p.pattern==="past"?"Ontem, ":"")+(q?"você ":p.topic?"eu ":"")+(negative?"não ":"")+pv[(past?2:0)+(q?1:0)]+" "+complementPt+(q?"?":".");
   en=(q?(past?"Did you ":"Do you ")+(negative?"not ":"")+ev[0]:"I "+(negative?(past?"did not ":"do not ")+ev[0]:ev[past?1:0]))+" "+complementEn+(p.pattern==="past"?" yesterday":"")+(q?"?":".");
   explainPt=p.pattern==="go"?"O lugar é o destino, marcado por に. O verbo ir fecha este molde, na forma escolhida.":"O objeto fica com を; o verbo ou predicado fecha o molde. "+(p.pattern==="location"?"O local da ação usa で. ":"")+(p.pattern==="activity"?"する combina aqui com substantivos de atividade. ":"");
   explainEn=p.pattern==="go"?"The place is a destination, marked by に. The verb go closes this pattern in the selected form.":"The object goes with を; the verb or predicate closes the pattern. "+(p.pattern==="location"?"The action's place uses で. ":"")+(p.pattern==="activity"?"する combines here with activity nouns. ":"");
  }
  if(q||p.pattern==="invite")words.push(particle("か","torna o enunciado uma pergunta","makes this a question"));
 }
 if(q){explainPt+=" か vem depois do predicado.";explainEn+=" か comes after the predicate.";}
 if(p.pattern==="past"){explainPt+=" 昨日 acrescenta o contexto de ontem, do bloco 63 (PDF p. 119).";explainEn+=" 昨日 adds yesterday's context, from block 63 (PDF p. 119).";}
 if(hasForm(p.pattern)||p.pattern==="past"){explainPt+=" Sem tempo explícito, ます pode indicar hábito ou futuro; ました indica passado.";explainEn+=" Without an explicit time, ます can mean habit or future; ました indicates past.";}
 if(p.adverb){
  const a=entryById["adverb:"+p.adverb],index=words.findIndex(w=>w.role==="verb"||w.role==="adjective");
  words.splice(index,0,{...word(a.id,a.jp,a.kana,a.pt,a.en,"adverb"),entryId:a.id});
  if(p.pattern==="like"){
   pt=pt.replace(/gost[ao]/i,s=>s+" "+(p.adverb==="very"?"muito":"bastante"));
   en=en.replace("like ",(p.adverb==="very"?"really":"quite")+" like ");
  } else {
   const frequency:Record<string,[string,string]>={always:["sempre","always"],often:["com frequência","often"],sometimes:["às vezes","sometimes"],usually:["geralmente","usually"],occasionally:["de vez em quando","occasionally"]};
   const [frequencyPt,frequencyEn]=frequency[p.adverb];
   pt=frequencyPt+", "+pt.charAt(0).toLowerCase()+pt.slice(1);
   en=en.replace(/^(I|Do you) /,s=>s+frequencyEn+" ");
  }
  explainPt+=" O advérbio "+a.jp+" acrescenta "+(p.pattern==="like"?"intensidade ao gosto":"frequência à ação")+". Neste exemplo, fica antes do predicado. É uma expansão opcional do molde.";
  explainEn+=" The adverb "+a.jp+" adds "+(p.pattern==="like"?"degree to liking":"frequency to the action")+". In this example it comes before the predicate. It is an optional extension of the pattern.";
 }
 const cap=(s:string)=>(s.charAt(0).toUpperCase()+s.slice(1)).replace(/\s+([?.])/g,"$1");
 return {japanese:words.map(w=>w.jp).join("")+"。",tokens:words.map(w=>w.id),words,romaji:words.map(w=>w.romaji).join(" "),pt:cap(pt),en:cap(en),explainPt,explainEn,pattern};
}

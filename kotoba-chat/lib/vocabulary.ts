export type Lang = "pt" | "en";
export type Word = { id:string; jp:string; kana:string; romaji:string; icon:string; pt:string; en:string; notePt?:string; noteEn?:string; grammar?:boolean };
const w = (id:string,jp:string,kana:string,romaji:string,icon:string,pt:string,en:string,notePt?:string,noteEn?:string,grammar=false):Word => ({id,jp,kana,romaji,icon,pt,en,notePt,noteEn,grammar});
export const vocabulary: Word[] = [
  w("tree","木","き","ki","🌳","árvore","tree","Imagine os galhos nos traços de 木. Esta palavra se lê き; o kanji tem outras leituras em outras palavras.","Picture branches in 木. This word is read き; the kanji has other readings in other words."),
  w("flower","花","はな","hana","🌸","flor","flower"),
  w("mountain","山","やま","yama","⛰️","montanha","mountain","Imagine três picos em 山. A imagem é uma pista de memória.","Picture three peaks in 山. The image is a memory cue."),
  w("water","水","みず","mizu","💧","água","water"),
  w("tea","お茶","おちゃ","ocha","🍵","chá","tea"),
  w("coffee","コーヒー","コーヒー","kōhī","☕","café","coffee","コーヒー é escrito em katakana. Os traços ー prolongam as vogais.","コーヒー is written in katakana. The ー marks lengthen the vowels."),
  w("rice","ご飯","ごはん","gohan","🍚","arroz / refeição","rice / meal"),
  w("fish","魚","さかな","sakana","🐟","peixe","fish"),
  w("apple","りんご","りんご","ringo","🍎","maçã","apple","Aqui a palavra está em hiragana. Cada sinal registra um som, não uma imagem.","This word is written in hiragana. Each character records a sound, not an image."),
  w("bread","パン","パン","pan","🍞","pão","bread"),
  w("cat","猫","ねこ","neko","🐈","gato","cat"),
  w("dog","犬","いぬ","inu","🐕","cachorro","dog"),
  w("sun","太陽","たいよう","taiyō","☀️","sol","sun"),
  w("moon","月","つき","tsuki","🌙","lua","moon"),
  w("book","本","ほん","hon","📖","livro","book"),
  w("house","家","いえ","ie","🏠","casa","house"),
  w("school","学校","がっこう","gakkō","🏫","escola","school"),
  w("station","駅","えき","eki","🚉","estação","station"),
  w("japan","日本","にほん","Nihon","🇯🇵","Japão","Japan"),
  w("park","公園","こうえん","kōen","🏞️","parque","park"),
  w("wo","を","を","o","🎯","objeto da ação","object of the action","Nestas frases, を marca o que você vê, come ou bebe. Pronuncia-se “o”. O alvo é uma convenção deste app.","In these sentences, を marks what you see, eat or drink. It is pronounced “o”. The target is this app’s convention.",true),
  w("ni","に","に","ni","➡️","destino, nesta frase","destination in this sentence","Com 行きます, に pode marcar o destino. Em outras construções, に tem outras funções.","With 行きます, に can mark the destination. In other constructions, に has other roles.",true),
  w("wa","は","は","wa","🏷️","tema da frase","topic of the sentence","Como partícula, は se pronuncia “wa”. O símbolo destaca aquilo de que estamos falando.","As a particle, は is pronounced “wa”. The symbol marks what we are talking about.",true),
  w("ga","が","が","ga","✨","marca do que se gosta, aqui","marks what is liked here","Nesta construção, が marca aquilo de que a pessoa gosta. Não é uma tradução fixa de が.","In this construction, が marks what the person likes. It is not a fixed translation of が.",true),
  w("ka","か","か","ka","❔","pergunta","question","Aqui か torna a frase uma pergunta. Os ícones de partículas são pistas criadas para o app.","Here か makes the sentence a question. Particle icons are learning cues created for the app.",true),
  w("see","見ます","みます","mimasu","👀","vejo / vou ver","see / will see","見ます combina o kanji 見 com hiragana ます, uma terminação polida. Presente ou futuro dependem do contexto.","見ます combines 見 with hiragana ます, a polite ending. Present or future depends on context."),
  w("drink","飲みます","のみます","nomimasu","🥤","bebo / vou beber","drink / will drink"),
  w("eat","食べます","たべます","tabemasu","🍽️","como / vou comer","eat / will eat"),
  w("go","行きます","いきます","ikimasu","🚶","vou","go / will go"),
  w("like","好きです","すきです","suki desu","💚","gosto","like","好きです não é um verbo equivalente a “gostar”. Aprenda a construção completa: 猫が好きです。","好きです is not a verb equivalent to “like”. Learn the complete construction: 猫が好きです。"),
  w("where","どこです","どこです","doko desu","📍","onde fica","where is"),
  w("what","何","なに","nani","🔎","o quê","what"),
  w("hello","こんにちは","こんにちは","konnichiwa","👋","olá / boa tarde","hello / good afternoon","Nesta saudação, o は final se lê “wa”. Memorize a expressão inteira.","In this greeting, the final は is read “wa”. Learn the whole expression."),
  w("thanks","ありがとうございます","ありがとうございます","arigatō gozaimasu","🙏","muito obrigado(a)","thank you"),
  w("yes","はい","はい","hai","👍","sim","yes"),
  w("no","いいえ","いいえ","iie","🙅","não","no"),
  w("again","もう一度お願いします","もういちどおねがいします","mō ichido onegai shimasu","🔁","mais uma vez, por favor","once more, please"),
];
export const lexicon = Object.fromEntries(vocabulary.map(w=>[w.id,w])) as Record<string,Word>;
export const templates = [
  {id:"see",pt:"Vejo…",en:"I see…",choices:["tree","flower","mountain","cat","dog","sun","moon","book"],particle:"wo",ending:"see"},
  {id:"drink",pt:"Bebo…",en:"I drink…",choices:["water","tea","coffee"],particle:"wo",ending:"drink"},
  {id:"eat",pt:"Como…",en:"I eat…",choices:["rice","fish","apple","bread"],particle:"wo",ending:"eat"},
  {id:"go",pt:"Vou para…",en:"I go to…",choices:["school","station","japan","park","house"],particle:"ni",ending:"go"},
  {id:"like",pt:"Gosto de…",en:"I like…",choices:["cat","dog","flower","japan","tea","coffee","fish","apple"],particle:"ga",ending:"like"},
  {id:"where",pt:"Onde fica…?",en:"Where is…?",choices:["station","school","park","house"],particle:"wa",ending:"where"},
];
export type VisualPayload = {kind:"visual";template:string;noun?:string;question?:boolean};
export type MessagePayload = VisualPayload | {kind:"text";text:string};
export function compose(payload:MessagePayload): {japanese:string;tokens:string[];pt:string;en:string;romaji:string} {
  if(payload.kind==="text") return {japanese:payload.text,tokens:[],pt:"",en:"",romaji:""};
  let ids:string[]=[]; let pt="",en="";
  if(["hello","thanks","yes","no","again"].includes(payload.template)) {
    const w=lexicon[payload.template];ids=[w.id];pt=w.pt;en=w.en;
  } else if(payload.template==="what-see") {
    ids=["what","wo","see","ka"];pt="O que você vê?";en="What do you see?";
  } else {
    const t=templates.find(t=>t.id===payload.template);
    if(!t || !payload.noun || !t.choices.includes(payload.noun)) throw new Error("invalid_message");
    const w=lexicon[payload.noun];ids=[w.id,t.particle,t.ending];
    const p:Record<string,string>={see:"Vejo",drink:"Bebo",eat:"Como",go:"Vou para",like:"Gosto de",where:"Onde fica"};
    const q:Record<string,string>={see:"Você vê",drink:"Você bebe",eat:"Você come",go:"Você vai para",like:"Você gosta de",where:"Onde fica"};
    const e:Record<string,string>={see:"see",drink:"drink",eat:"eat",go:"go to",like:"like",where:"Where is"};
    const question=t.id==="where"||!!payload.question;
    if(question) ids.push("ka");
    pt=(question?q[t.id]:p[t.id])+": "+w.pt+(question?"?":".");
    en=(t.id==="where"?"Where is":(question?"Do you ":"I ")+e[t.id])+": "+w.en+(question?"?":".");
  }
  return {japanese:ids.map(id=>lexicon[id].jp).join("")+"。",tokens:ids,pt,en,romaji:ids.map(id=>lexicon[id].romaji).join(" ")};
}
export const avatars=["🌱","🌸","🍵","🌙","🦊","🐈","🐼","⛰️"];

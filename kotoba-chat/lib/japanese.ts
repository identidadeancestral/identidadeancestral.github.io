import type { Entry } from "./study-data";
export type Form={id:string;jp:string;kana:string;pt:string;en:string};
const labels:Record<string,[string,string]>={
 dictionary:["Dicionário","Dictionary"],polite:["Polida · presente / futuro","Polite · nonpast"],
 negative:["Negativa polida","Polite negative"],past:["Passado polido","Polite past"],pastNegative:["Passado negativo polido","Polite negative past"],
 plainNegative:["Negativa simples","Plain negative"],plainPast:["Passado simples","Plain past"],plainPastNegative:["Passado negativo simples","Plain negative past"],
 te:["Forma て · para ligar construções","て form · connects constructions"],adnominal:["Antes de um substantivo","Before a noun"],
};
const godan:Record<string,[string,string,string,string]>={
 "う":["い","わ","って","った"],"く":["き","か","いて","いた"],"ぐ":["ぎ","が","いで","いだ"],
 "す":["し","さ","して","した"],"つ":["ち","た","って","った"],"ぬ":["に","な","んで","んだ"],
 "ぶ":["び","ば","んで","んだ"],"む":["み","ま","んで","んだ"],"る":["り","ら","って","った"],
};
function verbParts(value:string,entry:Entry,reading:boolean) {
 if(entry.group==="suru") {const stem=value.slice(0,-2);return {stem:stem+"し",nai:stem+"しない",te:stem+"して",ta:stem+"した"};}
 if(entry.group==="kuru") return reading?{stem:"き",nai:"こない",te:"きて",ta:"きた"}:{stem:"来",nai:"来ない",te:"来て",ta:"来た"};
 const base=value.slice(0,-1);
 if(entry.group==="ichidan")return {stem:base,nai:base+"ない",te:base+"て",ta:base+"た"};
 const rule=godan[value.at(-1)!];if(!rule)throw new Error("unknown_verb_ending");
 return {stem:base+rule[0],nai:entry.id==="verb:exist-object"?"ない":base+rule[1]+"ない",te:base+(entry.id==="verb:go"?"って":rule[2]),ta:base+(entry.id==="verb:go"?"った":rule[3])};
}
export function formsFor(entry:Entry):Form[] {
 const form=(id:string,jp:string,kana:string):Form=>({id,jp,kana,pt:labels[id][0],en:labels[id][1]});
 if(entry.category==="noun")return [form("dictionary",entry.jp,entry.kana)];
 if(entry.category==="adjective") {
   const values=(text:string)=>{
     if(entry.group==="na")return [text,text+"です",text+"ではありません",text+"でした",text+"ではありませんでした",text+"な",text+"で"];
     const base=entry.id==="adjective:good"?"よ":text.slice(0,-1);
     return [text,text+"です",base+"くないです",base+"かったです",base+"くなかったです",text,base+"くて"];
   };
   const j=values(entry.jp),k=values(entry.kana);
   return ["dictionary","polite","negative","past","pastNegative","adnominal","te"].map((id,i)=>form(id,j[i],k[i]));
 }
 const j=verbParts(entry.jp,entry,false),k=verbParts(entry.kana,entry,true);
 return [form("dictionary",entry.jp,entry.kana),form("polite",j.stem+"ます",k.stem+"ます"),form("negative",j.stem+"ません",k.stem+"ません"),form("past",j.stem+"ました",k.stem+"ました"),form("pastNegative",j.stem+"ませんでした",k.stem+"ませんでした"),form("plainNegative",j.nai,k.nai),form("plainPast",j.ta,k.ta),form("plainPastNegative",j.nai.slice(0,-1)+"かった",k.nai.slice(0,-1)+"かった"),form("te",j.te,k.te)];
}
// Hepburn-style help with explicit vowel sequences (ou, oo, uu) for long vowels.
// Kana is authoritative; romanization is a removable reading aid.
const syllables:Record<string,string>={};
for(const row of ["あいうえお:a i u e o","かきくけこ:ka ki ku ke ko","がぎぐげご:ga gi gu ge go","さしすせそ:sa shi su se so","ざじずぜぞ:za ji zu ze zo","たちつてと:ta chi tsu te to","だぢづでど:da ji zu de do","なにぬねの:na ni nu ne no","はひふへほ:ha hi fu he ho","ばびぶべぼ:ba bi bu be bo","ぱぴぷぺぽ:pa pi pu pe po","まみむめも:ma mi mu me mo","やゆよ:ya yu yo","らりるれろ:ra ri ru re ro","わをん:wa o n","ぁぃぅぇぉ:a i u e o","ゔ:vu"]) {
 const [kana,latin]=row.split(":");[...kana].forEach((c,i)=>syllables[c]=latin.split(" ")[i]);
}
const pairs:Record<string,string>={きゃ:"kya",きゅ:"kyu",きょ:"kyo",ぎゃ:"gya",ぎゅ:"gyu",ぎょ:"gyo",しゃ:"sha",しゅ:"shu",しょ:"sho",じゃ:"ja",じゅ:"ju",じょ:"jo",ちゃ:"cha",ちゅ:"chu",ちょ:"cho",にゃ:"nya",にゅ:"nyu",にょ:"nyo",ひゃ:"hya",ひゅ:"hyu",ひょ:"hyo",びゃ:"bya",びゅ:"byu",びょ:"byo",ぴゃ:"pya",ぴゅ:"pyu",ぴょ:"pyo",みゃ:"mya",みゅ:"myu",みょ:"myo",りゃ:"rya",りゅ:"ryu",りょ:"ryo",てぃ:"ti",でぃ:"di",ふぁ:"fa",ふぃ:"fi",ふぇ:"fe",ふぉ:"fo",しぇ:"she",ちぇ:"che",うぃ:"wi",うぇ:"we",うぉ:"wo"};
export function romanize(source:string) {
 const kana=source.replace(/[ァ-ヶ]/g,c=>String.fromCharCode(c.charCodeAt(0)-0x60));
 let out="",double=false;
 for(let i=0;i<kana.length;i++){
   if(kana[i]==="っ"){double=true;continue;}
   if(kana[i]==="ー"){out+=(out.match(/[aeiou](?!.*[aeiou])/u)||[""])[0];continue;}
   const pair=pairs[kana.slice(i,i+2)];let s=pair||syllables[kana[i]]||kana[i];if(pair)i++;
   if(double){s=(s.startsWith("ch")?"t":s[0])+s;double=false;}
   if(s==="n"&&/[あいうえおやゆよ]/.test(kana[i+1]||""))s="n'";
   out+=s;
 }
 return out;
}
export function entryNote(entry:Entry,lang:"pt"|"en") {
 const notes:Record<string,[string,string]>={
  "verb:return":["帰る é godan: 帰ります・帰って. O final -eru, sozinho, não determina o grupo.","帰る is godan: 帰ります・帰って. An -eru ending alone does not determine the group."],
  "verb:go":["Exceção na forma て e no passado: 行って・行った.","Exception in the て form and plain past: 行って・行った."],
  "verb:come":["Observe a leitura de 来: くる・きます・こない. A leitura muda com a forma.","Notice the reading of 来: くる・きます・こない. The reading changes with the form."],
  "verb:exist-object":["ある vira ない na negativa simples. Use いる para pessoas e animais presentes.","The plain negative of ある is ない. Use いる for people and animals present."],
  "verb:know":["知る indica passar a saber. Para dizer que já sabe, use 知っています; para não saber, 知りません.","知る means to come to know. For knowing something, use 知っています; for not knowing, 知りません."],
  "verb:wear":["着る (vestir) é ichidan: 着ます. 切る (cortar) tem o mesmo som, mas é godan: 切ります.","着る (wear) is ichidan: 着ます. 切る (cut) sounds the same but is godan: 切ります."],
  "verb:need":["要る (precisar) é godan: 要ります. いる (estar presente) é ichidan: います.","要る (need) is godan: 要ります. いる (be present) is ichidan: います."],
  "adjective:good":["いい muda para よ nas flexões: よくない・よかった. Memorize essa exceção em uma frase.","いい changes to よ when inflected: よくない・よかった. Learn this exception in a sentence."],
  "adjective:beautiful":["きれい é adjetivo な, apesar de terminar em い: きれいな花, uma flor bonita.","きれい is a な adjective despite ending in い: きれいな花, a beautiful flower."],
  "adjective:like":["好き é adjetivo な. A construção 猫が好きです significa gostar de gatos; não use を aqui.","好き is a な adjective. 猫が好きです means liking cats; do not use を here."],
  "adjective:dislike":["嫌い é adjetivo な: 嫌いな食べ物. O い final não é uma terminação de adjetivo い.","嫌い is a な adjective: 嫌いな食べ物. Its final い is not an い-adjective ending."],
  "noun:grandfather":["おじいさん tem vogal longa: o-ji-i-san. おじさん, sem esse alongamento, significa tio / homem de meia-idade.","おじいさん has a long vowel: o-ji-i-san. おじさん without it means uncle / middle-aged man."],
  "noun:tree":["Imagine galhos nos traços de 木 e diga き. É uma pista visual; outras palavras com 木 podem ter outras leituras.","Picture branches in 木 and say き. This is a visual cue; 木 can have other readings in other words."],
 };
 return notes[entry.id]?.[lang==="pt"?0:1]||(lang==="pt"?"Observe a escrita, diga a leitura e imagine uma situação com esta palavra. Depois esconda o sentido e tente recuperá-lo.":"Look at the writing, say the reading and imagine a situation with this word. Then hide the meaning and try to recall it.");
}

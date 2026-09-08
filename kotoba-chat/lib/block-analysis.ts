import { compose, sentenceWords, type MessagePayload, type Word } from "./vocabulary";
import { composeBlocks, roleNames, type BlockRole } from "./method-blocks";
import { entryById } from "./study-data";
import { storyById } from "./stories";
export function blockWords(payload:MessagePayload):Word[] {
 return sentenceWords(payload).map(w=>{
  if(w.role)return w;
  const entry=w.entryId?entryById[w.entryId]:undefined;
  let role:BlockRole=w.grammar?"particle":entry?.category||"noun";
  if(payload.kind==="story"){
   if(w.id==="story-today")role="context";
   else if(["story-wake","story-saw","story-drank","story-went","story-read"].includes(w.id))role="verb";
  }
  if(payload.kind==="visual"){
   if(["see","drink","eat","go"].includes(w.id))role="verb";
   else if(w.id==="like")role="adjective";
   else if(["hello","thanks","yes","no","again","where"].includes(w.id))role="expression";
  }
  return {...w,role};
 });
}
export const blockLabel=(w:Word,lang:"pt"|"en")=>(lang==="pt"?w.functionPt:w.functionEn)||roleNames[w.role||"noun"][lang==="pt"?0:1];
export function messageExplanation(payload:MessagePayload,lang:"pt"|"en") {
 if(payload.kind==="text")return null;
 if(payload.kind==="blocks"){const c=composeBlocks(payload);return {source:(lang==="pt"?"Bloco ":"Block ")+String(c.pattern.number).padStart(2,"0")+" · Método 100 Blocos",formula:c.pattern.formula,summary:lang==="pt"?c.explainPt:c.explainEn,page:c.pattern.page};}
 if(payload.kind==="story"){const s=storyById[payload.story];return {source:lang==="pt"?"Combinação de blocos":"Combined blocks",formula:"",summary:lang==="pt"?s.notePt:s.noteEn};}
 if(payload.kind==="word")return {source:lang==="pt"?"Palavra de estudo":"Study word",formula:"",summary:(lang==="pt"?"Uma palavra isolada; escolha um molde para formar uma frase. ":"A single word; choose a pattern to build a sentence. ")+compose(payload)[lang]};
 const like=payload.template==="like",fixed=["hello","thanks","yes","no","again"].includes(payload.template);
 return {source:lang==="pt"?"Estrutura da mensagem":"Message structure",formula:"",summary:fixed?(lang==="pt"?"Expressão fixa: aprenda este conjunto como uma peça inteira.":"Fixed expression: learn this whole set as one unit."):like?(lang==="pt"?"が marca o alvo do gosto. 好きです é um predicado adjetival, não um verbo.":"が marks what is liked. 好きです is an adjective predicate, not a verb."):(lang==="pt"?"A partícula marca a função da palavra anterior. O predicado fecha esta estrutura; か, quando aparece, faz a pergunta.":"The particle marks the preceding word's role. The predicate closes this structure; か, when present, makes a question.")};
}

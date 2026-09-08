import { defaultBlocks, type BlocksPayload } from "./method-blocks";
import type { MessagePayload } from "./vocabulary";
const b=(pattern:string,patch:Partial<BlocksPayload>={}):BlocksPayload=>({...defaultBlocks(pattern),...patch});
// Authored teaching script. These are examples, never simulated online users.
export const methodDialogue:{speaker:"A"|"B";payload:MessagePayload}[]=[
 {speaker:"A",payload:b("introduce",{name:"ウメダ"})},
 {speaker:"B",payload:b("introduce",{name:"マリア"})},
 {speaker:"A",payload:b("like",{slot:"coffee",question:true,topic:false})},
 {speaker:"B",payload:b("like",{slot:"coffee"})},
 {speaker:"A",payload:b("invite",{verb:"drink",slot:"coffee"})},
 {speaker:"B",payload:{kind:"visual",template:"yes"}},
 {speaker:"A",payload:b("go",{slot:"cafe",question:true,topic:false})},
 {speaker:"B",payload:b("go",{slot:"cafe"})},
 {speaker:"A",payload:b("please",{verb:"wait"})},
 {speaker:"B",payload:{kind:"visual",template:"yes"}},
];
export function suggestedReplies(payload:MessagePayload):BlocksPayload[] {
 if(payload.kind!=="blocks"||!payload.question)return [];
 const answer={...payload,question:false,topic:false};
 if(payload.pattern==="like")return [answer];
 const past=payload.form==="past"||payload.form==="pastNegative";
 // The past-only teaching pattern has no negative slot.
 if(payload.pattern==="past")return [answer];
 return [{...answer,form:past?"past":"polite"},{...answer,form:past?"pastNegative":"negative"}];
}

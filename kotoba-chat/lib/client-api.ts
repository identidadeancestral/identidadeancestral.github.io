import { apiEndpoint } from "./frontend-config";
import { readApiResponse } from "./api-response";
export type AccessProps={signedIn:boolean;signInPath:string;signOutPath:string;apiOrigin?:string;sessionToken?:string;onSignOut?:()=>void;onSignIn?:()=>void;onManageAccount?:()=>void};
export async function jsonRequest(path:string,body?:unknown,apiOrigin="",sessionToken="") {
 const headers:Record<string,string>={};if(body!==undefined)headers["Content-Type"]="application/json";if(sessionToken)headers.Authorization="Bearer "+sessionToken;
 const response=await fetch(apiEndpoint(apiOrigin,path),{method:body===undefined?"GET":"POST",headers,body:body===undefined?undefined:JSON.stringify(body),credentials:apiOrigin?"omit":"same-origin",cache:"no-store"});
 return readApiResponse(response,sessionToken?()=>window.dispatchEvent(new Event("ojiisan-session-expired")):undefined);
}

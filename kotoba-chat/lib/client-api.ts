export type AccessProps={signedIn:boolean;signInPath:string;signOutPath:string;apiOrigin?:string;sessionToken?:string;onSignOut?:()=>void};
export async function jsonRequest(path:string,body?:unknown,apiOrigin="",sessionToken="") {
 const headers:Record<string,string>={};if(body!==undefined)headers["Content-Type"]="application/json";if(sessionToken)headers.Authorization="Bearer "+sessionToken;
 const response=await fetch(apiOrigin+path,{method:body===undefined?"GET":"POST",headers,body:body===undefined?undefined:JSON.stringify(body),credentials:apiOrigin?"omit":"same-origin",cache:"no-store"});
 const data=await response.json();
 if(!response.ok){if(response.status===401&&apiOrigin)window.dispatchEvent(new Event("ojiisan-session-expired"));throw new Error(data.error||"unavailable");}
 return data;
}

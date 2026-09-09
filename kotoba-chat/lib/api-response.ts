export async function readApiResponse(response:Response,onSessionExpired?:()=>void) {
 const data=await response.json().catch(()=>null);
 if(!response.ok){
  // A Supabase gateway 401 is an infrastructure failure, not proof that the
  // application's opaque session expired. Only our explicit response revokes UI state.
  if(response.status===401&&data?.error==="sign_in")onSessionExpired?.();
  const error=typeof data?.error==="string"?data.error:response.status===401?"gateway_auth":"unavailable";
  throw new Error(error);
 }
 if(!data||typeof data!=="object")throw new Error("unavailable");
 return data;
}

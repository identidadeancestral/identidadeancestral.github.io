export class ApiError extends Error {
 constructor(message:string,public status:number,public retryAfterMs=0){super(message);this.name="ApiError";}
}
function retryAfter(value:string|null) {
 if(!value)return 0;
 const seconds=Number(value);
 const ms=Number.isFinite(seconds)?seconds*1000:Date.parse(value)-Date.now();
 return Number.isFinite(ms)?Math.max(0,ms):0;
}
export async function readApiResponse(response:Response,onSessionExpired?:()=>void) {
 const data=await response.json().catch(()=>null);
 if(!response.ok){
  // A Supabase gateway 401 is an infrastructure failure, not proof that the
  // application's opaque session expired. Only our explicit response revokes UI state.
  if(response.status===401&&data?.error==="sign_in")onSessionExpired?.();
  const error=typeof data?.error==="string"?data.error:response.status===401?"gateway_auth":"unavailable";
  throw new ApiError(error,response.status,retryAfter(response.headers.get("Retry-After")));
 }
 if(!data||typeof data!=="object")throw new ApiError("unavailable",502);
 return data;
}

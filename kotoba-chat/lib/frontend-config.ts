// These are public application addresses, not credentials.
export const FRONTEND_ORIGIN="https://identidadeancestral.github.io";
export const FRONTEND_URL=FRONTEND_ORIGIN+"/ojiisan-chat/";
export const LEGACY_ORIGIN="https://kotoba-chat-identidadeancestral.aaaaasssdd.chatgpt.site";
export const SERVER_ORIGIN=LEGACY_ORIGIN;
// Public address only; never a database password or a service-role key.
declare const __OJIISAN_API_BASE__:string|undefined;
export const API_BASE=typeof __OJIISAN_API_BASE__==="string"?__OJIISAN_API_BASE__:SERVER_ORIGIN;

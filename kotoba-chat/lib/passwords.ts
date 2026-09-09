import { scrypt, randomBytes, timingSafeEqual } from "node:crypto";
import { Buffer } from "node:buffer";

// OWASP scrypt configuration with a bounded 16 MiB working set per hash.
// Native node:crypto is supported by the Worker's nodejs_compat runtime.
const cost={N:16384,r:8,p:5,maxmem:24*1024*1024};
let hashing=0;
async function derive(password:string,salt:Uint8Array):Promise<Buffer> {
 if(hashing>=2)throw new Error("auth_busy");
 hashing++;
 try{return await new Promise<Buffer>((resolve,reject)=>scrypt(password,salt,32,cost,(error,key)=>error?reject(error):resolve(key)));}
 finally{hashing--;}
}
export const validPassword=(value:unknown):value is string=>typeof value==="string"&&[...value].length>=15&&[...value].length<=128;
export async function hashPassword(password:string) {
 const salt=randomBytes(16),key=await derive(password,salt);
 return "scrypt$16384$8$5$"+salt.toString("base64url")+"$"+key.toString("base64url");
}
export async function verifyPassword(password:string,stored:string|null) {
 const match=stored?.match(/^scrypt\$16384\$8\$5\$([A-Za-z0-9_-]{22})\$([A-Za-z0-9_-]{43})$/);
 // Do the same costly operation when an account does not exist.
 const key=await derive(password,match?Buffer.from(match[1],"base64url"):Buffer.alloc(16));
 const expected=match?Buffer.from(match[2],"base64url"):Buffer.alloc(32);
 return timingSafeEqual(key,expected)&&!!match;
}

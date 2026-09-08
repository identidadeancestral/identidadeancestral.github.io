import test from "node:test";
import assert from "node:assert/strict";
import {readFile} from "node:fs/promises";
import ts from "typescript";
import {Miniflare} from "miniflare";

test("the deployed Worker runtime supports the actual password hashing configuration",async()=>{
 const source=await readFile(new URL("../lib/passwords.ts",import.meta.url),"utf8");
 const js=ts.transpileModule(source,{compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.ES2022}}).outputText;
 const runtime=new Miniflare({modules:true,compatibilityDate:"2026-05-15",compatibilityFlags:["nodejs_compat"],script:js+`\nexport default {async fetch(){const password="Synthetic runtime test phrase 42!";const hash=await hashPassword(password);return Response.json({correct:await verifyPassword(password,hash),wrong:await verifyPassword("Different synthetic phrase 24!",hash)});}};`});
 try{const response=await runtime.dispatchFetch("https://password-test.invalid/");assert.equal(response.status,200);assert.deepEqual(await response.json(),{correct:true,wrong:false});}
 finally{await runtime.dispose();}
});

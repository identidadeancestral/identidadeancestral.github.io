import type { Database, Statement } from "../../lib/chat-server";
export const tables=["profiles","rooms","members","messages","blocks","frontend_codes","frontend_sessions","study_progress","email_accounts","account_sessions","account_rate_limits"] as const;
type Row=Record<string,unknown>;
export type Query=(text:string,values:unknown[])=>Promise<Row[]>;
export type Transaction=<T>(work:(query:Query)=>Promise<T>)=>Promise<T>;
const tableReference=new RegExp("\\b(FROM|JOIN|INTO|UPDATE)\\s+("+tables.join("|")+")\\b","gi");
// Only server-authored SQL reaches this adapter. No API accepts arbitrary SQL.
export function postgresQuery(source:string) {
 const ignore=/^\s*INSERT OR IGNORE\b/i.test(source);
 let query=source.replace(/^\s*INSERT OR IGNORE\b/i,"INSERT").replace(/\bMAX\(last_read,/gi,"GREATEST(last_read,");
 let count=0;
 const parts=query.split(/('(?:''|[^'])*'|"(?:""|[^"])*"|--[^\n]*(?:\n|$)|\/\*[\s\S]*?\*\/)/g);
 query=parts.map((part,i)=>i%2?part:part.replace(tableReference,"$1 ojiisan.$2").replace(/\?/g,()=>"$"+(++count))).join("");
 if(ignore)query=query.replace(/;?\s*$/," ON CONFLICT DO NOTHING");
 return {text:query,count};
}
function normalize(row:Row):Row {
 return Object.fromEntries(Object.entries(row).map(([key,value])=>{
  if(typeof value!=="bigint")return [key,value];
  const n=Number(value);if(!Number.isSafeInteger(n))throw new Error("Numeric value exceeds application range");return [key,n];
 }));
}
class PgStatement implements Statement {
 constructor(readonly owner:PostgresDatabase,readonly source:string,readonly values:unknown[]=[]){ }
 bind(...values:unknown[]){return new PgStatement(this.owner,this.source,values);}
 async rows(query:Query){const compiled=postgresQuery(this.source);if(compiled.count!==this.values.length)throw new Error("SQL parameter count mismatch");return (await query(compiled.text,this.values)).map(normalize);}
 async first<T=Row>(){return (await this.rows(this.owner.query))[0] as T||null;}
 async all<T=Row>(){return {results:await this.rows(this.owner.query) as T[]};}
 async run(){return this.rows(this.owner.query);}
}
export class PostgresDatabase implements Database {
 constructor(readonly query:Query,private readonly transaction:Transaction){ }
 prepare(source:string){return new PgStatement(this,source);}
 async batch(statements:Statement[]){
  for(const item of statements)if(!(item instanceof PgStatement)||item.owner!==this)throw new Error("Foreign statement rejected");
  return this.transaction(async query=>{const result=[];for(const item of statements as PgStatement[])result.push(await item.rows(query));return result;});
 }
}

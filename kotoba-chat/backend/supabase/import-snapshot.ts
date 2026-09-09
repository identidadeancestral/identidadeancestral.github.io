import type { Query, Transaction } from "./postgres-adapter";
// The export is private operational data. Never commit it or put it in a public
// bucket. Copy rows only through an authenticated owner export, without truncation.
export const importColumns={
 profiles:["id","auth_key","nickname","language","level","avatar","available","last_seen","created_at"],
 rooms:["id","kind","title","owner_id","dm_key","created_at","updated_at"],
 members:["room_id","user_id","state","inviter_id","invited_at","last_read"],
 messages:["id","client_id","room_id","user_id","japanese","payload","created_at"],
 blocks:["user_id","target_id","created_at"],
 frontend_codes:["code_hash","auth_key","challenge","expires_at"],
 frontend_sessions:["token_hash","auth_key","expires_at"],
 study_progress:["auth_key","story_id","step","due_at","reviewed_at","attempts"],
 email_accounts:["auth_key","email","password_hash","recovery_hash","session_epoch","created_at","updated_at"],
 account_sessions:["token_hash","auth_key","expires_at","created_at","session_epoch"],
 account_rate_limits:["bucket","hits","expires_at"],
} as const;
type Table=keyof typeof importColumns;
type Snapshot={format:"ojiisan-export-v1";complete:true;tables:Record<Table,{rows:Record<string,unknown>[];columns:string[]}>};
const order:Table[]=["profiles","rooms","members","messages","blocks","frontend_codes","frontend_sessions","study_progress","email_accounts","account_sessions","account_rate_limits"];
export function validateSnapshot(value:unknown):Snapshot {
 if(!value||typeof value!=="object")throw new Error("Invalid export");
 const s=value as Snapshot;
 if(s.format!=="ojiisan-export-v1"||s.complete!==true||!s.tables||Object.keys(s.tables).length!==order.length)throw new Error("Incomplete export");
 for(const table of order){
  const part=s.tables[table],columns=[...importColumns[table]];
  if(!part||!Array.isArray(part.columns)||part.columns.length!==columns.length||!columns.every(c=>part.columns.includes(c))||!Array.isArray(part.rows))throw new Error("Invalid export table: "+table);
  for(const row of part.rows){
   if(!row||Object.keys(row).length!==columns.length||!columns.every(c=>Object.hasOwn(row,c)))throw new Error("Incomplete export row: "+table);
   for(const item of Object.values(row))if(item!==null&&typeof item!=="string"&&!(typeof item==="number"&&Number.isSafeInteger(item)))throw new Error("Unsupported export value");
  }
 }
 return s;
}
export async function importSnapshot(value:unknown,transaction:Transaction) {
 const s=validateSnapshot(value);
 return transaction(async (query:Query)=>{
  // Destination only. Never overwrite an active backend or merge snapshots
  // collected while writes continued. Lock and reject any nonempty target.
  await query("LOCK TABLE "+order.map(t=>"ojiisan."+t).join(",")+" IN ACCESS EXCLUSIVE MODE",[]);
  for(const table of order){const rows=await query("SELECT count(*) AS n FROM ojiisan."+table,[]);if(Number(rows[0].n)!==0)throw new Error("Destination is not empty: "+table);}
  const counts:Record<string,number>={};
  for(const table of order){
   const columns=[...importColumns[table]],sql="INSERT INTO ojiisan."+table+" ("+columns.join(",")+") VALUES ("+columns.map((_,i)=>"$"+(i+1)).join(",")+")";
   for(const row of s.tables[table].rows)await query(sql,columns.map(c=>row[c]));
   const saved=await query("SELECT count(*) AS n FROM ojiisan."+table,[]);counts[table]=Number(saved[0].n);
   if(counts[table]!==s.tables[table].rows.length)throw new Error("Import count mismatch");
  }
  await query("SELECT setval(pg_get_serial_sequence('ojiisan.messages','id'),GREATEST(COALESCE(MAX(id),0)+1,1),false) FROM ojiisan.messages",[]);
  return counts;
 });
}

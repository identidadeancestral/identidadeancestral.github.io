import { env } from "cloudflare:workers";
import type { BackendMode } from "@/lib/backend-transition";
export function backendMode():BackendMode {
 const value=(env as unknown as Record<string,unknown>).OJIISAN_BACKEND_MODE;
 return value==="supabase"||value==="freeze"?value:"legacy";
}

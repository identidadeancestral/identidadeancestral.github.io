import { env } from "cloudflare:workers";
export function getChatDb() {
  if (!env.DB) throw new Error("Chat database unavailable");
  return env.DB;
}

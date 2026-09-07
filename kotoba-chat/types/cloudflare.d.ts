type Fetcher = { fetch(input:Request|string,init?:RequestInit):Promise<Response> };
type D1Database = import('../lib/chat-server').Database;
declare module "cloudflare:workers" {
  export const env: {DB:import('../lib/chat-server').Database};
}

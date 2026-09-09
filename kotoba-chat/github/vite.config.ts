import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { fileURLToPath } from "node:url";
import { SUPABASE_API } from "../lib/frontend-config";
import { alignApiCsp, configuredApiOrigin } from "./csp.mjs";
const apiBase=(process.env.OJIISAN_API_BASE||SUPABASE_API).replace(/\/$/,"");
configuredApiOrigin(apiBase);
export default defineConfig({
 define:{"__OJIISAN_API_BASE__":JSON.stringify(apiBase)},
 root:fileURLToPath(new URL(".",import.meta.url)),base:"/ojiisan-chat/",plugins:[react(),{name:"ojiisan-api-csp",transformIndexHtml:{order:"post",handler:html=>alignApiCsp(html,apiBase)}}],
 resolve:{alias:{"@":fileURLToPath(new URL("..",import.meta.url))}},
 css:{postcss:fileURLToPath(new URL("..",import.meta.url))},
 build:{outDir:"../github-dist",emptyOutDir:true,sourcemap:false,rollupOptions:{output:{entryFileNames:"assets/app-[hash].js",chunkFileNames:"assets/chunk-[hash].js",assetFileNames:"assets/[name]-[hash][extname]"}}},
});

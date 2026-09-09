import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { fileURLToPath } from "node:url";
const apiBase=process.env.OJIISAN_API_BASE?.replace(/\/$/,"");
if(apiBase){const u=new URL(apiBase);if(u.protocol!=="https:"||u.username||u.password||u.search||u.hash||!/^\/functions\/v1\/ojiisan-api$/.test(u.pathname))throw new Error("OJIISAN_API_BASE must be the verified HTTPS Supabase function URL");}
export default defineConfig({
 define:apiBase?{"__OJIISAN_API_BASE__":JSON.stringify(apiBase)}:{},
 root:fileURLToPath(new URL(".",import.meta.url)),base:"/ojiisan-chat/",plugins:[react()],
 resolve:{alias:{"@":fileURLToPath(new URL("..",import.meta.url))}},
 css:{postcss:fileURLToPath(new URL("..",import.meta.url))},
 build:{outDir:"../github-dist",emptyOutDir:true,sourcemap:false,rollupOptions:{output:{entryFileNames:"assets/app-[hash].js",chunkFileNames:"assets/chunk-[hash].js",assetFileNames:"assets/[name]-[hash][extname]"}}},
});

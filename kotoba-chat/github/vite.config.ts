import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { fileURLToPath } from "node:url";
export default defineConfig({
 root:fileURLToPath(new URL(".",import.meta.url)),base:"/ojiisan-chat/",plugins:[react()],
 resolve:{alias:{"@":fileURLToPath(new URL("..",import.meta.url))}},
 css:{postcss:fileURLToPath(new URL("..",import.meta.url))},
 build:{outDir:"../github-dist",emptyOutDir:true,sourcemap:false,rollupOptions:{output:{entryFileNames:"assets/app-[hash].js",chunkFileNames:"assets/chunk-[hash].js",assetFileNames:"assets/[name]-[hash][extname]"}}},
});

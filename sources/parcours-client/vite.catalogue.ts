import { defineConfig } from "vite";
export default defineConfig({build:{outDir:"dist-catalogue",emptyOutDir:true,manifest:true,rollupOptions:{input:"entry-client.tsx",output:{entryFileNames:"assets/catalogue-[hash].js",chunkFileNames:"assets/catalogue-[hash].js",assetFileNames:"assets/catalogue-[hash][extname]"}}}});

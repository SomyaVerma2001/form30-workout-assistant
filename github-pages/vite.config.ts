import react from "@vitejs/plugin-react";
import { fileURLToPath, URL } from "node:url";
import { defineConfig } from "vite";

const projectRoot = fileURLToPath(new URL("./", import.meta.url));

export default defineConfig({
  root: projectRoot,
  base: "/form30-workout-assistant/",
  publicDir: fileURLToPath(new URL("../public", import.meta.url)),
  plugins: [react()],
  resolve: {
    alias: {
      "next/image": fileURLToPath(new URL("./src/next-image.tsx", import.meta.url)),
    },
  },
  build: {
    outDir: fileURLToPath(new URL("../dist-pages", import.meta.url)),
    emptyOutDir: true,
  },
});

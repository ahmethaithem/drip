import { defineConfig } from "vite";
import vinext from "vinext";
import { nitro } from "nitro/vite";

export default defineConfig({
  build: {
    rolldownOptions: {
      external: ["cloudflare:workers"],
    },
  },
  plugins: [vinext(), nitro({ preset: "vercel" })],
});

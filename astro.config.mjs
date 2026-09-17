import { defineConfig } from "astro/config";
import tailwindcss from "@tailwindcss/vite";
import vercel from '@astrojs/vercel';

export default defineConfig({
  site: "https://webprostudio.vn",
  output: "static",
  adapter: vercel(),
  vite: {
    plugins: [tailwindcss()],
  },
});

import mdx from "@astrojs/mdx";
import sitemap from "@astrojs/sitemap";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "astro/config";
import keystatic from "@keystatic/astro";
import react from "@astrojs/react";

const isProd = process.env.NODE_ENV === "production" || process.argv.includes("build") || process.argv.includes("telemetry");
const enableKeystatic = !isProd && process.env.ENABLE_KEYSTATIC === "true";

export default defineConfig({
  site: "https://example.com",
  integrations: [
    react(),
    mdx(),
    sitemap(),
    ...(enableKeystatic ? [keystatic()] : [])
  ],
  markdown: {
    shikiConfig: {
      theme: "github-dark"
    }
  },
  vite: {
    plugins: [tailwindcss()]
  }
});

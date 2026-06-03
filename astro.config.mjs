import mdx from "@astrojs/mdx";
import sitemap from "@astrojs/sitemap";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "astro/config";
import keystatic from "@keystatic/astro";
import react from "@astrojs/react";
import { loadEnv } from "vite";

const mode = process.env.NODE_ENV === "production" ? "production" : "development";
const env = loadEnv(mode, process.cwd(), "");
const enableKeystatic = mode !== "production" && env.ENABLE_KEYSTATIC === "true";

export default defineConfig({
  site: "https://livvvi.com",
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

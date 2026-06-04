import mdx from "@astrojs/mdx";
import sitemap from "@astrojs/sitemap";
import cloudflare from "@astrojs/cloudflare";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "astro/config";
import keystatic from "@keystatic/astro";
import react from "@astrojs/react";
import { loadEnv } from "vite";

const mode = process.env.NODE_ENV === "production" ? "production" : "development";
const env = loadEnv(mode, process.cwd(), "");
const skipKeystatic = env.SKIP_KEYSTATIC === "true";
const enableCloudflareAdapter = mode === "production" || env.ENABLE_CLOUDFLARE_ADAPTER === "true";
const cloudflareDevOptimizeExcludes = [
  "@astrojs/cloudflare/entrypoints/server",
  "@keystatic/astro/internal/keystatic-api.js",
  "@keystatic/astro/internal/keystatic-page.js",
  "astro/app",
  "astro/app/entrypoint/dev",
  "astro/app/fetch/default-handler"
];

export default defineConfig({
  site: "https://livvvi.com",
  ...(enableCloudflareAdapter
    ? {
        adapter: cloudflare({
          imageService: "compile"
        })
      }
    : {}),
  integrations: [
    react(),
    mdx(),
    sitemap(),
    ...(skipKeystatic ? [] : [keystatic()])
  ],
  markdown: {
    shikiConfig: {
      theme: "github-dark"
    }
  },
  vite: {
    plugins: [tailwindcss()],
    optimizeDeps: {
      exclude: cloudflareDevOptimizeExcludes
    },
    ssr: {
      optimizeDeps: {
        exclude: cloudflareDevOptimizeExcludes
      }
    }
  }
});

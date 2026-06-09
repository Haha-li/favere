import { MANIFEST, SITE } from "@/consts";

export function GET() {
  return new Response(
    JSON.stringify({
      name: SITE.title,
      short_name: SITE.shortName,
      start_url: "/",
      display: "standalone",
      background_color: MANIFEST.backgroundColor,
      theme_color: MANIFEST.themeColor,
      icons: []
    }),
    {
      headers: {
        "content-type": "application/manifest+json; charset=utf-8"
      }
    }
  );
}

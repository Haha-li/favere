import { SITE } from "@/consts";

export function GET() {
  return new Response(JSON.stringify({ ok: true, service: SITE.serviceName }), {
    headers: {
      "content-type": "application/json; charset=utf-8"
    }
  });
}

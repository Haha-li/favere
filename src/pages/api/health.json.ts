export function GET() {
  return new Response(JSON.stringify({ ok: true, service: "favere-blog" }), {
    headers: {
      "content-type": "application/json; charset=utf-8"
    }
  });
}


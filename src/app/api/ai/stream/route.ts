import { currentUser, db } from "@/lib/db";
import { SYSTEM } from "@/lib/ai";
export async function POST(req: Request) {
  const u = await currentUser(), { prompt } = await req.json();
  const r = await fetch("https://api.openai.com/v1/chat/completions", { method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${process.env.OPENAI_API_KEY}` },
    body: JSON.stringify({ model: process.env.OPENAI_MODEL || "gpt-4o-mini", stream: true, messages: [{ role: "system", content: SYSTEM }, { role: "user", content: String(prompt).slice(0, 4000) }] }) });
  const enc = new TextEncoder(), dec = new TextDecoder();
  const stream = new ReadableStream({
    async start(c) {
      const rd = r.body!.getReader(); let buf = "", n = 0;
      for (;;) {
        const { done, value } = await rd.read(); if (done) break;
        buf += dec.decode(value, { stream: true }); const lines = buf.split("\n"); buf = lines.pop()!;
        for (const l of lines) { if (!l.startsWith("data: ") || l.includes("[DONE]")) continue; try { const t = JSON.parse(l.slice(6)).choices?.[0]?.delta?.content; if (t) { n += t.length; c.enqueue(enc.encode(t)); } } catch {} }
      }
      await db.aiLog.create({ data: { userId: u.id, fn: "chat-stream", tokens: Math.round(n / 4), costEstimate: (n / 4) * 6e-7 } });
      c.close();
    },
  });
  return new Response(stream, { headers: { "Content-Type": "text/plain; charset=utf-8" } });
}

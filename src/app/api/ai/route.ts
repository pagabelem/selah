import { NextResponse } from "next/server";
import { currentUser, db } from "@/lib/db";
import { askAI } from "@/lib/ai";
const hits = new Map<string, number>();
export async function POST(req: Request) {
  const u = await currentUser();
  const day = new Date().toISOString().slice(0, 10) + u.id;
  if ((hits.get(day) ?? 0) >= 50) return NextResponse.json({ answer: "Limite quotidienne atteinte." }, { status: 429 });
  hits.set(day, (hits.get(day) ?? 0) + 1);
  const { prompt, entryId, fn = "chat" } = await req.json();
  let ctx = "";
  if (entryId) {
    const e = await db.journalEntry.findFirst({ where: { id: entryId, userId: u.id, neverSendToAi: false } });
    if (e) ctx = `Entrée (${e.type}) « ${e.title} » : ${e.body}\n\n`;
  }
  const answer = await askAI(u.id, fn, ctx + String(prompt).slice(0, 4000));
  if (entryId && fn === "interpret") await db.journalEntry.updateMany({ where: { id: entryId, userId: u.id }, data: { aiInterpretation: answer } });
  return NextResponse.json({ answer });
}

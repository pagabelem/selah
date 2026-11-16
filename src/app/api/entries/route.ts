import { NextResponse } from "next/server";
import { currentUser, db } from "@/lib/db";
import { indexEntry } from "@/lib/embed";
export async function POST(req: Request) {
  const u = await currentUser(), d = await req.json();
  if (!String(d.body || "").trim()) return NextResponse.json({ error: "vide" }, { status: 400 });
  const type = ["REVE", "VISION", "REVELATION"].includes(d.type) ? d.type : "REVE";
  const e = await db.journalEntry.create({ data: { userId: u.id, type, title: String(d.title || "").trim() || "Sans titre", body: String(d.body) } });
  await indexEntry(e.id, u.id, `${e.title}\n${e.body}`).catch(() => {});
  return NextResponse.json({ ok: true });
}

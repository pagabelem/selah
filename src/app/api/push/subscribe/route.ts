import { NextResponse } from "next/server";
import { currentUser, db } from "@/lib/db";
export async function POST(req: Request) {
  const u = await currentUser();
  const s = await req.json();
  await db.pushSubscription.upsert({ where: { endpoint: s.endpoint }, update: { keys: s.keys }, create: { userId: u.id, endpoint: s.endpoint, keys: s.keys, device: req.headers.get("user-agent")?.slice(0, 80) } });
  return NextResponse.json({ ok: true });
}

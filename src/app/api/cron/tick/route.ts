import { NextResponse } from "next/server";
import webpush from "web-push";
import { db } from "@/lib/db";
import { askAI } from "@/lib/ai";
import { VERSES } from "@/lib/verses";
export const dynamic = "force-dynamic";
async function push(userId: string, title: string, body: string, url = "/") {
  webpush.setVapidDetails(process.env.VAPID_SUBJECT!, process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!, process.env.VAPID_PRIVATE_KEY!);
  const subs = await db.pushSubscription.findMany({ where: { userId } });
  await Promise.all(subs.map((s) => webpush.sendNotification({ endpoint: s.endpoint, keys: s.keys as { p256dh: string; auth: string } }, JSON.stringify({ title, body, url })).catch(() => db.pushSubscription.delete({ where: { id: s.id } }))));
}
export async function GET(req: Request) {
  if (req.headers.get("authorization") !== `Bearer ${process.env.CRON_SECRET}`) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const now = new Date();
  const rems = await db.reminder.findMany({ where: { sentAt: null }, include: { meeting: true } });
  for (const r of rems) {
    const at = r.meeting.startsAt.getTime() - r.minutesBefore * 60000;
    if (at <= now.getTime() && at > now.getTime() - 5 * 60000) {
      await push(r.meeting.userId, r.meeting.title, `${r.meeting.startsAt.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit", timeZone: "Africa/Casablanca" })} — ${r.meeting.place ?? ""}`, "/agenda");
      await db.reminder.update({ where: { id: r.id }, data: { sentAt: now } });
    }
  }
  const hour = Number(new Intl.DateTimeFormat("en", { hour: "numeric", hour12: false, timeZone: "Africa/Casablanca" }).format(now));
  if (hour === 6) {
    const date = new Date(now.toISOString().slice(0, 10));
    for (const u of await db.user.findMany()) {
      if (await db.dailyWord.findUnique({ where: { userId_date: { userId: u.id, date } } })) continue;
      const n = await db.verse.count();
      const dbv = n ? (await db.verse.findMany({ skip: Math.floor(Math.random() * n), take: 1 }))[0] : null;
      const v = dbv ? { ref: dbv.ref, text: dbv.text } : VERSES[Math.floor(Math.random() * VERSES.length)];
      const thought = await askAI(u.id, "daily-word", `Verset : ${v.ref} — « ${v.text} ». Rédige en 2 phrases une pensée d'encouragement et une courte suggestion de prière.`);
      await db.dailyWord.create({ data: { userId: u.id, date, reference: v.ref, verseText: v.text, thought } });
      await push(u.id, `Parole du jour — ${v.ref}`, v.text);
    }
  }
  return NextResponse.json({ ok: true });
}

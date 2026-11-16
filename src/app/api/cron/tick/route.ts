import { NextResponse } from "next/server";
import { timingSafeEqual } from "crypto";
import webpush from "web-push";
import { db } from "@/lib/db";
import { askAI } from "@/lib/ai";
import { VERSES } from "@/lib/verses";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

const TZ = "Africa/Casablanca";
const BUDGET_MS = 25_000; // cron-job.org coupe à 30 s : le reste est repris à la minute suivante
const REMINDER_WINDOW_MS = 5 * 60_000;

function authorized(req: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;
  const a = Buffer.from(req.headers.get("authorization") ?? "");
  const b = Buffer.from(`Bearer ${secret}`);
  return a.length === b.length && timingSafeEqual(a, b);
}

async function push(userId: string, title: string, body: string, url = "/") {
  webpush.setVapidDetails(process.env.VAPID_SUBJECT!, process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!, process.env.VAPID_PRIVATE_KEY!);
  const subs = await db.pushSubscription.findMany({ where: { userId } });
  await Promise.all(
    subs.map((s) =>
      webpush
        .sendNotification({ endpoint: s.endpoint, keys: s.keys as { p256dh: string; auth: string } }, JSON.stringify({ title, body, url }))
        .catch((e: { statusCode?: number }) => {
          // On ne supprime l'abonnement que s'il est réellement expiré
          if (e.statusCode === 404 || e.statusCode === 410) return db.pushSubscription.deleteMany({ where: { id: s.id } });
        })
    )
  );
}

export async function GET(req: Request) {
  if (!authorized(req)) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const t0 = Date.now();
  const now = new Date();
  let reminders = 0, words = 0;

  // 1) Rappels de rencontres : réservation atomique avant envoi => jamais de doublon
  const rems = await db.reminder.findMany({
    where: {
      sentAt: null,
      meeting: { startsAt: { gte: new Date(now.getTime() - REMINDER_WINDOW_MS), lte: new Date(now.getTime() + 25 * 3600_000) } },
    },
    include: { meeting: true },
  });
  for (const r of rems) {
    const at = r.meeting.startsAt.getTime() - r.minutesBefore * 60_000;
    if (at > now.getTime() || at <= now.getTime() - REMINDER_WINDOW_MS) continue;
    const claim = await db.reminder.updateMany({ where: { id: r.id, sentAt: null }, data: { sentAt: now } });
    if (claim.count !== 1) continue; // un autre appel s'en occupe
    try {
      await push(
        r.meeting.userId,
        r.meeting.title,
        `${r.meeting.startsAt.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit", timeZone: TZ })} — ${r.meeting.place ?? ""}`,
        "/agenda"
      );
      reminders++;
    } catch {
      await db.reminder.updateMany({ where: { id: r.id }, data: { sentAt: null } }); // sera retenté dans la fenêtre
    }
  }

  // 2) Parole du jour à 6 h (Africa/Casablanca) : idempotente, reprenable, limitée en temps
  const hour = Number(new Intl.DateTimeFormat("en", { hour: "numeric", hour12: false, timeZone: TZ }).format(now));
  if (hour === 6) {
    const date = new Date(now.toISOString().slice(0, 10));
    const users = await db.user.findMany({ where: { words: { none: { date } } } });
    for (const u of users) {
      if (Date.now() - t0 > BUDGET_MS) break; // le reste sera traité au prochain passage
      try {
        const n = await db.verse.count();
        const dbv = n ? (await db.verse.findMany({ skip: Math.floor(Math.random() * n), take: 1 }))[0] : null;
        const v = dbv ? { ref: dbv.ref, text: dbv.text } : VERSES[Math.floor(Math.random() * VERSES.length)];
        const thought = await askAI(u.id, "daily-word", `Verset : ${v.ref} — « ${v.text} ». Rédige en 2 phrases une pensée d'encouragement et une courte suggestion de prière.`);
        try {
          await db.dailyWord.create({ data: { userId: u.id, date, reference: v.ref, verseText: v.text, thought } });
        } catch {
          continue; // contrainte unique (userId, date) : déjà créée par un autre appel => pas de notification en double
        }
        await push(u.id, `Parole du jour — ${v.ref}`, v.text);
        words++;
      } catch {
        // échec ponctuel (IA, réseau) : l'utilisateur sera retenté à la minute suivante
      }
    }
  }

  return NextResponse.json({ ok: true, reminders, words, ms: Date.now() - t0 });
}
import { db } from "./db";
import { askAI } from "./ai";
export const D = (v: string) => new Date(v + "T00:00:00.000Z");
export const iso = (d: Date) => d.toISOString().slice(0, 10);
export const shift = (v: string, n: number) => iso(new Date(D(v).getTime() + n * 864e5));
export const todayIn = (tz: string) => {
  try { return new Intl.DateTimeFormat("en-CA", { timeZone: tz }).format(new Date()); }
  catch { return new Intl.DateTimeFormat("en-CA", { timeZone: "Africa/Casablanca" }).format(new Date()); }
};
// Copie vers `to` les tâches non faites datées avant `before` (idempotent)
export async function carry(userId: string, to: string, before: string) {
  const open = await db.dayTask.findMany({ where: { userId, done: false, carried: false, date: { lt: D(before) } } });
  for (const t of open) {
    const c = await db.dayTask.updateMany({ where: { id: t.id, carried: false }, data: { carried: true } });
    if (c.count === 1) await db.dayTask.create({ data: { userId, date: D(to), title: t.title, carriedFrom: t.carriedFrom ?? t.date } });
  }
}





export const hourIn = (tz: string) => {
  try { return Number(new Intl.DateTimeFormat("en", { hour: "numeric", hour12: false, timeZone: tz }).format(new Date())) % 24; } catch { return -1; }
};
const RSYS = `Tu rédiges un bilan du soir bref et chaleureux, en français (tutoiement), à partir des tâches du jour. Réponds UNIQUEMENT en JSON : {"gratitude":"1 à 2 phrases de gratitude ou de victoire fondées sur ce qui a été fait","notes":"2 à 3 phrases : ce qui reste à faire et une suggestion pour demain"}. N'invente rien.`;
export async function autoReview(userId: string, tz: string, date = todayIn(tz), force = false) {
  const day = D(date);
  const [plan, tasks] = await Promise.all([
    db.dailyPlan.findUnique({ where: { userId_date: { userId, date: day } } }),
    db.dayTask.findMany({ where: { userId, date: day } }),
  ]);
  if (!tasks.length || (!force && plan?.gratitude && plan?.eveningReview) || !process.env.OPENAI_API_KEY) return false;
  const list = (d: boolean) => tasks.filter((t) => t.done === d).map((t) => t.title).join("; ") || "aucune";
  const raw = await askAI(userId, "evening-review", `Tâches faites : ${list(true)}\nTâches non faites : ${list(false)}`, RSYS);
  let j: { gratitude?: string; notes?: string };
  try { j = JSON.parse(raw.replace(/```json|```/g, "").trim()); } catch { return false; }
  const pick = (cur: string | null | undefined, ai?: string) => (force ? ai || cur || "" : cur || ai || "");
  const data = { gratitude: pick(plan?.gratitude, j.gratitude), eveningReview: pick(plan?.eveningReview, j.notes) };
  await db.dailyPlan.upsert({ where: { userId_date: { userId, date: day } }, update: data, create: { userId, date: day, ...data } });
  return true;
}
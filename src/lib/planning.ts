import { db } from "./db";
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
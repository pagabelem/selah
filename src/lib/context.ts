import { db } from "./db";
import { iso, todayIn } from "./planning";
export async function buildContext(userId: string, tz: string) {
  const today = todayIn(tz), from = new Date(new Date(today + "T00:00:00Z").getTime() - 35 * 864e5);
  const [tasks, goals, projects, nE, nP] = await Promise.all([
    db.dayTask.findMany({ where: { userId, date: { gte: from } }, orderBy: { date: "asc" } }),
    db.goal.findMany({ where: { userId }, take: 30 }),
    db.project.findMany({ where: { userId }, take: 30 }),
    db.journalEntry.count({ where: { userId, occurredAt: { gte: from } } }),
    db.promise.count({ where: { userId, fulfilledAt: { gte: from } } }),
  ]);
  const byDay = new Map<string, string[]>();
  for (const t of tasks) {
    const k = iso(t.date);
    byDay.set(k, [...(byDay.get(k) ?? []), `${t.done ? "[fait]" : "[non fait]"} ${t.title}${t.carriedFrom ? " (reportée)" : ""}`]);
  }
  const lines = [...byDay].map(([d, l]) => `${d}: ${l.join("; ")}`).join("\n");
  return `Date du jour : ${today}. Pour les bilans d'activité (semaine, mois), appuie-toi uniquement sur ces données, sans rien inventer, et chiffre ce qui est fait et non fait.\nTÂCHES PAR JOUR (35 derniers jours) :\n${lines || "aucune"}\nPROJETS : ${projects.map((p) => `${p.name} (${p.status}, ${p.progress}%)`).join("; ") || "aucun"}\nOBJECTIFS : ${goals.map((g) => `${g.title} (${g.progress}${g.target ? "/" + g.target : "%"})`).join("; ") || "aucun"}\nSur 35 jours : ${nE} entrées de journal, ${nP} promesses accomplies.`;
}
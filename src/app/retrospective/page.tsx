import { db, currentUser } from "@/lib/db";
import PrintButton from "@/components/PrintButton";
export const dynamic = "force-dynamic";
export default async function Retro() {
  const u = await currentUser(), year = new Date().getFullYear(), r = { gte: new Date(year, 0, 1), lt: new Date(year + 1, 0, 1) };
  const [entries, promises, goals, vision, fasts] = await Promise.all([
    db.journalEntry.findMany({ where: { userId: u.id, occurredAt: r }, orderBy: { occurredAt: "asc" } }),
    db.promise.findMany({ where: { userId: u.id, status: "ACCOMPLIE", fulfilledAt: r } }),
    db.goal.findMany({ where: { userId: u.id, period: "ANNEE" } }), db.yearVision.findFirst({ where: { userId: u.id, year } }), db.fast.findMany({ where: { userId: u.id, startDate: r } }),
  ]);
  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between"><h2 className="gold-text font-serif text-5xl">Rétrospective {year}</h2><PrintButton /></div>
      {vision && <div className="glass p-6"><p className="text-gold">{vision.passage}</p><p className="font-serif text-3xl">{vision.theme}</p><p className="opacity-70">{vision.vision}</p></div>}
      <div className="grid grid-cols-3 gap-4 text-center">{[[entries.length, "entrées"], [promises.length, "promesses accomplies"], [fasts.length, "jeûnes"]].map(([n, l]) => <div key={l as string} className="glass p-4"><p className="gold-text font-serif text-5xl">{n}</p><p className="text-sm opacity-70">{l}</p></div>)}</div>
      <section><h3 className="mb-3 font-serif text-3xl">Promesses accomplies</h3>{promises.map((p) => <p key={p.id} className="glass mb-3 p-4 font-serif text-xl italic">« {p.text} » <span className="text-sm not-italic opacity-60">{p.testimony}</span></p>)}</section>
      <section><h3 className="mb-3 font-serif text-3xl">Objectifs de l'année</h3>{goals.map((g) => <p key={g.id} className="glass mb-3 p-4">{g.title} — {g.target ? `${g.progress}/${g.target}` : `${g.progress}%`}</p>)}</section>
      <section><h3 className="mb-3 font-serif text-3xl">Rêves et visions</h3>{entries.map((e) => <p key={e.id} className="mb-2">✦ {e.occurredAt.toLocaleDateString("fr-FR")} — {e.title}</p>)}</section>
    </div>
  );
}

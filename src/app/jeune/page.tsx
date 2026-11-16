import { db, currentUser } from "@/lib/db";
import { createFast } from "../actions2";
export const dynamic = "force-dynamic";
export default async function Jeune() {
  const u = await currentUser();
  const fasts = await db.fast.findMany({ where: { userId: u.id }, orderBy: { startDate: "desc" } });
  const day = (a: Date, b: Date) => Math.round((b.getTime() - a.getTime()) / 864e5) + 1;
  return (
    <div className="space-y-8">
      <h2 className="gold-text font-serif text-5xl">Suivi de jeûne</h2>
      <form action={createFast} className="glass grid gap-3 p-6 md:grid-cols-2">
        <select name="kind" className="input">{["complet", "partiel", "Daniel", "eau seulement", "médias"].map((k) => <option key={k}>{k}</option>)}</select>
        <input name="intention" placeholder="Intention de prière" className="input" />
        <input name="start" type="date" required className="input" /><input name="end" type="date" required className="input" />
        <textarea name="notes" placeholder="Notes" className="input md:col-span-2" /><button className="btn md:col-span-2">Enregistrer</button>
      </form>
      {fasts.map((f) => { const now = new Date(), total = day(f.startDate, f.endDate), cur = Math.min(total, Math.max(0, day(f.startDate, now))); return (
        <article key={f.id} className="glass p-6"><p className="text-xs uppercase tracking-widest text-gold">{f.kind} · {total} jour(s)</p><h3 className="font-serif text-2xl">{f.intention || "Jeûne"}</h3>
          <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/10"><div className="h-full bg-gold" style={{ width: `${(cur / total) * 100}%` }} /></div><p className="mt-2 text-sm opacity-70">Jour {cur}/{total} · {f.notes}</p></article>); })}
    </div>
  );
}

import DeleteButton from "@/components/DeleteButton";
import { db, currentUser } from "@/lib/db";
import { createGoal, progressGoal } from "../actions";
export const dynamic = "force-dynamic";
export default async function Objectifs() {
  const u = await currentUser();
  const goals = await db.goal.findMany({ where: { userId: u.id }, orderBy: { period: "asc" } });
  return (
    <div className="space-y-8">
      <h2 className="gold-text font-serif text-5xl">Objectifs</h2>
      <form action={createGoal} className="glass grid gap-3 p-6 md:grid-cols-4">
        <input name="title" required placeholder="Objectif" className="input md:col-span-2" />
        <select name="period" className="input"><option value="SEMAINE">Semaine</option><option value="MOIS">Mois</option><option value="ANNEE">Année</option></select>
        <select name="domain" className="input">{["spirituel", "famille", "ministère", "académique", "professionnel", "finances", "santé", "relations"].map((x) => <option key={x}>{x}</option>)}</select>
        <input name="target" type="number" placeholder="Cible chiffrée (optionnel)" className="input md:col-span-3" /><button className="btn">Ajouter</button>
      </form>
      <div className="grid gap-5 md:grid-cols-2">{goals.map((g) => {
        const pct = Math.round((g.progress / (g.target ?? 100)) * 100);
        return (
          <article key={g.id} className="glass p-6">
            <p className="text-xs uppercase tracking-widest text-gold">{g.period} · {g.domain}</p>
            <h3 className="font-serif text-2xl">{g.title}</h3><DeleteButton entity="goal" id={g.id} />
            <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/10"><div className="h-full rounded-full bg-gradient-to-r from-sage to-gold" style={{ width: `${pct}%` }} /></div>
            <form action={progressGoal} className="mt-3 flex items-center justify-between"><input type="hidden" name="id" value={g.id} /><span className="text-sm opacity-70">{g.target ? `${g.progress}/${g.target}` : `${pct}%`}</span><button className="btn !px-4 !py-1 text-sm">{g.target ? "+1" : "Atteint"}</button></form>
          </article>
        );
      })}</div>
    </div>
  );
}

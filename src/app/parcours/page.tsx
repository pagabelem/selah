import { db, currentUser } from "@/lib/db";
import { createMilestone } from "../actions2";
export const dynamic = "force-dynamic";
export default async function Parcours() {
  const u = await currentUser();
  const ms = await db.milestone.findMany({ where: { userId: u.id }, orderBy: { startDate: "asc" } });
  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between"><h2 className="gold-text font-serif text-5xl">Parcours</h2><a href="/parcours/cv" className="btn !px-4 !py-2 text-sm">CV (PDF)</a></div>
      <form action={createMilestone} className="glass grid gap-3 p-6 md:grid-cols-2">
        <input name="title" required placeholder="Jalon (baptême, diplôme…)" className="input" />
        <select name="kind" className="input"><option value="ecclesial">Ecclésial</option><option value="academique">Académique</option></select>
        <input name="start" type="date" required className="input" /><input name="institution" placeholder="Lieu / institution" className="input" />
        <textarea name="description" placeholder="Description" className="input md:col-span-2" /><button className="btn md:col-span-2">Ajouter</button>
      </form>
      <ol className="relative space-y-6 border-l border-gold/40 pl-8">{ms.map((m) => (
        <li key={m.id} className="relative"><span className={`absolute -left-[41px] top-2 h-4 w-4 rounded-full ${m.kind === "ecclesial" ? "bg-gold" : "bg-sage"} shadow-[0_0_12px_currentColor]`} />
          <div className="glass p-5"><p className="text-xs uppercase tracking-widest opacity-60">{m.startDate.getFullYear()} · {m.kind}</p><h3 className="font-serif text-2xl">{m.title}</h3><p className="opacity-70">{m.institution}</p><p className="text-sm opacity-60">{m.description}</p></div></li>
      ))}</ol>
    </div>
  );
}

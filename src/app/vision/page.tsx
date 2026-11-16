import { db, currentUser } from "@/lib/db";
import { saveVision } from "../actions";
export const dynamic = "force-dynamic";
export default async function Vision() {
  const u = await currentUser();
  const all = await db.yearVision.findMany({ where: { userId: u.id }, orderBy: { year: "desc" } });
  const cur = all.find((v) => v.year === new Date().getFullYear());
  return (
    <div className="space-y-8">
      <h2 className="gold-text font-serif text-5xl">Vision de l'année</h2>
      <form action={saveVision} className="glass space-y-3 p-6">
        <input name="theme" defaultValue={cur?.theme} required placeholder="Thématique" className="input" />
        <input name="passage" defaultValue={cur?.passage} required placeholder="Passage biblique annuel (ex. Ésaïe 43:19)" className="input" />
        <textarea name="vision" defaultValue={cur?.vision} placeholder="Vision spirituelle" rows={4} className="input" />
        <input name="keywords" defaultValue={cur?.keywords.join(", ")} placeholder="Mots-clés, séparés par des virgules" className="input" />
        <button className="btn">Enregistrer</button>
      </form>
      <h3 className="font-serif text-3xl">Années précédentes</h3>
      {all.filter((v) => v !== cur).map((v) => <article key={v.id} className="glass p-6"><p className="text-gold">{v.year} · {v.passage}</p><p className="font-serif text-2xl">{v.theme}</p><p className="opacity-70">{v.vision}</p></article>)}
    </div>
  );
}

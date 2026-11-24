import { db, currentUser } from "@/lib/db";
import { createMilestone } from "../actions2";
import { importCv } from "../profil/files";
import { signedUrl } from "@/lib/storage";
import DeleteButton from "@/components/DeleteButton";
export const dynamic = "force-dynamic";
export const maxDuration = 60;
const dot: Record<string, string> = { ecclesial: "bg-gold", academique: "bg-sage", professionnel: "bg-sky-400" };
export default async function Parcours({ searchParams }: { searchParams: { cv?: string } }) {
  const u = await currentUser();
  const [ms, cvUrl] = await Promise.all([db.milestone.findMany({ where: { userId: u.id }, orderBy: { startDate: "asc" } }), u.cvPath ? signedUrl(u.cvPath) : null]);
  const cv = searchParams.cv;
  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between"><h2 className="gold-text font-serif text-5xl">Parcours</h2><a href="/parcours/cv" className="btn !px-4 !py-2 text-sm">CV (PDF)</a></div>
      {cv && <p className={cv === "err" ? "text-red-300" : "text-emerald-300"}>{cv === "err" ? "Import impossible : vérifie que c'est un PDF de 4 Mo maximum et que le stockage est configuré." : `${cv} jalon(s) importé(s) depuis ton CV. Tu peux les modifier ou les supprimer ci-dessous.`}</p>}
      <form data-no-toast action={importCv} className="glass space-y-3 p-6">
        <h3 className="font-serif text-2xl">Importer mon CV</h3>
        <p className="text-sm opacity-70">PDF, 4 Mo maximum. Le CV est envoyé à l'IA pour remplir ton parcours automatiquement (ecclésial, académique, professionnel). L'analyse peut prendre jusqu'à 30 secondes.</p>
        <input type="file" name="file" accept="application/pdf" required className="input" /><button className="btn">Analyser mon CV</button>
        {cvUrl && <a href={cvUrl} target="_blank" className="block text-sm text-gold">Voir le dernier CV importé</a>}
      </form>
      <form action={createMilestone} className="glass grid gap-3 p-6 md:grid-cols-2">
        <input name="title" required placeholder="Jalon (baptême, diplôme, poste…)" className="input" />
        <select name="kind" className="input"><option value="ecclesial">Ecclésial</option><option value="academique">Académique</option><option value="professionnel">Professionnel</option></select>
        <input name="start" type="date" required className="input" /><input name="institution" placeholder="Lieu / institution" className="input" />
        <textarea name="description" placeholder="Description" className="input md:col-span-2" /><button className="btn md:col-span-2">Ajouter</button>
      </form>
      <ol className="relative space-y-6 border-l border-gold/40 pl-8">{ms.map((m) => (
        <li key={m.id} className="relative"><span className={`absolute -left-[41px] top-2 h-4 w-4 rounded-full ${dot[m.kind] ?? "bg-gold"} shadow-[0_0_12px_currentColor]`} />
          <div className="glass p-5"><p className="text-xs uppercase tracking-widest opacity-60">{m.startDate.getFullYear()} · {m.kind}</p><h3 className="font-serif text-2xl">{m.title}</h3><DeleteButton entity="milestone" id={m.id} /><p className="opacity-70">{m.institution}</p><p className="text-sm opacity-60">{m.description}</p></div></li>
      ))}</ol>
    </div>
  );
}
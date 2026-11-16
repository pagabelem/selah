import { db, currentUser } from "@/lib/db";
import { createProject, addTask, toggleTask } from "../actions";
export const dynamic = "force-dynamic";
export default async function Projets() {
  const u = await currentUser();
  const list = await db.project.findMany({ where: { userId: u.id }, include: { tasks: true }, orderBy: { startDate: "desc" } });
  return (
    <div className="space-y-8">
      <h2 className="gold-text font-serif text-5xl">Projets</h2>
      <form action={createProject} className="glass grid gap-3 p-6 md:grid-cols-2">
        <input name="name" required placeholder="Nom du projet" className="input" />
        <select name="category" className="input">{["spirituel", "ministère", "professionnel", "académique", "personnel", "famille"].map((c) => <option key={c}>{c}</option>)}</select>
        <input name="start" type="date" className="input" /><input name="end" type="date" className="input" />
        <textarea name="description" placeholder="Vision du projet" className="input md:col-span-2" />
        <button className="btn md:col-span-2">Créer</button>
      </form>
      {list.map((p) => {
        const late = p.plannedEnd && p.plannedEnd < new Date() && p.status !== "TERMINE";
        return (
          <article key={p.id} className="glass p-6">
            <div className="flex items-center justify-between"><h3 className="font-serif text-2xl">{p.name}</h3>{late && <span className="rounded-full bg-red-500/20 px-3 py-1 text-xs text-red-300">En retard</span>}</div>
            <p className="text-sm opacity-60">{p.category} · {p.status.replace("_", " ")}</p>
            <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/10"><div className="h-full rounded-full bg-gradient-to-r from-gold to-yellow-200" style={{ width: `${p.progress}%` }} /></div>
            <ul className="mt-4 space-y-1">{p.tasks.map((t) => (
              <li key={t.id}><form action={toggleTask}><input type="hidden" name="id" value={t.id} /><button className={t.done ? "line-through opacity-50" : ""}>{t.done ? "✓" : "○"} {t.title}</button></form></li>
            ))}</ul>
            <form action={addTask} className="mt-3 flex gap-2"><input type="hidden" name="projectId" value={p.id} /><input name="title" placeholder="Nouvelle tâche" className="input" /><button className="btn">+</button></form>
          </article>
        );
      })}
    </div>
  );
}

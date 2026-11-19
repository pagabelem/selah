import Link from "next/link";
import { db, currentUser } from "@/lib/db";
import { addDayTasks, toggleDayTask, saveReview, closeDay } from "../actions4";
import DeleteButton from "@/components/DeleteButton";
import { D, shift, todayIn, carry } from "@/lib/planning";
export const dynamic = "force-dynamic";
export default async function Planning({ searchParams }: { searchParams: { d?: string } }) {
  const u = await currentUser(), today = todayIn(u.timezone);
  await carry(u.id, today, today);
  const date = /^\d{4}-\d{2}-\d{2}$/.test(searchParams.d ?? "") ? searchParams.d! : today;
  const [tasks, plan] = await Promise.all([
    db.dayTask.findMany({ where: { userId: u.id, date: D(date) }, orderBy: { createdAt: "asc" } }),
    db.dailyPlan.findUnique({ where: { userId_date: { userId: u.id, date: D(date) } } }),
  ]);
  const done = tasks.filter((t) => t.done), left = tasks.filter((t) => !t.done), pct = tasks.length ? Math.round((done.length / tasks.length) * 100) : 0;
  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="gold-text font-serif text-5xl">Planning</h2>
        <div className="flex items-center gap-2 text-sm"><Link href={`?d=${shift(date, -1)}`} className="glass !rounded-full px-4 py-2">←</Link><Link href="/planning" className="glass !rounded-full px-4 py-2">Aujourd'hui</Link><Link href={`?d=${shift(date, 1)}`} className="glass !rounded-full px-4 py-2">→</Link></div>
      </div>
      <p className="font-serif text-2xl capitalize opacity-80">{D(date).toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long", year: "numeric", timeZone: "UTC" })}</p>

      <section className="glass space-y-4 p-6">
        <h3 className="font-serif text-3xl">Tâches du jour</h3>
        <ul className="space-y-2">
          {tasks.map((t) => (
            <li key={t.id} className="flex items-center gap-3">
              <form action={toggleDayTask}><input type="hidden" name="id" value={t.id} /><button aria-label="Cocher" className={`flex h-6 w-6 items-center justify-center rounded-md border ${t.done ? "border-gold bg-gold text-night" : "border-white/30"}`}>{t.done ? "✓" : ""}</button></form>
              <span className={`flex-1 ${t.done ? "line-through opacity-50" : ""}`}>{t.title}{t.carriedFrom && <span className="ml-2 text-xs text-gold">↪ reportée du {t.carriedFrom.toLocaleDateString("fr-FR", { timeZone: "UTC" })}</span>}</span>
              <DeleteButton entity="daytask" id={t.id} label="" />
            </li>
          ))}
          {!tasks.length && <li className="opacity-60">Aucune tâche pour ce jour.</li>}
        </ul>
        <form action={addDayTasks} className="space-y-2">
          <input type="hidden" name="date" value={date} />
          <textarea name="tasks" rows={3} placeholder={"- Prier 30 minutes\n- Appeler le pasteur\n- Réviser le cours"} className="input" />
          <button className="btn">Ajouter (une tâche par ligne)</button>
        </form>
      </section>

      <section className="glass space-y-4 p-6">
        <h3 className="font-serif text-3xl">Bilan du soir</h3>
        <div>
          <div className="h-2 overflow-hidden rounded-full bg-white/10"><div className="h-full rounded-full bg-gradient-to-r from-sage to-gold" style={{ width: `${pct}%` }} /></div>
          <p className="mt-2 text-sm opacity-70">{done.length}/{tasks.length} tâches faites ({pct} %)</p>
        </div>
        {left.length > 0 && (
          <div>
            <p className="text-gold">Restent à faire :</p>
            <ul className="ml-5 list-disc">{left.map((t) => <li key={t.id}>{t.title}</li>)}</ul>
            <form action={closeDay} className="mt-3"><input type="hidden" name="date" value={date} /><button className="btn">Clôturer et reporter à demain ({left.length})</button></form>
          </div>
        )}
        {tasks.length > 0 && !left.length && <p className="text-emerald-300">Journée accomplie 🙏</p>}
        <form action={saveReview} className="space-y-3">
          <input type="hidden" name="date" value={date} />
          <textarea name="gratitude" rows={2} defaultValue={plan?.gratitude ?? ""} placeholder="Gratitude / victoire du jour" className="input" />
          <textarea name="review" rows={2} defaultValue={plan?.eveningReview ?? ""} placeholder="Notes de la soirée" className="input" />
          <button className="btn">Enregistrer le bilan</button>
        </form>
      </section>
    </div>
  );
}
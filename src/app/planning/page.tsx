import { db, currentUser } from "@/lib/db";
import { savePlan } from "../actions2";
export const dynamic = "force-dynamic";
export default async function Planning() {
  const u = await currentUser();
  const date = new Date(new Date().toISOString().slice(0, 10));
  const plan = await db.dailyPlan.findUnique({ where: { userId_date: { userId: u.id, date } } });
  const tasks = await db.task.findMany({ where: { project: { userId: u.id }, done: false, dueDate: { lte: new Date(date.getTime() + 864e5) } } });
  return (
    <div className="space-y-8">
      <h2 className="gold-text font-serif text-5xl">Planning du jour</h2>
      {tasks.length > 0 && <div className="glass p-6"><h3 className="font-serif text-2xl">Tâches à faire (reportées incluses)</h3>{tasks.map((t) => <p key={t.id}>○ {t.title}</p>)}</div>}
      <form action={savePlan} className="glass space-y-3 p-6">
        <textarea name="agenda" rows={6} defaultValue={(plan?.slots as { text?: string } | null)?.text} placeholder={"06:00 Rendez-vous avec Dieu\n08:00 …"} className="input" />
        <h3 className="font-serif text-2xl">Bilan du soir</h3>
        <textarea name="gratitude" rows={2} defaultValue={plan?.gratitude ?? ""} placeholder="Gratitude / victoire du jour" className="input" />
        <textarea name="review" rows={2} defaultValue={plan?.eveningReview ?? ""} placeholder="Ce qui reste à faire" className="input" />
        <button className="btn">Enregistrer</button>
      </form>
    </div>
  );
}

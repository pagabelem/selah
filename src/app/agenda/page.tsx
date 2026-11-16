import { db, currentUser } from "@/lib/db";
import { createMeeting } from "../actions";
import PushButton from "@/components/PushButton";
export const dynamic = "force-dynamic";
export default async function Agenda() {
  const u = await currentUser();
  const list = await db.meeting.findMany({ where: { userId: u.id, startsAt: { gte: new Date() } }, orderBy: { startsAt: "asc" } });
  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between"><h2 className="gold-text font-serif text-5xl">Agenda</h2><div className="flex gap-3"><a href="/agenda/calendrier" className="rounded-full border border-gold/50 px-4 py-2 text-sm text-gold">Calendrier</a><a href="/api/ical" className="rounded-full border border-gold/50 px-4 py-2 text-sm text-gold">iCal</a><PushButton /></div></div>
      <form action={createMeeting} className="glass grid gap-3 p-6 md:grid-cols-2">
        <input name="title" required placeholder="Titre" className="input" />
        <select name="kind" className="input">{["culte", "réunion de prière", "séminaire", "cours", "rendez-vous", "jeûne"].map((k) => <option key={k}>{k}</option>)}</select>
        <input name="startsAt" type="datetime-local" required className="input" /><input name="place" placeholder="Lieu" className="input" />
        <button className="btn md:col-span-2">Ajouter (rappels : 1 j, 2 h, 30 min)</button>
      </form>
      {list.map((m, i) => (
        <article key={m.id} className={`glass p-6 ${i === 0 ? "ring-1 ring-gold/60" : ""}`}>
          <p className="text-xs uppercase tracking-widest text-gold">{m.kind}</p>
          <h3 className="font-serif text-2xl">{m.title}</h3>
          <p className="opacity-70">{m.startsAt.toLocaleString("fr-FR", { dateStyle: "full", timeStyle: "short" })} {m.place && `· ${m.place}`}</p>
        </article>
      ))}
    </div>
  );
}

import { db, currentUser } from "@/lib/db";
import { createEntry } from "./actions";
import Link from "next/link";
import VoiceButton from "@/components/VoiceButton";
export const dynamic = "force-dynamic";
const label = { REVE: "Rêve", VISION: "Vision", REVELATION: "Révélation" } as const;
export default async function Journal() {
  const u = await currentUser();
  const entries = await db.journalEntry.findMany({ where: { userId: u.id }, orderBy: { occurredAt: "desc" } });
  return (
    <div className="space-y-8">
      <h2 className="font-serif text-5xl gold-text">Journal</h2>
      <form id="nouveau" action={createEntry} className="glass space-y-3 p-6">
        <select name="type" className="input"><option value="REVE">Rêve</option><option value="VISION">Vision</option><option value="REVELATION">Révélation</option></select>
        <label className="block text-sm opacity-70">Date du rêve (modifiable pour un ancien rêve)</label>
        <input name="date" type="datetime-local" className="input" />
        <input name="title" placeholder="Titre" className="input" />
        <textarea name="body" required rows={5} placeholder="Racontez ce que vous avez reçu…" className="input" />
        <div className="flex gap-3"><VoiceButton target="body" /><button className="btn">Enregistrer</button></div>
      </form>
      <div className="space-y-4">
        {entries.map((e) => (
          <article key={e.id} className="glass p-6">
            <span className="rounded-full bg-gold/15 px-3 py-1 text-xs text-gold">{label[e.type]}</span>
            <Link href={`/journal/${e.id}`}><h3 className="mt-3 font-serif text-2xl hover:text-gold">{e.title}</h3></Link>
            <p className="mt-2 whitespace-pre-line opacity-80">{e.body}</p>
            <p className="mt-3 text-xs opacity-50">{e.occurredAt.toLocaleString("fr-FR")}</p>
          </article>
        ))}
      </div>
    </div>
  );
}

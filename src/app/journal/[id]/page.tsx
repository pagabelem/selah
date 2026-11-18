import { notFound } from "next/navigation";
import { db, currentUser } from "@/lib/db";
import EntryAI from "@/components/EntryAI";
import DeleteButton from "@/components/DeleteButton";
import { updateEntry } from "@/app/actions3";
export const dynamic = "force-dynamic";
export default async function Entry({ params }: { params: { id: string } }) {
  const u = await currentUser();
  const e = await db.journalEntry.findFirst({ where: { id: params.id, userId: u.id } });
  if (!e) notFound();
  return (
    <div className="space-y-6">
      <p className="text-xs uppercase tracking-widest text-gold">{e.type} · {e.status.replace("_", " ")} · {e.occurredAt.toLocaleString("fr-FR")}{e.place && ` · ${e.place}`}</p>
      <h2 className="gold-text font-serif text-5xl">{e.title}</h2>
      <p className="glass whitespace-pre-line p-6 text-lg">{e.body}</p>
      {e.interpretation && <div className="glass whitespace-pre-line p-6"><h3 className="mb-2 font-serif text-2xl">Mon interprétation</h3>{e.interpretation}</div>}
      {e.verses.length > 0 && <p className="text-gold">Versets liés : {e.verses.join(" · ")}</p>}
      {e.aiInterpretation && <div className="glass whitespace-pre-line p-6"><h3 className="mb-2 font-serif text-2xl">Interprétation IA</h3>{e.aiInterpretation}</div>}
      <EntryAI id={e.id} />
      <details className="glass p-6"><summary className="cursor-pointer text-gold">Modifier cette entrée</summary>
        <form action={updateEntry} className="mt-4 space-y-3"><input type="hidden" name="id" value={e.id} />
          <select name="type" defaultValue={e.type} className="input"><option value="REVE">Rêve</option><option value="VISION">Vision</option><option value="REVELATION">Révélation</option></select>
          <input name="title" defaultValue={e.title} className="input" />
          <input name="date" type="datetime-local" defaultValue={e.occurredAt.toISOString().slice(0, 16)} className="input" />
          <input name="place" defaultValue={e.place ?? ""} placeholder="Lieu" className="input" />
          <select name="status" defaultValue={e.status} className="input">{["A_PRIER", "EN_ATTENTE", "CONFIRME", "ACCOMPLI", "CLASSE"].map((x) => <option key={x}>{x}</option>)}</select>
          <textarea name="body" defaultValue={e.body} rows={6} className="input" />
          <textarea name="interpretation" defaultValue={e.interpretation ?? ""} rows={3} placeholder="Mon interprétation" className="input" />
          <button className="btn">Enregistrer</button></form>
      </details>
      <DeleteButton entity="entry" id={e.id} to="/journal" label="Supprimer cette entrée" />
    </div>
  );
}

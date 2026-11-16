import { notFound } from "next/navigation";
import { db, currentUser } from "@/lib/db";
import EntryAI from "@/components/EntryAI";
export const dynamic = "force-dynamic";
export default async function Entry({ params }: { params: { id: string } }) {
  const u = await currentUser();
  const e = await db.journalEntry.findFirst({ where: { id: params.id, userId: u.id } });
  if (!e) notFound();
  return (
    <div className="space-y-6">
      <p className="text-xs uppercase tracking-widest text-gold">{e.type} · {e.status.replace("_", " ")} · {e.occurredAt.toLocaleString("fr-FR")}</p>
      <h2 className="gold-text font-serif text-5xl">{e.title}</h2>
      <p className="glass whitespace-pre-line p-6 text-lg">{e.body}</p>
      {e.verses.length > 0 && <p className="text-gold">Versets liés : {e.verses.join(" · ")}</p>}
      {e.aiInterpretation && <div className="glass whitespace-pre-line p-6"><h3 className="mb-2 font-serif text-2xl">Interprétation IA</h3>{e.aiInterpretation}</div>}
      <EntryAI id={e.id} />
    </div>
  );
}

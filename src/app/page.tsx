import { db, currentUser } from "@/lib/db";
import Link from "next/link";
export const dynamic = "force-dynamic";
export default async function Dashboard() {
  const u = await currentUser();
  const [entries, promises, vision, nbDone] = await Promise.all([
    db.journalEntry.findMany({ where: { userId: u.id }, orderBy: { occurredAt: "desc" }, take: 3 }),
    db.promise.findMany({ where: { userId: u.id, status: { not: "ACCOMPLIE" } }, take: 3 }),
    db.yearVision.findFirst({ where: { userId: u.id }, orderBy: { year: "desc" } }),
    db.promise.count({ where: { userId: u.id, status: "ACCOMPLIE" } }),
  ]);
  return (
    <div className="grid gap-5 md:grid-cols-6">
      <section className="glass p-8 md:col-span-6">
        <p className="text-xs uppercase tracking-[.3em] opacity-60">Bonjour {u.name}</p>
        <h2 className="verse-glow mt-3 font-serif text-4xl leading-tight md:text-6xl gold-text">{vision?.passage ?? "Ésaïe 43:19"}</h2>
        <p className="mt-3 font-serif text-xl italic opacity-80">{vision ? `« ${vision.theme} » — ${vision.vision}` : "Définissez votre vision de l'année."}</p>
      </section>
      <section className="glass p-6 md:col-span-4">
        <h3 className="font-serif text-2xl">Derniers rêves &amp; visions</h3>
        <ul className="mt-4 space-y-3">
          {entries.map((e) => (
            <li key={e.id} className="rounded-2xl bg-white/5 p-4"><p className="font-medium">{e.title}</p><p className="line-clamp-2 text-sm opacity-70">{e.body}</p></li>
          ))}
          {!entries.length && <p className="opacity-60">Aucune entrée pour l'instant.</p>}
        </ul>
        <Link href="/journal" className="mt-4 inline-block text-gold">Ouvrir le journal →</Link>
      </section>
      <section className="glass p-6 md:col-span-2">
        <p className="text-sm opacity-60">Mur de la fidélité</p>
        <p className="font-serif text-7xl gold-text">{nbDone}</p>
        <p className="text-sm opacity-70">promesse(s) accomplie(s)</p>
        <p className="mt-6 text-sm opacity-60">En attente</p>
        {promises.map((p) => <p key={p.id} className="mt-1 text-sm">✦ {p.text}</p>)}
      </section>
    </div>
  );
}

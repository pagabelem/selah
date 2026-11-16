import Link from "next/link";
import { db, currentUser } from "@/lib/db";
import { similar } from "@/lib/embed";
export const dynamic = "force-dynamic";
export default async function Recherche({ searchParams }: { searchParams: { q?: string } }) {
  const u = await currentUser(), q = searchParams.q?.trim();
  const sem = q ? await similar(u.id, q).catch(() => []) : [];
  const c = { contains: q ?? "", mode: "insensitive" as const };
  const [e, p, pr] = q ? await Promise.all([
    db.journalEntry.findMany({ where: { userId: u.id, OR: [{ title: c }, { body: c }, { interpretation: c }] }, take: 20 }),
    db.promise.findMany({ where: { userId: u.id, OR: [{ text: c }, { verse: c }] }, take: 20 }),
    db.project.findMany({ where: { userId: u.id, OR: [{ name: c }, { description: c }] }, take: 20 }),
  ]) : [[], [], []];
  return (
    <div className="space-y-6">
      <h2 className="gold-text font-serif text-5xl">Recherche</h2>
      <form className="glass p-3"><input name="q" defaultValue={q} autoFocus placeholder="Rêve, promesse, projet…" className="input" /></form>
      {sem.length > 0 && <p className="text-sm text-gold">Proches par le sens</p>}{sem.map((x) => <Link key={x.entityId} href={`/journal/${x.entityId}`} className="glass block p-4">≈ {x.title}</Link>)}
      {e.map((x) => <Link key={x.id} href={`/journal/${x.id}`} className="glass block p-4">✦ {x.title}</Link>)}
      {p.map((x) => <Link key={x.id} href="/promesses" className="glass block p-4">❝ {x.text}</Link>)}
      {pr.map((x) => <Link key={x.id} href="/projets" className="glass block p-4">▣ {x.name}</Link>)}
    </div>
  );
}

import Link from "next/link";
import { db, currentUser } from "@/lib/db";
export const dynamic = "force-dynamic";
export default async function Calendrier({ searchParams }: { searchParams: { v?: string; d?: string } }) {
  const u = await currentUser();
  const v = searchParams.v === "semaine" ? "semaine" : "mois", base = searchParams.d ? new Date(searchParams.d) : new Date();
  const start = new Date(v === "mois" ? new Date(base.getFullYear(), base.getMonth(), 1) : base);
  start.setDate(start.getDate() - ((start.getDay() + 6) % 7)); start.setHours(0, 0, 0, 0);
  const days = v === "mois" ? 42 : 7, end = new Date(start.getTime() + days * 864e5);
  const ms = await db.meeting.findMany({ where: { userId: u.id, startsAt: { gte: start, lt: end } }, orderBy: { startsAt: "asc" } });
  const go = (n: number) => { const d = new Date(base); if (v === "mois") d.setMonth(d.getMonth() + n); else d.setDate(d.getDate() + 7 * n); return `?v=${v}&d=${d.toISOString().slice(0, 10)}`; };
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="gold-text font-serif text-4xl capitalize">{base.toLocaleDateString("fr-FR", { month: "long", year: "numeric" })}</h2>
        <div className="flex gap-2 text-sm">{[["mois", "Mois"], ["semaine", "Semaine"]].map(([k, l]) => <Link key={k} href={`?v=${k}`} className={`rounded-full px-4 py-2 ${v === k ? "bg-gold text-night" : "glass !rounded-full"}`}>{l}</Link>)}<Link href={go(-1)} className="glass !rounded-full px-4 py-2">←</Link><Link href={go(1)} className="glass !rounded-full px-4 py-2">→</Link></div>
      </div>
      <div className="grid grid-cols-7 gap-2 text-center text-xs opacity-60">{["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"].map((d) => <span key={d}>{d}</span>)}</div>
      <div className="grid grid-cols-7 gap-2">{Array.from({ length: days }, (_, i) => {
        const d = new Date(start.getTime() + i * 864e5), list = ms.filter((m) => m.startsAt.toDateString() === d.toDateString());
        return <div key={i} className={`glass !rounded-xl p-2 ${v === "mois" ? "min-h-20" : "min-h-64"} ${d.toDateString() === new Date().toDateString() ? "ring-1 ring-gold" : ""} ${v === "mois" && d.getMonth() !== base.getMonth() ? "opacity-40" : ""}`}>
          <p className="text-xs opacity-70">{d.getDate()}</p>{list.map((m) => <p key={m.id} className="mt-1 truncate rounded bg-gold/20 px-1 text-[11px]">{m.startsAt.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })} {m.title}</p>)}</div>;
      })}</div>
    </div>
  );
}

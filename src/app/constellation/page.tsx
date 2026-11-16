import Link from "next/link";
import { db, currentUser } from "@/lib/db";
export const dynamic = "force-dynamic";
const h = (s: string, k: number) => { let x = 0; for (const c of s + k) x = (x * 31 + c.charCodeAt(0)) >>> 0; return 6 + ((x % 1000) / 1000) * 88; };
export default async function Constellation() {
  const u = await currentUser(), w = { where: { userId: u.id } };
  const [e, p, j] = await Promise.all([db.journalEntry.findMany(w), db.promise.findMany(w), db.project.findMany(w)]);
  const nodes = [...e.map((x) => ({ id: x.id, t: x.title, c: "#C9A227", href: `/journal/${x.id}` })), ...p.map((x) => ({ id: x.id, t: x.text.slice(0, 24), c: "#F7F3E8", href: "/promesses" })), ...j.map((x) => ({ id: x.id, t: x.name, c: "#7C9A8B", href: "/projets" }))];
  const pos = (id: string) => ({ x: h(id, 1), y: h(id, 2) });
  return (
    <div className="space-y-4">
      <h2 className="gold-text font-serif text-5xl">Constellation de vie</h2>
      <p className="text-sm opacity-70"><span className="text-gold">●</span> rêves et visions · <span>●</span> promesses · <span className="text-sage">●</span> projets · les traits relient un projet à sa promesse.</p>
      <svg viewBox="0 0 100 100" className="glass h-[65vh] w-full !rounded-3xl p-2" preserveAspectRatio="xMidYMid meet">
        {j.filter((x) => x.promiseId).map((x) => { const a = pos(x.id), b = pos(x.promiseId!); return <line key={x.id} x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke="#C9A227" strokeOpacity=".5" strokeWidth=".2" />; })}
        {nodes.map((n) => { const { x, y } = pos(n.id); return <a key={n.id} href={n.href}><circle cx={x} cy={y} r="1.3" fill={n.c} style={{ filter: `drop-shadow(0 0 1.5px ${n.c})` }} /><text x={x + 2} y={y + 0.6} fontSize="1.9" fill="currentColor" opacity=".75">{n.t}</text></a>; })}
      </svg>
      {!nodes.length && <p className="opacity-60">Ajoutez des rêves, promesses et projets pour voir naître vos étoiles.</p>}
    </div>
  );
}

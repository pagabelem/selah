import { db, currentUser } from "@/lib/db";
import PrintButton from "@/components/PrintButton";
export const dynamic = "force-dynamic";
export default async function CV() {
  const u = await currentUser();
  const ms = await db.milestone.findMany({ where: { userId: u.id }, orderBy: { startDate: "desc" } });
  const Sec = ({ k, t }: { k: string; t: string }) => (
    <section className="space-y-3"><h3 className="font-serif text-3xl text-gold">{t}</h3>{ms.filter((m) => m.kind === k).map((m) => (
      <div key={m.id} className="glass p-4"><p className="text-sm opacity-60">{m.startDate.getFullYear()}{m.endDate ? `–${m.endDate.getFullYear()}` : ""} · {m.institution}</p><p className="font-serif text-xl">{m.title}</p><p className="text-sm opacity-70">{m.description}</p></div>))}</section>
  );
  return (<div className="space-y-8"><div className="flex items-center justify-between"><h2 className="gold-text font-serif text-5xl">CV — {u.name ?? u.email}</h2><PrintButton /></div><Sec k="ecclesial" t="Parcours ecclésial" /><Sec k="academique" t="Parcours académique" /> <Sec k="professionnel" t="Parcours professionnel" /> </div>);
}

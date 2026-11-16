import { db, currentUser } from "@/lib/db";
import { createPromise, fulfillPromise } from "../actions";
export const dynamic = "force-dynamic";
export default async function Promesses() {
  const u = await currentUser();
  const list = await db.promise.findMany({ where: { userId: u.id }, orderBy: { receivedAt: "desc" } });
  return (
    <div className="space-y-8">
      <h2 className="gold-text font-serif text-5xl">Mur de la fidélité</h2>
      <form action={createPromise} className="glass grid gap-3 p-6 md:grid-cols-3">
        <input name="text" required placeholder="Promesse reçue" className="input md:col-span-2" /><input name="verse" placeholder="Verset d'appui" className="input" />
        <button className="btn md:col-span-3">Ajouter</button>
      </form>
      <div className="grid gap-5 md:grid-cols-2">{list.map((p) => (
        <article key={p.id} className={`glass p-6 ${p.status === "ACCOMPLIE" ? "ring-1 ring-gold/60" : ""}`}>
          <p className="verse-glow font-serif text-2xl italic">« {p.text} »</p>
          {p.verse && <p className="mt-2 text-gold">{p.verse}</p>}
          {p.testimony && <p className="mt-3 text-sm opacity-70">{p.testimony}</p>}
          {p.status !== "ACCOMPLIE" ? (
            <form action={fulfillPromise} className="mt-4 flex gap-2"><input type="hidden" name="id" value={p.id} /><input name="testimony" placeholder="Témoignage d'accomplissement" className="input" /><button className="btn !px-4 text-sm">Accomplie</button></form>
          ) : <p className="mt-3 text-xs uppercase tracking-widest opacity-50">Accomplie</p>}
        </article>
      ))}</div>
    </div>
  );
}

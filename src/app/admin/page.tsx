import { db, requireAdmin } from "@/lib/db";
import { adminUser, adminPassword } from "./actions";
import DeleteButton from "@/components/DeleteButton";
export const dynamic = "force-dynamic";
const badge = { ACTIVE: "bg-emerald-500/20 text-emerald-300", PENDING: "bg-amber-500/20 text-amber-300", BLOCKED: "bg-red-500/20 text-red-300" } as const;
const Op = ({ id, op, label }: { id: string; op: string; label: string }) => (
  <form action={adminUser}><input type="hidden" name="id" value={id} /><input type="hidden" name="op" value={op} /><button className="text-gold">{label}</button></form>
);
export default async function Admin({ searchParams }: { searchParams: { q?: string; s?: string } }) {
  const me = await requireAdmin(), q = searchParams.q?.trim(), s = searchParams.s;
  const [users, byStatus, usage, nE, nP, nJ] = await Promise.all([
    db.user.findMany({ where: { ...(s ? { status: s as never } : {}), ...(q ? { OR: [{ email: { contains: q, mode: "insensitive" as const } }, { name: { contains: q, mode: "insensitive" as const } }] } : {}) }, orderBy: { createdAt: "desc" }, include: { _count: { select: { entries: true, promises: true, projects: true } } } }),
    db.user.groupBy({ by: ["status"], _count: true }),
    db.aiLog.groupBy({ by: ["userId"], _sum: { tokens: true, costEstimate: true } }),
    db.journalEntry.count(), db.promise.count(), db.project.count(),
  ]);
  const st = (k: string) => byStatus.find((x) => x.status === k)?._count ?? 0;
  const tok = new Map(usage.map((x) => [x.userId, x._sum.tokens ?? 0])), cost = usage.reduce((a, x) => a + (x._sum.costEstimate ?? 0), 0);
  const cards: [string, string | number][] = [["Utilisateurs", st("ACTIVE") + st("PENDING") + st("BLOCKED")], ["En attente", st("PENDING")], ["Actifs", st("ACTIVE")], ["Bloqués", st("BLOCKED")], ["Rêves & visions", nE], ["Promesses", nP], ["Projets", nJ], ["Coût IA ≈", `${cost.toFixed(2)} $`]];
  return (
    <div className="space-y-8">
      <h2 className="gold-text font-serif text-5xl">Administration</h2>
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">{cards.map(([l, n]) => <div key={l} className={`glass p-4 ${l === "En attente" && n ? "ring-1 ring-amber-400/60" : ""}`}><p className="gold-text font-serif text-4xl">{n}</p><p className="text-sm opacity-70">{l}</p></div>)}</div>
      <form className="glass flex flex-wrap gap-3 p-3"><input name="q" defaultValue={q} placeholder="Nom ou e-mail" className="input flex-1" />
        <select name="s" defaultValue={s ?? ""} className="input md:w-48"><option value="">Tous</option><option value="PENDING">En attente</option><option value="ACTIVE">Actifs</option><option value="BLOCKED">Bloqués</option></select><button className="btn">Filtrer</button></form>
      {users.map((u) => (
        <article key={u.id} className="glass space-y-3 p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div><p className="font-medium">{u.name ?? "—"} <span className="opacity-60">· {u.email}</span></p>
              <p className="text-xs opacity-60">Inscrit le {u.createdAt.toLocaleDateString("fr-FR")} · connexion : {u.lastLoginAt?.toLocaleDateString("fr-FR") ?? "jamais"} · {u._count.entries} entrées · {u._count.promises} promesses · {u._count.projects} projets · {tok.get(u.id) ?? 0} tokens IA</p></div>
            <div className="flex gap-2"><span className={`rounded-full px-3 py-1 text-xs ${badge[u.status]}`}>{u.status}</span>{u.role === "ADMIN" && <span className="rounded-full bg-gold/20 px-3 py-1 text-xs text-gold">ADMIN</span>}</div>
          </div>
          {u.id !== me.id && (
            <div className="flex flex-wrap items-center gap-4 text-sm">
              {u.status !== "ACTIVE" && <Op id={u.id} op="activate" label="Activer" />}
              {u.status !== "BLOCKED" && <Op id={u.id} op="block" label="Bloquer" />}
              {u.role === "USER" ? <Op id={u.id} op="admin" label="Promouvoir admin" /> : <Op id={u.id} op="user" label="Rétrograder" />}
              <form action={adminPassword} className="flex gap-2"><input type="hidden" name="id" value={u.id} /><input name="password" type="password" minLength={8} required placeholder="Nouveau mot de passe" className="input !py-1 text-sm" /><button className="text-gold">Définir</button></form>
              <DeleteButton action={adminUser} id={u.id} op="delete" label="Supprimer le compte" />
            </div>
          )}
        </article>
      ))}
    </div>
  );
}

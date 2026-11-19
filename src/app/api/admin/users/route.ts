import { db, requireAdmin } from "@/lib/db";
export async function GET() {
  await requireAdmin();
  const us = await db.user.findMany({ orderBy: { createdAt: "desc" } });
  const q = (v: unknown) => `"${String(v ?? "").replace(/"/g, '""')}"`;
  const rows = ["email,nom,statut,role,inscrit_le,derniere_connexion", ...us.map((u) => [u.email, u.name, u.status, u.role, u.createdAt.toISOString(), u.lastLoginAt?.toISOString()].map(q).join(","))].join("\n");
  return new Response("\uFEFF" + rows, { headers: { "Content-Type": "text/csv; charset=utf-8", "Content-Disposition": 'attachment; filename="selah-utilisateurs.csv"' } });
}
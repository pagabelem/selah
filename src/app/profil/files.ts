"use server";
import { redirect } from "next/navigation";
import { db, currentUser } from "@/lib/db";
import { upload, removeObject } from "@/lib/storage";
const EXT: Record<string, string> = { "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp" };
type Item = { kind?: string; title?: string; institution?: string; startDate?: string; endDate?: string | null; description?: string };
const toDate = (v?: string | null) => {
  const m = /^(\d{4})(?:-(\d{2}))?(?:-(\d{2}))?$/.exec(v ?? "");
  const d = m ? new Date(`${m[1]}-${m[2] ?? "01"}-${m[3] ?? "01"}T00:00:00Z`) : null;
  return d && !isNaN(+d) ? d : null;
};
export async function uploadAvatar(fd: FormData) {
  const u = await currentUser(), f = fd.get("file");
  if (!(f instanceof File) || !EXT[f.type] || f.size === 0 || f.size > 2_000_000) redirect("/profil?e=img");
  const path = `${u.id}/avatar-${Date.now()}.${EXT[f.type]}`;
  try { await upload(path, f); } catch { redirect("/profil?e=img"); }
  if (u.avatarPath) await removeObject(u.avatarPath).catch(() => {});
  await db.user.update({ where: { id: u.id }, data: { avatarPath: path } });
  redirect("/profil?ok=img");
}
async function extract(userId: string, pdf: Buffer): Promise<Item[]> {
  const r = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${process.env.OPENAI_API_KEY}` },
    body: JSON.stringify({ model: process.env.OPENAI_MODEL || "gpt-4o-mini", response_format: { type: "json_object" }, messages: [
      { role: "system", content: `Tu extrais le parcours d'un CV. Réponds UNIQUEMENT en JSON : {"milestones":[{"kind":"ecclesial|academique|professionnel","title":"","institution":"","startDate":"YYYY-MM-DD","endDate":"YYYY-MM-DD ou null","description":""}]}. academique = diplômes et formations ; professionnel = emplois et stages ; ecclesial = baptême, ministères, responsabilités d'Église, formations bibliques. N'invente rien : omets ce qui est absent. Si seule l'année est connue, utilise AAAA-01-01.` },
      { role: "user", content: [{ type: "file", file: { filename: "cv.pdf", file_data: `data:application/pdf;base64,${pdf.toString("base64")}` } }, { type: "text", text: "Extrais les jalons de ce CV." }] },
    ] }),
  });
  const j = await r.json(), tokens = j.usage?.total_tokens ?? 0;
  await db.aiLog.create({ data: { userId, fn: "cv-import", tokens, costEstimate: tokens * 0.0000006 } });
  return JSON.parse(j.choices[0].message.content).milestones ?? [];
}
export async function importCv(fd: FormData) {
  const u = await currentUser(), f = fd.get("file");
  if (!(f instanceof File) || f.type !== "application/pdf" || f.size === 0 || f.size > 4_000_000) redirect("/parcours?cv=err");
  let n = 0;
  try {
    const path = `${u.id}/cv-${Date.now()}.pdf`;
    await upload(path, f);
    if (u.cvPath) await removeObject(u.cvPath).catch(() => {});
    await db.user.update({ where: { id: u.id }, data: { cvPath: path } });
    for (const m of (await extract(u.id, Buffer.from(await f.arrayBuffer()))).slice(0, 60)) {
      const start = toDate(m.startDate);
      if (!m.title || !start) continue;
      if (await db.milestone.findFirst({ where: { userId: u.id, title: m.title, startDate: start } })) continue;
      const kind = ["ecclesial", "academique", "professionnel"].includes(m.kind ?? "") ? m.kind! : "professionnel";
      await db.milestone.create({ data: { userId: u.id, kind, title: m.title.slice(0, 200), institution: m.institution || null, startDate: start, endDate: toDate(m.endDate), description: m.description || null } });
      n++;
    }
  } catch { redirect("/parcours?cv=err"); }
  redirect(`/parcours?cv=${n}`);
}
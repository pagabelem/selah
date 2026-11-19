"use server";
import { db, currentUser } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
const s = (fd: FormData, k: string) => String(fd.get(k) ?? "").trim();
const d = (fd: FormData, k: string) => (s(fd, k) ? new Date(s(fd, k)) : undefined);
export async function updateEntry(fd: FormData) {
  const u = await currentUser(), id = s(fd, "id");
  await db.journalEntry.updateMany({ where: { id, userId: u.id }, data: { title: s(fd, "title") || "Sans titre", body: s(fd, "body"), type: s(fd, "type") as never, status: s(fd, "status") as never, place: s(fd, "place") || null, occurredAt: d(fd, "date"), interpretation: s(fd, "interpretation") || null } });
  revalidatePath(`/journal/${id}`); revalidatePath("/journal");
}
export async function updateProject(fd: FormData) {
  const u = await currentUser();
  await db.project.updateMany({ where: { id: s(fd, "id"), userId: u.id }, data: { name: s(fd, "name"), description: s(fd, "description"), category: s(fd, "category"), status: s(fd, "status") as never, plannedEnd: d(fd, "end") ?? null } });
  revalidatePath("/projets");
}
export async function updatePromise(fd: FormData) {
  const u = await currentUser(), status = s(fd, "status");
  await db.promise.updateMany({ where: { id: s(fd, "id"), userId: u.id }, data: { text: s(fd, "text"), verse: s(fd, "verse") || null, status: status as never, testimony: s(fd, "testimony") || null, fulfilledAt: status === "ACCOMPLIE" ? new Date() : null } });
  revalidatePath("/promesses"); revalidatePath("/");
}
const M: Record<string, (id: string, uid: string) => Promise<unknown>> = {
  entry: (id, uid) => db.journalEntry.deleteMany({ where: { id, userId: uid } }),
  promise: (id, uid) => db.promise.deleteMany({ where: { id, userId: uid } }),
  project: (id, uid) => db.project.deleteMany({ where: { id, userId: uid } }),
  goal: (id, uid) => db.goal.deleteMany({ where: { id, userId: uid } }),
  meeting: (id, uid) => db.meeting.deleteMany({ where: { id, userId: uid } }),
  fast: (id, uid) => db.fast.deleteMany({ where: { id, userId: uid } }),
  milestone: (id, uid) => db.milestone.deleteMany({ where: { id, userId: uid } }),
    daytask: (id, uid) => db.dayTask.deleteMany({ where: { id, userId: uid } }),
};
export async function remove(fd: FormData) {
  const u = await currentUser(), e = s(fd, "entity"), id = s(fd, "id"), to = s(fd, "to");
  if (!M[e]) return;
  await M[e](id, u.id);
  if (e === "entry") await db.$executeRaw`DELETE FROM "Embedding" WHERE "entityId" = ${id}`.catch(() => {});
  revalidatePath("/", "layout");
  if (to.startsWith("/") && !to.startsWith("//")) redirect(to);
}

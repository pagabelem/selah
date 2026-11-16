"use server";
import { db, currentUser } from "@/lib/db";
import { revalidatePath } from "next/cache";
const s = (fd: FormData, k: string) => String(fd.get(k) ?? "").trim();
export async function savePlan(fd: FormData) {
  const u = await currentUser();
  const date = new Date(new Date().toISOString().slice(0, 10));
  const data = { slots: { text: s(fd, "agenda") }, gratitude: s(fd, "gratitude"), eveningReview: s(fd, "review") };
  await db.dailyPlan.upsert({ where: { userId_date: { userId: u.id, date } }, update: data, create: { userId: u.id, date, ...data } });
  revalidatePath("/planning");
}
export async function createMilestone(fd: FormData) {
  const u = await currentUser();
  if (!s(fd, "title") || !s(fd, "start")) return;
  await db.milestone.create({ data: { userId: u.id, kind: s(fd, "kind"), title: s(fd, "title"), institution: s(fd, "institution"), startDate: new Date(s(fd, "start")), description: s(fd, "description") } });
  revalidatePath("/parcours");
}
export async function createFast(fd: FormData) {
  const u = await currentUser();
  if (!s(fd, "start") || !s(fd, "end")) return;
  await db.fast.create({ data: { userId: u.id, kind: s(fd, "kind"), intention: s(fd, "intention"), startDate: new Date(s(fd, "start")), endDate: new Date(s(fd, "end")), notes: s(fd, "notes") } });
  revalidatePath("/jeune");
}

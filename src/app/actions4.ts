"use server";
import { db, currentUser } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { D, shift, carry, autoReview } from "@/lib/planning";
const s = (fd: FormData, k: string) => String(fd.get(k) ?? "").trim();
export async function addDayTasks(fd: FormData) {
  const u = await currentUser(), date = s(fd, "date");
  const titles = s(fd, "tasks").split("\n").map((l) => l.replace(/^\s*(?:[-•*–·]|\d+[.)])\s*/, "").trim()).filter(Boolean).slice(0, 50);
  if (titles.length) await db.dayTask.createMany({ data: titles.map((title) => ({ userId: u.id, date: D(date), title })) });
  revalidatePath("/planning");
}
export async function toggleDayTask(fd: FormData) {
  const u = await currentUser(), t = await db.dayTask.findFirst({ where: { id: s(fd, "id"), userId: u.id } });
  if (!t) return;
  await db.dayTask.update({ where: { id: t.id }, data: { done: !t.done, doneAt: t.done ? null : new Date() } });
  revalidatePath("/planning");
}
export async function closeDay(fd: FormData) {
  const u = await currentUser(), next = shift(s(fd, "date"), 1);
  await carry(u.id, next, next);
  revalidatePath("/planning");
}
export async function saveReview(fd: FormData) {
  const u = await currentUser(), date = D(s(fd, "date")), data = { gratitude: s(fd, "gratitude"), eveningReview: s(fd, "review") };
  await db.dailyPlan.upsert({ where: { userId_date: { userId: u.id, date } }, update: data, create: { userId: u.id, date, ...data } });
  revalidatePath("/planning");
}



export async function generateReview(fd: FormData) {
  const u = await currentUser();
  await autoReview(u.id, u.timezone, s(fd, "date"), true);
  revalidatePath("/planning");
}
"use server";
import { db, currentUser } from "@/lib/db";
import { revalidatePath } from "next/cache";
const s = (fd: FormData, k: string) => String(fd.get(k) ?? "").trim();
const d = (fd: FormData, k: string) => (s(fd, k) ? new Date(s(fd, k)) : null);
export async function createProject(fd: FormData) {
  const u = await currentUser();
  if (!s(fd, "name")) return;
  await db.project.create({ data: { userId: u.id, name: s(fd, "name"), description: s(fd, "description"), category: s(fd, "category") || "personnel", startDate: d(fd, "start") ?? new Date(), plannedEnd: d(fd, "end"), status: "EN_COURS" } });
  revalidatePath("/projets");
}
export async function addTask(fd: FormData) {
  if (!s(fd, "title")) return;
  await db.task.create({ data: { title: s(fd, "title"), projectId: s(fd, "projectId"), dueDate: d(fd, "due") } });
  await syncProgress(s(fd, "projectId"));
}
export async function toggleTask(fd: FormData) {
  const t = await db.task.findUniqueOrThrow({ where: { id: s(fd, "id") } });
  await db.task.update({ where: { id: t.id }, data: { done: !t.done } });
  if (t.projectId) await syncProgress(t.projectId);
}
async function syncProgress(projectId: string) {
  const [all, done] = await Promise.all([db.task.count({ where: { projectId } }), db.task.count({ where: { projectId, done: true } })]);
  await db.project.update({ where: { id: projectId }, data: { progress: all ? Math.round((done / all) * 100) : 0 } });
  revalidatePath("/projets");
}
export async function createMeeting(fd: FormData) {
  const u = await currentUser();
  if (!s(fd, "title") || !s(fd, "startsAt")) return;
  const m = await db.meeting.create({ data: { userId: u.id, title: s(fd, "title"), kind: s(fd, "kind") || "culte", place: s(fd, "place"), startsAt: new Date(s(fd, "startsAt")) } });
  await db.reminder.createMany({ data: [1440, 120, 30].map((minutesBefore) => ({ meetingId: m.id, minutesBefore })) });
  revalidatePath("/agenda");
}
export async function createGoal(fd: FormData) {
  const u = await currentUser();
  if (!s(fd, "title")) return;
  await db.goal.create({ data: { userId: u.id, title: s(fd, "title"), period: s(fd, "period") as "SEMAINE" | "MOIS" | "ANNEE", domain: s(fd, "domain") || "spirituel", target: Number(s(fd, "target")) || null } });
  revalidatePath("/objectifs");
}
export async function progressGoal(fd: FormData) {
  const g = await db.goal.findUniqueOrThrow({ where: { id: s(fd, "id") } });
  const step = g.target ? 1 : 100;
  await db.goal.update({ where: { id: g.id }, data: { progress: Math.min(g.target ?? 100, g.progress + step) } });
  revalidatePath("/objectifs");
}
export async function saveVision(fd: FormData) {
  const u = await currentUser();
  const year = new Date().getFullYear();
  const data = { theme: s(fd, "theme"), vision: s(fd, "vision"), passage: s(fd, "passage"), keywords: s(fd, "keywords").split(",").map((k) => k.trim()).filter(Boolean) };
  await db.yearVision.upsert({ where: { userId_year: { userId: u.id, year } }, update: data, create: { userId: u.id, year, ...data } });
  revalidatePath("/vision"); revalidatePath("/");
}
export async function createPromise(fd: FormData) {
  const u = await currentUser();
  if (!s(fd, "text")) return;
  await db.promise.create({ data: { userId: u.id, text: s(fd, "text"), verse: s(fd, "verse") } });
  revalidatePath("/promesses");
}
export async function fulfillPromise(fd: FormData) {
  await db.promise.update({ where: { id: s(fd, "id") }, data: { status: "ACCOMPLIE", fulfilledAt: new Date(), testimony: s(fd, "testimony") } });
  revalidatePath("/promesses"); revalidatePath("/");
}

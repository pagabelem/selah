"use server";
import { db, currentUser } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { indexEntry } from "@/lib/embed";
export async function createEntry(fd: FormData) {
  const u = await currentUser();
  const title = String(fd.get("title") || "").trim() || "Sans titre";
  const body = String(fd.get("body") || "").trim();
  if (!body) return;
  const e = await db.journalEntry.create({ data: { userId: u.id, title, body, type: fd.get("type") as "REVE" | "VISION" | "REVELATION", occurredAt: fd.get("date") ? new Date(String(fd.get("date"))) : new Date() } });
  await indexEntry(e.id, u.id, `${title}\n${body}`).catch(() => {});
  revalidatePath("/journal"); revalidatePath("/");
}

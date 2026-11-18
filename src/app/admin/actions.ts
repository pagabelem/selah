"use server";
import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";
import { db, requireAdmin } from "@/lib/db";
export async function adminUser(fd: FormData) {
  const me = await requireAdmin(), id = String(fd.get("id")), op = String(fd.get("op"));
  if (id === me.id) return; // pas d'action sur son propre compte
  if (op === "activate") await db.user.update({ where: { id }, data: { status: "ACTIVE" } });
  else if (op === "block") await db.user.update({ where: { id }, data: { status: "BLOCKED" } });
  else if (op === "admin") await db.user.update({ where: { id }, data: { role: "ADMIN" } });
  else if (op === "user") await db.user.update({ where: { id }, data: { role: "USER" } });
  else if (op === "delete") await db.user.delete({ where: { id } });
  revalidatePath("/admin");
}
export async function adminPassword(fd: FormData) {
  await requireAdmin();
  const pw = String(fd.get("password"));
  if (pw.length >= 8) await db.user.update({ where: { id: String(fd.get("id")) }, data: { passwordHash: await bcrypt.hash(pw, 12) } });
  revalidatePath("/admin");
}

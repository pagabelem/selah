"use server";
import bcrypt from "bcryptjs";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { db, currentUser } from "@/lib/db";
import { removeObject } from "@/lib/storage";
export async function updateProfile(fd: FormData) {
  const u = await currentUser(), email = String(fd.get("email")).toLowerCase().trim();
  let ok = email.includes("@");
  if (ok) try { await db.user.update({ where: { id: u.id }, data: { name: String(fd.get("name")).trim() || null, email, timezone: String(fd.get("timezone")), locale: String(fd.get("locale")) } }); } catch { ok = false; }
  redirect(ok ? "/profil?ok=1" : "/profil?e=email");
}
export async function changePassword(fd: FormData) {
  const u = await currentUser(), n = String(fd.get("new"));
  if (n.length < 8 || !u.passwordHash || !(await bcrypt.compare(String(fd.get("current")), u.passwordHash))) redirect("/profil?e=pw");
  await db.user.update({ where: { id: u.id }, data: { passwordHash: await bcrypt.hash(n, 12) } });
  redirect("/profil?ok=pw");
}
export async function deleteAccount(fd: FormData) {
  const u = await currentUser();
  if (String(fd.get("email")).toLowerCase().trim() !== u.email) redirect("/profil?e=del");
  if (u.role === "ADMIN" && (await db.user.count({ where: { role: "ADMIN" } })) < 2) redirect("/profil?e=last");
  for (const p of [u.avatarPath, u.cvPath]) if (p) await removeObject(p).catch(() => {});
  await db.user.delete({ where: { id: u.id } });
  cookies().delete("selah");
  redirect("/login");
}

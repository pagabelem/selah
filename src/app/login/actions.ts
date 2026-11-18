"use server";
import bcrypt from "bcryptjs";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { sign } from "@/lib/auth";
const isAdminEmail = (e: string) => (process.env.ADMIN_EMAILS ?? "").split(",").map((x) => x.trim().toLowerCase()).includes(e);
async function start(id: string) {
  cookies().set("selah", await sign(id), { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", path: "/", maxAge: 2592000 });
  redirect("/");
}
export async function login(fd: FormData) {
  let u = await db.user.findUnique({ where: { email: String(fd.get("email")).toLowerCase().trim() } });
  if (!u?.passwordHash || !(await bcrypt.compare(String(fd.get("password")), u.passwordHash))) redirect("/login?e=1");
  if (isAdminEmail(u.email) && (u.role !== "ADMIN" || u.status !== "ACTIVE")) u = await db.user.update({ where: { id: u.id }, data: { role: "ADMIN", status: "ACTIVE" } });
  if (u.status === "PENDING") redirect("/login?e=3");
  if (u.status === "BLOCKED") redirect("/login?e=4");
  await db.user.update({ where: { id: u.id }, data: { lastLoginAt: new Date() } });
  await start(u.id);
}
export async function register(fd: FormData) {
  const email = String(fd.get("email")).toLowerCase().trim(), pw = String(fd.get("password"));
  if (pw.length < 8 || (await db.user.findUnique({ where: { email } }))) redirect("/login?e=2");
  const admin = isAdminEmail(email), status = admin || process.env.REQUIRE_APPROVAL === "false" ? "ACTIVE" : "PENDING";
  const u = await db.user.create({ data: { email, name: String(fd.get("name") || "") || null, passwordHash: await bcrypt.hash(pw, 12), role: admin ? "ADMIN" : "USER", status } });
  if (status === "PENDING") redirect("/login?e=5");
  await start(u.id);
}
export async function logout() { cookies().delete("selah"); redirect("/login"); }

"use server";
import bcrypt from "bcryptjs";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { sign } from "@/lib/auth";
async function start(id: string) {
  cookies().set("selah", await sign(id), { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", path: "/", maxAge: 2592000 });
  redirect("/");
}
export async function login(fd: FormData) {
  const u = await db.user.findUnique({ where: { email: String(fd.get("email")).toLowerCase().trim() } });
  if (!u?.passwordHash || !(await bcrypt.compare(String(fd.get("password")), u.passwordHash))) redirect("/login?e=1");
  await start(u.id);
}
export async function register(fd: FormData) {
  const email = String(fd.get("email")).toLowerCase().trim(), pw = String(fd.get("password"));
  if (pw.length < 8 || (await db.user.findUnique({ where: { email } }))) redirect("/login?e=2");
  const u = await db.user.create({ data: { email, name: String(fd.get("name") || "") || null, passwordHash: await bcrypt.hash(pw, 12) } });
  await start(u.id);
}
export async function logout() { cookies().delete("selah"); redirect("/login"); }

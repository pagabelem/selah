import { PrismaClient } from "@prisma/client";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { verify } from "./auth";
const g = globalThis as unknown as { prisma?: PrismaClient };
export const db = g.prisma ?? new PrismaClient();
if (process.env.NODE_ENV !== "production") g.prisma = db;
export async function currentUser() {
  const uid = await verify(cookies().get("selah")?.value);
  const u = uid ? await db.user.findUnique({ where: { id: uid } }) : null;
  if (!u) redirect("/login");
  return u;
}

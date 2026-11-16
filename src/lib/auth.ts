import { SignJWT, jwtVerify } from "jose";
const key = () => new TextEncoder().encode(process.env.AUTH_SECRET);
export const sign = (uid: string) => new SignJWT({ uid }).setProtectedHeader({ alg: "HS256" }).setExpirationTime("30d").sign(key());
export async function verify(t?: string) { try { return (await jwtVerify(t!, key())).payload.uid as string; } catch { return null; } }

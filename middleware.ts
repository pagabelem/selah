import { NextResponse, type NextRequest } from "next/server";
import { verify } from "@/lib/auth";
export async function middleware(req: NextRequest) {
  return (await verify(req.cookies.get("selah")?.value)) ? NextResponse.next() : NextResponse.redirect(new URL("/login", req.url));
}
export const config = { matcher: ["/((?!login|api/cron|_next|sw.js|manifest.webmanifest|icon.svg|favicon.ico).*)"] };

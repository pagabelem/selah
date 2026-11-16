// Usage : npm run db:bible -- chemin/bible.json LSG   (JSON : [{ "ref": "Jean 3:16", "text": "…" }])
import { PrismaClient } from "@prisma/client";
import { readFileSync } from "fs";
const db = new PrismaClient();
const rows: { ref: string; text: string }[] = JSON.parse(readFileSync(process.argv[2], "utf8"));
const version = process.argv[3] || "LSG";
async function main() { for (let i = 0; i < rows.length; i += 1000) await db.verse.createMany({ data: rows.slice(i, i + 1000).map((r) => ({ ...r, version })), skipDuplicates: true }); }
main().finally(() => db.$disconnect());

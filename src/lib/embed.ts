import { db } from "./db";
async function embed(t: string) {
  const r = await fetch("https://api.openai.com/v1/embeddings", { method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${process.env.OPENAI_API_KEY}` }, body: JSON.stringify({ model: "text-embedding-3-small", input: t.slice(0, 6000) }) });
  return `[${(await r.json()).data[0].embedding.join(",")}]`;
}
export async function indexEntry(id: string, userId: string, text: string) {
  const v = await embed(text);
  await db.$executeRaw`DELETE FROM "Embedding" WHERE "entityId" = ${id}`;
  await db.$executeRaw`INSERT INTO "Embedding" (id, "userId", entity, "entityId", embedding) VALUES (${crypto.randomUUID()}, ${userId}, 'entry', ${id}, ${v}::vector)`;
}
export async function similar(userId: string, q: string, n = 5) {
  const v = await embed(q);
  return db.$queryRaw<{ entityId: string; title: string }[]>`SELECT e."entityId", j.title FROM "Embedding" e JOIN "JournalEntry" j ON j.id = e."entityId" WHERE e."userId" = ${userId} ORDER BY e.embedding <=> ${v}::vector LIMIT ${n}`;
}

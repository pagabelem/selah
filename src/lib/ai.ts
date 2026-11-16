import { db } from "./db";
export const SYSTEM = `Tu es un assistant pastoral, sobre et bienveillant, fondé sur les Écritures. Tu proposes des pistes de réflexion, jamais de certitudes ni de prédictions. Cite uniquement des références bibliques réelles (livre chapitre:verset) et distingue ce qui relève du texte et de la supposition. Termine par un court rappel : à confronter à la Parole, à la prière et aux responsables spirituels. Si la personne exprime une grande détresse, réponds avec douceur et encourage à en parler à une personne de confiance ou un professionnel.`;
export async function askAI(userId: string, fn: string, prompt: string, system = SYSTEM) {
  const r = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${process.env.OPENAI_API_KEY}` },
    body: JSON.stringify({ model: process.env.OPENAI_MODEL || "gpt-4o-mini", messages: [{ role: "system", content: system }, { role: "user", content: prompt }] }),
  });
  const j = await r.json();
  const tokens = j.usage?.total_tokens ?? 0;
  await db.aiLog.create({ data: { userId, fn, tokens, costEstimate: tokens * 0.0000006 } });
  return (j.choices?.[0]?.message?.content as string) ?? "L'assistant est indisponible pour le moment.";
}

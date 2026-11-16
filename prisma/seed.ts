import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
const db = new PrismaClient();
async function main() {
  const user = await db.user.upsert({ where: { email: "demo@selah.app" }, update: {}, create: { email: "demo@selah.app", name: "Basile", passwordHash: await bcrypt.hash("selah1234", 10) } });
  await db.journalEntry.create({ data: { userId: user.id, type: "REVE", title: "La porte de lumière", body: "Une porte dorée s'ouvrait au bout d'un long couloir étoilé. Je ressentais une paix profonde.", emotions: ["paix", "joie"], verses: ["Apocalypse 3:8"] } });
  await db.promise.create({ data: { userId: user.id, text: "Je serai avec toi dans chaque saison.", verse: "Josué 1:9", status: "ACCOMPLIE", fulfilledAt: new Date(), testimony: "Une porte s'est ouverte au moment où je n'y croyais plus." } });
  await db.promise.create({ data: { userId: user.id, text: "Ce que j'ai commencé en toi, je l'achèverai.", verse: "Philippiens 1:6", status: "EN_ATTENTE" } });
  await db.yearVision.upsert({ where: { userId_year: { userId: user.id, year: 2026 } }, update: {}, create: { userId: user.id, year: 2026, theme: "Saison d'ouverture", vision: "Avancer avec foi et discipline.", passage: "Ésaïe 43:19", keywords: ["foi", "ouverture"] } });
}
main().finally(() => db.$disconnect());

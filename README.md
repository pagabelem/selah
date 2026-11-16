# Selah
Next.js 14 · Tailwind · Framer Motion · Prisma/PostgreSQL

    cp .env.example .env     # renseigner DATABASE_URL
    npm install
    npx prisma db push && npm run db:seed
    npm run dev

Étapes suivantes (cahier des charges) : Auth.js, modules Projets/Agenda/Objectifs/Vision, routes /api/ai, Web Push + cron.

## Ajouts v2
Projets, Agenda (rappels 1 j / 2 h / 30 min), Objectifs, Vision, Assistant IA (`/api/ai`), Web Push + manifest PWA,
cron `/api/cron/tick` (header `Authorization: Bearer $CRON_SECRET`, parole du jour à 6h Africa/Casablanca).
Clés VAPID : `npx web-push generate-vapid-keys`.

## v3
Auth (e-mail/mot de passe, JWT en cookie httpOnly — définir AUTH_SECRET), compte démo `demo@selah.app` / `selah1234` après `npm run db:seed`.
Planning + bilan du soir, Parcours, détail d'entrée avec IA, recherche, export JSON (`/api/export`), dictée vocale, mode clair.
Bible complète : `npm run db:bible -- bible.json LSG` (JSON `[{ref,text}]`, domaine public ou licence vérifiée) ; la parole de 6h l'utilise automatiquement.

## v4
PIN (`/reglages`, haché localement), calendrier mois/semaine (`/agenda/calendrier`) + iCal, CV imprimable (`/parcours/cv`), streaming IA (`/api/ai/stream`),
recherche sémantique pgvector (activer l'extension : `CREATE EXTENSION vector;` si `db push` ne le fait pas ; Neon/Supabase la proposent),
mode hors ligne (service worker + file d'attente de saisie), constellation, jeûne, rétrospective (imprimable en PDF).

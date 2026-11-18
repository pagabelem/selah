-- À exécuter UNE fois dans Supabase > SQL Editor AVANT de déployer le nouveau code. Aucune donnée supprimée.
DO $$ BEGIN CREATE TYPE "Role" AS ENUM ('USER','ADMIN'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE "AccountStatus" AS ENUM ('PENDING','ACTIVE','BLOCKED'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
ALTER TABLE "User"
  ADD COLUMN IF NOT EXISTS "role" "Role" NOT NULL DEFAULT 'USER',
  ADD COLUMN IF NOT EXISTS "status" "AccountStatus" NOT NULL DEFAULT 'ACTIVE',
  ADD COLUMN IF NOT EXISTS "lastLoginAt" TIMESTAMP(3);
-- Optionnel : promouvoir un administrateur sans passer par ADMIN_EMAILS
-- UPDATE "User" SET "role" = 'ADMIN' WHERE "email" = 'ton@email.com';

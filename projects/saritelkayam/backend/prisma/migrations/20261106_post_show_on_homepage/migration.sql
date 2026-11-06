BEGIN;

-- AlterTable
ALTER TABLE "Post" ADD COLUMN "showOnHomepage" BOOLEAN NOT NULL DEFAULT false;

-- CreateIndex
CREATE INDEX "Post_showOnHomepage_idx" ON "Post"("showOnHomepage");

-- Seed: mark the 3 most recently published posts for the homepage
WITH latest AS (
  SELECT id
  FROM "Post"
  WHERE status = 'PUBLISHED'
  ORDER BY "publishedAt" DESC NULLS LAST, "createdAt" DESC
  LIMIT 3
)
UPDATE "Post"
SET "showOnHomepage" = true
WHERE id IN (SELECT id FROM latest);

COMMIT;

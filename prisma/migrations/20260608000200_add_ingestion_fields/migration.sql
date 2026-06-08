ALTER TABLE "Job" ADD COLUMN IF NOT EXISTS "externalId" TEXT;
ALTER TABLE "Job" ADD COLUMN IF NOT EXISTS "sourceUrl" TEXT;
ALTER TABLE "Job" ADD COLUMN IF NOT EXISTS "rawPayload" JSONB;
ALTER TABLE "Job" ADD COLUMN IF NOT EXISTS "contentHash" TEXT;
ALTER TABLE "Job" ADD COLUMN IF NOT EXISTS "scrapedAt" TIMESTAMP(3);
ALTER TABLE "Job" ADD COLUMN IF NOT EXISTS "lastSeenAt" TIMESTAMP(3);

CREATE INDEX IF NOT EXISTS "Job_source_idx" ON "Job"("source");
CREATE INDEX IF NOT EXISTS "Job_externalId_idx" ON "Job"("externalId");
CREATE INDEX IF NOT EXISTS "Job_lastSeenAt_idx" ON "Job"("lastSeenAt");
CREATE UNIQUE INDEX IF NOT EXISTS "Job_source_externalId_key" ON "Job"("source", "externalId");
CREATE UNIQUE INDEX IF NOT EXISTS "Company_name_key" ON "Company"("name");

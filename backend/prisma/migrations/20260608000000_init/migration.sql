CREATE TYPE "UserRole" AS ENUM ('ADMIN', 'RECRUITER', 'CANDIDATE');
CREATE TYPE "WorkMode" AS ENUM ('REMOTE', 'HYBRID', 'ONSITE');
CREATE TYPE "ContractType" AS ENUM ('CLT', 'PJ', 'INTERNSHIP', 'FREELANCE', 'TEMPORARY');
CREATE TYPE "SeniorityLevel" AS ENUM ('INTERN', 'JUNIOR', 'MID_LEVEL', 'SENIOR', 'SPECIALIST', 'LEAD');
CREATE TYPE "JobStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'CLOSED', 'EXPIRED');
CREATE TYPE "ApplicationStatus" AS ENUM ('SENT', 'VIEWED', 'IN_REVIEW', 'APPROVED', 'REJECTED');

CREATE TABLE "User" (
  "id" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "email" TEXT NOT NULL,
  "passwordHash" TEXT NOT NULL,
  "role" "UserRole" NOT NULL DEFAULT 'CANDIDATE',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Company" (
  "id" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "description" TEXT,
  "website" TEXT,
  "location" TEXT,
  "userId" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Company_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Job" (
  "id" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "description" TEXT NOT NULL,
  "companyId" TEXT NOT NULL,
  "location" TEXT,
  "workMode" "WorkMode" NOT NULL,
  "contractType" "ContractType" NOT NULL,
  "seniorityLevel" "SeniorityLevel" NOT NULL,
  "salaryMin" INTEGER,
  "salaryMax" INTEGER,
  "currency" TEXT NOT NULL DEFAULT 'BRL',
  "status" "JobStatus" NOT NULL DEFAULT 'DRAFT',
  "publishedAt" TIMESTAMP(3),
  "expiresAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Job_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Technology" (
  "id" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Technology_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "JobTechnology" (
  "jobId" TEXT NOT NULL,
  "technologyId" TEXT NOT NULL,
  CONSTRAINT "JobTechnology_pkey" PRIMARY KEY ("jobId", "technologyId")
);

CREATE TABLE "Application" (
  "id" TEXT NOT NULL,
  "jobId" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "status" "ApplicationStatus" NOT NULL DEFAULT 'SENT',
  "coverLetter" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Application_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
CREATE INDEX "User_role_idx" ON "User"("role");
CREATE INDEX "Company_userId_idx" ON "Company"("userId");
CREATE INDEX "Company_name_idx" ON "Company"("name");
CREATE INDEX "Job_companyId_idx" ON "Job"("companyId");
CREATE INDEX "Job_status_idx" ON "Job"("status");
CREATE INDEX "Job_workMode_idx" ON "Job"("workMode");
CREATE INDEX "Job_contractType_idx" ON "Job"("contractType");
CREATE INDEX "Job_seniorityLevel_idx" ON "Job"("seniorityLevel");
CREATE INDEX "Job_location_idx" ON "Job"("location");
CREATE INDEX "Job_createdAt_idx" ON "Job"("createdAt");
CREATE UNIQUE INDEX "Technology_name_key" ON "Technology"("name");
CREATE INDEX "Technology_name_idx" ON "Technology"("name");
CREATE INDEX "JobTechnology_technologyId_idx" ON "JobTechnology"("technologyId");
CREATE INDEX "Application_jobId_idx" ON "Application"("jobId");
CREATE INDEX "Application_userId_idx" ON "Application"("userId");
CREATE INDEX "Application_status_idx" ON "Application"("status");
CREATE UNIQUE INDEX "Application_jobId_userId_key" ON "Application"("jobId", "userId");

ALTER TABLE "Company" ADD CONSTRAINT "Company_userId_fkey"
  FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "Job" ADD CONSTRAINT "Job_companyId_fkey"
  FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "JobTechnology" ADD CONSTRAINT "JobTechnology_jobId_fkey"
  FOREIGN KEY ("jobId") REFERENCES "Job"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "JobTechnology" ADD CONSTRAINT "JobTechnology_technologyId_fkey"
  FOREIGN KEY ("technologyId") REFERENCES "Technology"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "Application" ADD CONSTRAINT "Application_jobId_fkey"
  FOREIGN KEY ("jobId") REFERENCES "Job"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "Application" ADD CONSTRAINT "Application_userId_fkey"
  FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

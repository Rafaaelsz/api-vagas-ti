import { JobStatus, Prisma } from '@prisma/client';
import { prisma } from '../../shared/database/prisma';
import type { IngestionConfig, IngestionResult, IngestionSourceConfig, NormalizedJob } from './ingestion.types';
import { contentHash } from './normalization';
import { createProvider } from './providers';

function normalizeTechnologyName(name: string) {
  return name.trim();
}

async function upsertJob(job: NormalizedJob, scrapedAt: Date) {
  const hash = contentHash({
    title: job.title,
    description: job.description,
    company: job.company,
    location: job.location,
    workMode: job.workMode,
    contractType: job.contractType,
    seniorityLevel: job.seniorityLevel,
    salaryMin: job.salaryMin,
    salaryMax: job.salaryMax,
    currency: job.currency,
    externalUrl: job.externalUrl,
    technologies: job.technologies,
  });

  return prisma.$transaction(async (tx) => {
    const company = await tx.company.upsert({
      where: { name: job.company.name },
      create: {
        name: job.company.name,
        description: job.company.description,
        website: job.company.website,
        location: job.company.location ?? job.location,
      },
      update: {
        description: job.company.description,
        website: job.company.website,
        location: job.company.location ?? job.location,
      },
    });

    const existingJob = await tx.job.findUnique({
      where: {
        source_externalId: {
          source: job.source,
          externalId: job.externalId,
        },
      },
      select: {
        id: true,
        contentHash: true,
      },
    });

    const savedJob = await tx.job.upsert({
      where: {
        source_externalId: {
          source: job.source,
          externalId: job.externalId,
        },
      },
      create: {
        title: job.title,
        description: job.description,
        companyId: company.id,
        location: job.location,
        workMode: job.workMode,
        contractType: job.contractType,
        seniorityLevel: job.seniorityLevel,
        salaryMin: job.salaryMin,
        salaryMax: job.salaryMax,
        currency: job.currency ?? 'BRL',
        externalId: job.externalId,
        externalUrl: job.externalUrl,
        source: job.source,
        sourceUrl: job.sourceUrl,
        rawPayload: job.rawPayload as Prisma.InputJsonValue,
        contentHash: hash,
        status: JobStatus.PUBLISHED,
        publishedAt: job.publishedAt,
        expiresAt: job.expiresAt,
        scrapedAt,
        lastSeenAt: scrapedAt,
      },
      update: {
        title: job.title,
        description: job.description,
        companyId: company.id,
        location: job.location,
        workMode: job.workMode,
        contractType: job.contractType,
        seniorityLevel: job.seniorityLevel,
        salaryMin: job.salaryMin,
        salaryMax: job.salaryMax,
        currency: job.currency ?? 'BRL',
        externalUrl: job.externalUrl,
        sourceUrl: job.sourceUrl,
        rawPayload: job.rawPayload as Prisma.InputJsonValue,
        contentHash: hash,
        status: JobStatus.PUBLISHED,
        publishedAt: job.publishedAt,
        expiresAt: job.expiresAt,
        scrapedAt,
        lastSeenAt: scrapedAt,
      },
    });

    await tx.jobTechnology.deleteMany({
      where: {
        jobId: savedJob.id,
      },
    });

    const technologyNames = [...new Set(job.technologies.map(normalizeTechnologyName).filter(Boolean))];

    for (const technologyName of technologyNames) {
      const technology = await tx.technology.upsert({
        where: { name: technologyName },
        create: { name: technologyName },
        update: {},
      });

      await tx.jobTechnology.create({
        data: {
          jobId: savedJob.id,
          technologyId: technology.id,
        },
      });
    }

    return existingJob ? (existingJob.contentHash === hash ? 'unchanged' : 'updated') : 'created';
  });
}

async function expireMissingJobs(source: string, seenExternalIds: string[], scrapedAt: Date) {
  if (!seenExternalIds.length) return 0;

  const result = await prisma.job.updateMany({
    where: {
      source,
      externalId: {
        notIn: seenExternalIds,
      },
      status: JobStatus.PUBLISHED,
      lastSeenAt: {
        lt: scrapedAt,
      },
    },
    data: {
      status: JobStatus.EXPIRED,
    },
  });

  return result.count;
}

function includesAnyKeyword(text: string, keywords: string[]) {
  const normalizedText = text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();

  return keywords.some((keyword) =>
    normalizedText.includes(
      keyword
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase(),
    ),
  );
}

function shouldImportJob(job: NormalizedJob, source: IngestionSourceConfig) {
  const includeSearchableText = [job.title, job.technologies.join(' ')].filter(Boolean).join(' ');
  const excludeSearchableText = job.title;
  const locationSearchableText = [job.location, job.company.location].filter(Boolean).join(' ');

  if (source.requireTechnologyMatch && job.technologies.length === 0) {
    return false;
  }

  if (source.includeKeywords?.length && !includesAnyKeyword(includeSearchableText, source.includeKeywords)) {
    return false;
  }

  if (source.excludeKeywords?.length && includesAnyKeyword(excludeSearchableText, source.excludeKeywords)) {
    return false;
  }

  if (source.includeLocations?.length && !includesAnyKeyword(locationSearchableText, source.includeLocations)) {
    return false;
  }

  if (source.excludeLocations?.length && includesAnyKeyword(locationSearchableText, source.excludeLocations)) {
    return false;
  }

  return true;
}

export async function runIngestion(config: IngestionConfig): Promise<IngestionResult[]> {
  const enabledSources = config.sources.filter((source) => source.enabled !== false);
  const results: IngestionResult[] = [];

  for (const source of enabledSources) {
    const provider = createProvider(source);
    const scrapedAt = new Date();
    const fetchedJobs = await provider.fetchJobs();
    const jobs = fetchedJobs.filter((job) => shouldImportJob(job, source));
    const result: IngestionResult = {
      source: source.name,
      fetched: fetchedJobs.length,
      skipped: fetchedJobs.length - jobs.length,
      created: 0,
      updated: 0,
      unchanged: 0,
      expired: 0,
    };

    for (const job of jobs) {
      const status = await upsertJob(job, scrapedAt);
      result[status] += 1;
    }

    if (source.expireMissing) {
      result.expired = await expireMissingJobs(
        source.name,
        jobs.map((job) => job.externalId),
        scrapedAt,
      );
    }

    results.push(result);
  }

  return results;
}

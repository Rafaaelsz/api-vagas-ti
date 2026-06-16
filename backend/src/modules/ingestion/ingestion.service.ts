import { JobStatus, Prisma } from '@prisma/client';
import { prisma } from '../../shared/database/prisma';
import type {
  IngestionConfig,
  IngestionLogger,
  IngestionResult,
  IngestionSourceConfig,
  NormalizedJob,
  RunIngestionOptions,
} from './ingestion.types';
import { contentHash } from './normalization';
import { createProvider } from './providers';

const legacyDemoCompanyNames = [
  'CodeWorks Brasil',
  'Floripa Dev Studio',
  'DataBridge Labs',
  'Nordeste Cloud',
  'Pixel Forge',
  'AgroData Tech',
  'Northstar Tech',
  'Sample Tech Brasil',
  'Interface Labs',
  'Remote Labs',
  'Global Sample',
];

const legacyDemoSources = [
  'Seed Jobs',
  'Vitest',
  'test-suite',
  'test-json',
  'local-json-demo',
];

function normalizeTechnologyName(name: string) {
  return name.trim();
}

export async function removeLegacyDemoData() {
  const legacyJobs = await prisma.job.findMany({
    where: {
      OR: [
        { source: { in: legacyDemoSources } },
        { externalUrl: { contains: 'jobs.example.com' } },
        { externalUrl: { contains: 'example.com' } },
        { company: { name: { in: legacyDemoCompanyNames } } },
      ],
    },
    select: { id: true },
  });

  if (!legacyJobs.length) {
    return { jobs: 0, companies: 0 };
  }

  const legacyJobIds = legacyJobs.map((job) => job.id);

  await prisma.jobTechnology.deleteMany({
    where: { jobId: { in: legacyJobIds } },
  });

  const deletedJobs = await prisma.job.deleteMany({
    where: { id: { in: legacyJobIds } },
  });

  const deletedCompanies = await prisma.company.deleteMany({
    where: {
      OR: [
        { name: { in: legacyDemoCompanyNames } },
        { website: { contains: 'example.com' } },
      ],
      jobs: { none: {} },
    },
  });

  return {
    jobs: deletedJobs.count,
    companies: deletedCompanies.count,
  };
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

    const technologyNames = [
      ...new Set(job.technologies.map(normalizeTechnologyName).filter(Boolean)),
    ];

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

    return existingJob
      ? existingJob.contentHash === hash
        ? 'unchanged'
        : 'updated'
      : 'created';
  });
}

async function expireMissingJobs(
  source: string,
  seenExternalIds: string[],
  scrapedAt: Date,
) {
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
  const includeSearchableText = [job.title, job.technologies.join(' ')]
    .filter(Boolean)
    .join(' ');
  const excludeSearchableText = job.title;
  const locationSearchableText = [job.location, job.company.location]
    .filter(Boolean)
    .join(' ');

  if (source.requireTechnologyMatch && job.technologies.length === 0) {
    return false;
  }

  if (
    source.includeKeywords?.length &&
    !includesAnyKeyword(includeSearchableText, source.includeKeywords)
  ) {
    return false;
  }

  if (
    source.excludeKeywords?.length &&
    includesAnyKeyword(excludeSearchableText, source.excludeKeywords)
  ) {
    return false;
  }

  if (
    source.includeLocations?.length &&
    !includesAnyKeyword(locationSearchableText, source.includeLocations)
  ) {
    return false;
  }

  if (
    source.excludeLocations?.length &&
    includesAnyKeyword(locationSearchableText, source.excludeLocations)
  ) {
    return false;
  }

  return true;
}

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : 'Erro desconhecido.';
}

function createEmptyResult(source: string, durationMs = 0): IngestionResult {
  return {
    source,
    fetched: 0,
    normalized: 0,
    skipped: 0,
    created: 0,
    updated: 0,
    unchanged: 0,
    expired: 0,
    failed: false,
    durationMs,
  };
}

function logInfo(logger: IngestionLogger | undefined, message: string) {
  logger?.info(`[Ingestion] ${message}`);
}

function logWarn(logger: IngestionLogger | undefined, message: string) {
  logger?.warn(`[Ingestion] ${message}`);
}

export async function runIngestion(
  config: IngestionConfig,
  options: RunIngestionOptions = {},
): Promise<IngestionResult[]> {
  const enabledSources = config.sources.filter(
    (source) => source.enabled !== false,
  );
  const results: IngestionResult[] = [];
  const startedAt = Date.now();

  logInfo(
    options.logger,
    `Starting ingestion with ${enabledSources.length} enabled source(s).`,
  );

  for (const source of enabledSources) {
    const sourceStartedAt = Date.now();
    const result = createEmptyResult(source.name);

    logInfo(options.logger, `Starting source: ${source.name}`);

    try {
      const provider = createProvider(source);
      const scrapedAt = new Date();
      const fetchedJobs = await provider.fetchJobs();
      const jobs = fetchedJobs.filter((job) => shouldImportJob(job, source));

      result.fetched = fetchedJobs.length;
      result.normalized = fetchedJobs.length;
      result.skipped = fetchedJobs.length - jobs.length;

      logInfo(
        options.logger,
        `${source.name} returned ${result.fetched} job(s).`,
      );
      logInfo(
        options.logger,
        `${source.name} kept ${jobs.length} job(s) after filters; skipped ${result.skipped}.`,
      );

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

      result.durationMs = Date.now() - sourceStartedAt;
      logInfo(
        options.logger,
        `${source.name} saved ${result.created + result.updated} job(s), ${result.unchanged} unchanged, ${result.expired} expired in ${(
          result.durationMs / 1000
        ).toFixed(1)}s.`,
      );
    } catch (error) {
      result.failed = true;
      result.error = getErrorMessage(error);
      result.durationMs = Date.now() - sourceStartedAt;
      logWarn(
        options.logger,
        `${source.name} failed after ${(result.durationMs / 1000).toFixed(1)}s: ${result.error}`,
      );
    }

    results.push(result);
  }

  logInfo(
    options.logger,
    `Finished ingestion in ${((Date.now() - startedAt) / 1000).toFixed(1)}s.`,
  );

  return results;
}

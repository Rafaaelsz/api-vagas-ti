import { Prisma } from '@prisma/client';
import type { z } from 'zod';
import { prisma } from '../../shared/database/prisma';
import { HttpError } from '../../shared/errors/http-error';
import { getPagination } from '../../shared/utils/pagination';
import type { listJobsQuerySchema } from './jobs.schemas';

type ListJobsQuery = z.infer<typeof listJobsQuerySchema>;

const jobInclude = {
  company: true,
  technologies: { include: { technology: true } },
} satisfies Prisma.JobInclude;

function getOrderBy(query: ListJobsQuery): Prisma.JobOrderByWithRelationInput {
  if (query.sortBy) {
    return { [query.sortBy]: query.order ?? 'desc' };
  }

  const sortMap: Record<
    ListJobsQuery['sort'],
    Prisma.JobOrderByWithRelationInput
  > = {
    recent: { publishedAt: 'desc' },
    salary_desc: { salaryMax: 'desc' },
    salary_asc: { salaryMin: 'asc' },
    title_asc: { title: 'asc' },
  };

  return sortMap[query.sort];
}

function normalizeText(value: string) {
  return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

function normalizeComparableText(value: string) {
  return normalizeText(value).trim().toLowerCase();
}

function getTextVariants(value: string) {
  const variants = new Set<string>();
  const trimmed = value.trim();
  const normalized = normalizeText(trimmed);
  const brazilLocationTerms = [
    'Brazil',
    'Brasil',
    'Sao Paulo',
    'São Paulo',
    'Rio de Janeiro',
    'Belo Horizonte',
    'Curitiba',
    'Porto Alegre',
    'Recife',
    'Salvador',
    'Fortaleza',
    'Florianopolis',
    'Florianópolis',
    'Brasilia',
    'Brasília',
  ];

  variants.add(trimmed);
  variants.add(normalized);

  if (/\bsao\b/i.test(normalized)) {
    variants.add(normalized.replace(/\bsao\b/gi, 'São'));
  }

  if (/\bflorianopolis\b/i.test(normalized)) {
    variants.add(normalized.replace(/\bflorianopolis\b/gi, 'Florianópolis'));
  }

  if (/\bbrasil\b/i.test(normalized)) {
    variants.add(normalized.replace(/\bbrasil\b/gi, 'Brazil'));
    brazilLocationTerms.forEach((term) => variants.add(term));
  }

  if (/\bbrazil\b/i.test(normalized)) {
    variants.add(normalized.replace(/\bbrazil\b/gi, 'Brasil'));
    brazilLocationTerms.forEach((term) => variants.add(term));
  }

  if (/\bremoto\b/i.test(normalized)) {
    variants.add(normalized.replace(/\bremoto\b/gi, 'Remote'));
  }

  if (/\bremote\b/i.test(normalized)) {
    variants.add(normalized.replace(/\bremote\b/gi, 'Remoto'));
  }

  return [...variants].filter(Boolean);
}

function containsInsensitive(value: string): Prisma.StringFilter {
  return { contains: value, mode: 'insensitive' };
}

function buildSearchFilter(
  search?: string,
): Prisma.JobWhereInput[] | undefined {
  if (!search) return undefined;

  return getTextVariants(search).flatMap((term) => [
    { title: containsInsensitive(term) },
    { description: containsInsensitive(term) },
    { location: containsInsensitive(term) },
    { company: { name: containsInsensitive(term) } },
    { company: { location: containsInsensitive(term) } },
    {
      technologies: {
        some: {
          technology: {
            name: containsInsensitive(term),
          },
        },
      },
    },
  ]);
}

function buildLocationFilter(
  location?: string,
): Prisma.JobWhereInput | undefined {
  if (!location) return undefined;

  return {
    OR: getTextVariants(location).flatMap((term) => [
      { location: containsInsensitive(term) },
      { company: { location: containsInsensitive(term) } },
    ]),
  };
}

function buildCompanyFilter(
  company?: string,
): Prisma.JobWhereInput['company'] | undefined {
  if (!company) return undefined;

  return {
    OR: [{ id: company }, { name: containsInsensitive(company) }],
  };
}

function buildSalaryFilters(query: ListJobsQuery): Prisma.JobWhereInput[] {
  const filters: Prisma.JobWhereInput[] = [];

  if (query.salaryMin !== undefined) {
    filters.push({
      OR: [
        { salaryMax: { gte: query.salaryMin } },
        {
          AND: [{ salaryMax: null }, { salaryMin: { gte: query.salaryMin } }],
        },
      ],
    });
  }

  if (query.salaryMax !== undefined) {
    filters.push({
      OR: [
        { salaryMin: { lte: query.salaryMax } },
        {
          AND: [{ salaryMin: null }, { salaryMax: { lte: query.salaryMax } }],
        },
      ],
    });
  }

  return filters;
}

function isJobWhereInput(
  filter: Prisma.JobWhereInput | undefined,
): filter is Prisma.JobWhereInput {
  return filter !== undefined;
}

export async function listJobs(query: ListJobsQuery) {
  const searchFilter = buildSearchFilter(query.search);
  const filters = [
    buildLocationFilter(query.location),
    ...buildSalaryFilters(query),
  ].filter(isJobWhereInput);

  const where: Prisma.JobWhereInput = {
    status: query.status,
    workMode: query.workMode,
    contractType: query.contractType,
    seniorityLevel: query.seniorityLevel,
    company: buildCompanyFilter(query.company),
    AND: filters.length ? filters : undefined,
    technologies: query.technology
      ? {
          some: {
            technology: {
              name: containsInsensitive(query.technology),
            },
          },
        }
      : undefined,
    OR: searchFilter,
  };

  const skip = (query.page - 1) * query.limit;
  const [jobs, total] = await prisma.$transaction([
    prisma.job.findMany({
      where,
      skip,
      take: query.limit,
      orderBy: getOrderBy(query),
      include: jobInclude,
    }),
    prisma.job.count({ where }),
  ]);

  return {
    data: jobs,
    meta: getPagination(query.page, query.limit, total),
  };
}

export async function getJob(id: string) {
  const job = await prisma.job.findUnique({
    where: { id },
    include: jobInclude,
  });

  if (!job) {
    throw new HttpError('Vaga não encontrada.', 404, 'JOB_NOT_FOUND');
  }

  return job;
}

export async function calculateJobMatch(
  id: string,
  candidateTechnologies: string[],
) {
  const job = await getJob(id);
  const jobTechnologies = job.technologies.map(
    ({ technology }) => technology.name,
  );
  const candidateTechnologyMap = new Map(
    candidateTechnologies.map((technology) => [
      normalizeComparableText(technology),
      technology,
    ]),
  );
  const matchedTechnologies = jobTechnologies.filter((technology) =>
    candidateTechnologyMap.has(normalizeComparableText(technology)),
  );
  const missingTechnologies = jobTechnologies.filter(
    (technology) =>
      !candidateTechnologyMap.has(normalizeComparableText(technology)),
  );
  const score = jobTechnologies.length
    ? Math.round((matchedTechnologies.length / jobTechnologies.length) * 100)
    : 0;

  return {
    jobId: job.id,
    score,
    matchedTechnologies,
    missingTechnologies,
    candidateTechnologies,
    jobTechnologies,
    totalCandidateTechnologies: candidateTechnologies.length,
    totalJobTechnologies: jobTechnologies.length,
  };
}

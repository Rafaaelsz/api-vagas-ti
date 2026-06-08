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

  const sortMap: Record<ListJobsQuery['sort'], Prisma.JobOrderByWithRelationInput> = {
    recent: { publishedAt: 'desc' },
    salary_desc: { salaryMax: 'desc' },
    salary_asc: { salaryMin: 'asc' },
    title_asc: { title: 'asc' },
  };

  return sortMap[query.sort];
}

export async function listJobs(query: ListJobsQuery) {
  const searchFilter: Prisma.JobWhereInput[] | undefined = query.search
    ? [
        { title: { contains: query.search, mode: 'insensitive' } },
        { description: { contains: query.search, mode: 'insensitive' } },
        { location: { contains: query.search, mode: 'insensitive' } },
        { company: { name: { contains: query.search, mode: 'insensitive' } } },
        {
          technologies: {
            some: {
              technology: {
                name: { contains: query.search, mode: 'insensitive' },
              },
            },
          },
        },
      ]
    : undefined;

  const where: Prisma.JobWhereInput = {
    status: query.status,
    workMode: query.workMode,
    contractType: query.contractType,
    seniorityLevel: query.seniorityLevel,
    location: query.location ? { contains: query.location, mode: 'insensitive' } : undefined,
    salaryMin: query.salaryMin ? { gte: query.salaryMin } : undefined,
    salaryMax: query.salaryMax ? { lte: query.salaryMax } : undefined,
    technologies: query.technology
      ? {
          some: {
            technology: {
              name: { contains: query.technology, mode: 'insensitive' },
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

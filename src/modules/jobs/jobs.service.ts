import { JobStatus, Prisma, UserRole } from '@prisma/client';
import type { z } from 'zod';
import { prisma } from '../../shared/database/prisma';
import { HttpError } from '../../shared/errors/http-error';
import { getPagination } from '../../shared/utils/pagination';
import type { createJobSchema, listJobsQuerySchema, updateJobSchema } from './jobs.schemas';

type CreateJobInput = z.infer<typeof createJobSchema>;
type UpdateJobInput = z.infer<typeof updateJobSchema>;
type ListJobsQuery = z.infer<typeof listJobsQuerySchema>;

const jobInclude = {
  company: true,
  technologies: { include: { technology: true } },
} satisfies Prisma.JobInclude;

function technologyCreate(input: Pick<CreateJobInput, 'technologyIds' | 'technologyNames'>) {
  return [
    ...(input.technologyIds ?? []).map((id) => ({ technology: { connect: { id } } })),
    ...(input.technologyNames ?? []).map((name) => ({
      technology: {
        connectOrCreate: {
          where: { name },
          create: { name },
        },
      },
    })),
  ];
}

async function assertCompanyOwner(companyId: string, userId: string, role: UserRole) {
  const company = await prisma.company.findUnique({ where: { id: companyId } });

  if (!company) {
    throw new HttpError('Empresa não encontrada.', 404);
  }

  if (company.userId !== userId && role !== UserRole.ADMIN) {
    throw new HttpError('Somente o dono da empresa pode gerenciar vagas dessa empresa.', 403);
  }
}

async function getOwnedJob(id: string, userId: string, role: UserRole) {
  const job = await prisma.job.findUnique({
    where: { id },
    include: { company: true },
  });

  if (!job) {
    throw new HttpError('Vaga não encontrada.', 404);
  }

  if (job.company.userId !== userId && role !== UserRole.ADMIN) {
    throw new HttpError('Somente o dono da empresa pode gerenciar esta vaga.', 403);
  }

  return job;
}

export async function listJobs(query: ListJobsQuery) {
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
    OR: query.search
      ? [
          { title: { contains: query.search, mode: 'insensitive' } },
          { description: { contains: query.search, mode: 'insensitive' } },
          { company: { name: { contains: query.search, mode: 'insensitive' } } },
        ]
      : undefined,
  };

  const skip = (query.page - 1) * query.limit;
  const [jobs, total] = await prisma.$transaction([
    prisma.job.findMany({
      where,
      skip,
      take: query.limit,
      orderBy: { [query.sortBy]: query.order },
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
    include: {
      ...jobInclude,
      applications: {
        select: { id: true, status: true, createdAt: true },
      },
    },
  });

  if (!job) {
    throw new HttpError('Vaga não encontrada.', 404);
  }

  return job;
}

export async function createJob(userId: string, role: UserRole, input: CreateJobInput) {
  await assertCompanyOwner(input.companyId, userId, role);

  return prisma.job.create({
    data: {
      title: input.title,
      description: input.description,
      companyId: input.companyId,
      location: input.location,
      workMode: input.workMode,
      contractType: input.contractType,
      seniorityLevel: input.seniorityLevel,
      salaryMin: input.salaryMin,
      salaryMax: input.salaryMax,
      currency: input.currency,
      expiresAt: input.expiresAt,
      technologies: {
        create: technologyCreate(input),
      },
    },
    include: jobInclude,
  });
}

export async function updateJob(id: string, userId: string, role: UserRole, input: UpdateJobInput) {
  const currentJob = await getOwnedJob(id, userId, role);

  if (input.companyId && input.companyId !== currentJob.companyId) {
    await assertCompanyOwner(input.companyId, userId, role);
  }

  return prisma.$transaction(async (tx) => {
    const shouldReplaceTechnologies = input.technologyIds !== undefined || input.technologyNames !== undefined;

    if (shouldReplaceTechnologies) {
      await tx.jobTechnology.deleteMany({ where: { jobId: id } });
    }

    return tx.job.update({
      where: { id },
      data: {
        title: input.title,
        description: input.description,
        companyId: input.companyId,
        location: input.location,
        workMode: input.workMode,
        contractType: input.contractType,
        seniorityLevel: input.seniorityLevel,
        salaryMin: input.salaryMin,
        salaryMax: input.salaryMax,
        currency: input.currency,
        expiresAt: input.expiresAt,
        status: input.status,
        technologies: shouldReplaceTechnologies
          ? {
              create: technologyCreate({
                technologyIds: input.technologyIds ?? [],
                technologyNames: input.technologyNames ?? [],
              }),
            }
          : undefined,
      },
      include: jobInclude,
    });
  });
}

export async function deleteJob(id: string, userId: string, role: UserRole) {
  await getOwnedJob(id, userId, role);
  await prisma.job.delete({ where: { id } });
}

export async function publishJob(id: string, userId: string, role: UserRole) {
  await getOwnedJob(id, userId, role);

  return prisma.job.update({
    where: { id },
    data: {
      status: JobStatus.PUBLISHED,
      publishedAt: new Date(),
    },
    include: jobInclude,
  });
}

export async function closeJob(id: string, userId: string, role: UserRole) {
  await getOwnedJob(id, userId, role);

  return prisma.job.update({
    where: { id },
    data: { status: JobStatus.CLOSED },
    include: jobInclude,
  });
}

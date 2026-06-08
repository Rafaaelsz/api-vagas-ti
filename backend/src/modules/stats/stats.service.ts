import { JobStatus } from '@prisma/client';
import { prisma } from '../../shared/database/prisma';

const publishedJobsWhere = { status: JobStatus.PUBLISHED };

export async function getStats() {
  const [
    totalPublishedJobs,
    totalClosedJobs,
    totalExpiredJobs,
    totalCompanies,
    totalTechnologies,
    jobsByWorkMode,
    jobsBySeniority,
    jobsByContractType,
    technologiesUsage,
    locationsUsage,
    recentJobs,
  ] = await prisma.$transaction([
    prisma.job.count({ where: publishedJobsWhere }),
    prisma.job.count({ where: { status: JobStatus.CLOSED } }),
    prisma.job.count({ where: { status: JobStatus.EXPIRED } }),
    prisma.company.count(),
    prisma.technology.count(),
    prisma.job.groupBy({
      by: ['workMode'],
      where: publishedJobsWhere,
      orderBy: { workMode: 'asc' },
      _count: true,
    }),
    prisma.job.groupBy({
      by: ['seniorityLevel'],
      where: publishedJobsWhere,
      orderBy: { seniorityLevel: 'asc' },
      _count: true,
    }),
    prisma.job.groupBy({
      by: ['contractType'],
      where: publishedJobsWhere,
      orderBy: { contractType: 'asc' },
      _count: true,
    }),
    prisma.jobTechnology.groupBy({
      by: ['technologyId'],
      where: { job: publishedJobsWhere },
      _count: true,
      orderBy: { _count: { technologyId: 'desc' } },
      take: 10,
    }),
    prisma.job.groupBy({
      by: ['location'],
      where: publishedJobsWhere,
      _count: true,
      orderBy: { _count: { id: 'desc' } },
      take: 10,
    }),
    prisma.job.findMany({
      where: publishedJobsWhere,
      take: 5,
      orderBy: [{ publishedAt: 'desc' }, { createdAt: 'desc' }],
      include: {
        company: true,
        technologies: { include: { technology: true } },
      },
    }),
  ]);

  const technologyIds = technologiesUsage.map((item) => item.technologyId);
  const technologies = await prisma.technology.findMany({
    where: { id: { in: technologyIds } },
  });

  return {
    totalJobs: totalPublishedJobs,
    totalPublishedJobs,
    totalClosedJobs,
    totalExpiredJobs,
    totalCompanies,
    totalTechnologies,
    jobsByWorkMode: jobsByWorkMode.map((item) => ({
      workMode: item.workMode,
      total: item._count,
    })),
    jobsBySeniority: jobsBySeniority.map((item) => ({
      seniorityLevel: item.seniorityLevel,
      total: item._count,
    })),
    jobsByContractType: jobsByContractType.map((item) => ({
      contractType: item.contractType,
      total: item._count,
    })),
    topTechnologies: technologiesUsage.map((item) => ({
      technology: technologies.find((technology) => technology.id === item.technologyId) ?? null,
      total: item._count,
    })),
    topLocations: locationsUsage.map((item) => ({
      location: item.location ?? 'Não informado',
      total: item._count,
    })),
    recentJobs,
  };
}

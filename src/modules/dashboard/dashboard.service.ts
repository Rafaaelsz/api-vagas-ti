import { JobStatus } from '@prisma/client';
import { prisma } from '../../shared/database/prisma';

export async function getSummary() {
  const [totalJobs, totalPublishedJobs, totalClosedJobs, totalCompanies, totalApplications] =
    await prisma.$transaction([
    prisma.job.count(),
    prisma.job.count({ where: { status: JobStatus.PUBLISHED } }),
    prisma.job.count({ where: { status: JobStatus.CLOSED } }),
    prisma.company.count(),
    prisma.application.count(),
  ]);

  const [jobsByWorkMode, jobsBySeniority, technologiesUsage, recentJobs] = await Promise.all([
    prisma.job.groupBy({
      by: ['workMode'],
      orderBy: { workMode: 'asc' },
      _count: { id: true },
    }),
    prisma.job.groupBy({
      by: ['seniorityLevel'],
      orderBy: { seniorityLevel: 'asc' },
      _count: { id: true },
    }),
    prisma.jobTechnology.groupBy({
      by: ['technologyId'],
      _count: { technologyId: true },
      orderBy: { _count: { technologyId: 'desc' } },
      take: 10,
    }),
    prisma.job.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
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
    totalJobs,
    totalPublishedJobs,
    totalClosedJobs,
    totalCompanies,
    totalApplications,
    jobsByWorkMode: jobsByWorkMode.map((item) => ({
      workMode: item.workMode,
      total: item._count.id,
    })),
    jobsBySeniority: jobsBySeniority.map((item) => ({
      seniorityLevel: item.seniorityLevel,
      total: item._count.id,
    })),
    topTechnologies: technologiesUsage.map((item) => ({
      technology: technologies.find((technology) => technology.id === item.technologyId),
      total: item._count.technologyId,
    })),
    recentJobs,
  };
}

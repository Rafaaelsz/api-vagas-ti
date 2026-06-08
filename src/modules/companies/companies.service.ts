import { JobStatus, Prisma } from '@prisma/client';
import type { z } from 'zod';
import { prisma } from '../../shared/database/prisma';
import { HttpError } from '../../shared/errors/http-error';
import type { listCompaniesQuerySchema } from './companies.schemas';

type ListCompaniesQuery = z.infer<typeof listCompaniesQuerySchema>;

const companyInclude = {
  _count: {
    select: {
      jobs: {
        where: {
          status: JobStatus.PUBLISHED,
        },
      },
    },
  },
  jobs: {
    where: {
      status: JobStatus.PUBLISHED,
    },
    select: {
      id: true,
      title: true,
      status: true,
      createdAt: true,
      publishedAt: true,
      location: true,
      workMode: true,
      contractType: true,
      seniorityLevel: true,
    },
    orderBy: {
      publishedAt: 'desc',
    },
  },
} satisfies Prisma.CompanyInclude;

export function listCompanies(query: ListCompaniesQuery) {
  return prisma.company.findMany({
    where: query.search
      ? {
          OR: [
            { name: { contains: query.search, mode: 'insensitive' } },
            { description: { contains: query.search, mode: 'insensitive' } },
            { location: { contains: query.search, mode: 'insensitive' } },
          ],
        }
      : undefined,
    orderBy: { name: 'asc' },
    include: companyInclude,
  });
}

export async function getCompany(id: string) {
  const company = await prisma.company.findUnique({
    where: { id },
    include: companyInclude,
  });

  if (!company) {
    throw new HttpError('Empresa não encontrada.', 404, 'COMPANY_NOT_FOUND');
  }

  return company;
}

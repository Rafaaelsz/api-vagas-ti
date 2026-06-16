import { JobStatus, Prisma } from '@prisma/client';
import type { z } from 'zod';
import { prisma } from '../../shared/database/prisma';
import { HttpError } from '../../shared/errors/http-error';
import { getPagination } from '../../shared/utils/pagination';
import type { listCompaniesQuerySchema } from './companies.schemas';

type ListCompaniesQuery = z.infer<typeof listCompaniesQuerySchema>;

const companyListInclude = {
  _count: {
    select: {
      jobs: {
        where: {
          status: JobStatus.PUBLISHED,
        },
      },
    },
  },
} satisfies Prisma.CompanyInclude;

const companyDetailsInclude = {
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

export async function listCompanies(query: ListCompaniesQuery) {
  const where: Prisma.CompanyWhereInput | undefined = query.search
    ? {
        OR: [
          { name: { contains: query.search, mode: 'insensitive' } },
          { description: { contains: query.search, mode: 'insensitive' } },
          { location: { contains: query.search, mode: 'insensitive' } },
        ],
      }
    : undefined;
  const skip = (query.page - 1) * query.limit;

  const [companies, total] = await prisma.$transaction([
    prisma.company.findMany({
      where,
      skip,
      take: query.limit,
      orderBy: { name: 'asc' },
      include: companyListInclude,
    }),
    prisma.company.count({ where }),
  ]);

  return {
    data: companies,
    meta: getPagination(query.page, query.limit, total),
  };
}

export async function getCompany(id: string) {
  const company = await prisma.company.findUnique({
    where: { id },
    include: companyDetailsInclude,
  });

  if (!company) {
    throw new HttpError('Empresa não encontrada.', 404, 'COMPANY_NOT_FOUND');
  }

  return company;
}

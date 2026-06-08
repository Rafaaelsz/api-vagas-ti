import { UserRole } from '@prisma/client';
import type { z } from 'zod';
import { prisma } from '../../shared/database/prisma';
import { HttpError } from '../../shared/errors/http-error';
import type { createCompanySchema, updateCompanySchema } from './companies.schemas';

type CreateCompanyInput = z.infer<typeof createCompanySchema>;
type UpdateCompanyInput = z.infer<typeof updateCompanySchema>;

export function listCompanies() {
  return prisma.company.findMany({
    orderBy: { createdAt: 'desc' },
    include: { user: { select: { id: true, name: true, email: true, role: true } } },
  });
}

export async function getCompany(id: string) {
  const company = await prisma.company.findUnique({
    where: { id },
    include: {
      user: { select: { id: true, name: true, email: true, role: true } },
      jobs: { select: { id: true, title: true, status: true, createdAt: true } },
    },
  });

  if (!company) {
    throw new HttpError('Empresa não encontrada.', 404);
  }

  return company;
}

export function createCompany(userId: string, input: CreateCompanyInput) {
  return prisma.company.create({
    data: {
      ...input,
      userId,
    },
  });
}

export async function updateCompany(id: string, userId: string, role: UserRole, input: UpdateCompanyInput) {
  const company = await prisma.company.findUnique({ where: { id } });

  if (!company) {
    throw new HttpError('Empresa não encontrada.', 404);
  }

  if (company.userId !== userId && role !== UserRole.ADMIN) {
    throw new HttpError('Somente o dono da empresa pode editá-la.', 403);
  }

  return prisma.company.update({
    where: { id },
    data: input,
  });
}

export async function deleteCompany(id: string, userId: string, role: UserRole) {
  const company = await prisma.company.findUnique({ where: { id } });

  if (!company) {
    throw new HttpError('Empresa não encontrada.', 404);
  }

  if (company.userId !== userId && role !== UserRole.ADMIN) {
    throw new HttpError('Somente o dono da empresa pode excluí-la.', 403);
  }

  await prisma.company.delete({ where: { id } });
}

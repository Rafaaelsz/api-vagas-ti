import { Prisma } from '@prisma/client';
import type { z } from 'zod';
import { prisma } from '../../shared/database/prisma';
import type { listTechnologiesQuerySchema } from './technologies.schemas';

type ListTechnologiesQuery = z.infer<typeof listTechnologiesQuerySchema>;

export function listTechnologies(query: ListTechnologiesQuery) {
  return prisma.technology.findMany({
    where: query.search ? { name: { contains: query.search, mode: 'insensitive' } } : undefined,
    orderBy: { name: 'asc' },
    include: {
      _count: {
        select: {
          jobs: true,
        },
      },
    } satisfies Prisma.TechnologyInclude,
  });
}

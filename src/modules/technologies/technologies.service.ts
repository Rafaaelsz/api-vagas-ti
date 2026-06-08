import type { z } from 'zod';
import { prisma } from '../../shared/database/prisma';
import { HttpError } from '../../shared/errors/http-error';
import type { createTechnologySchema, updateTechnologySchema } from './technologies.schemas';

type CreateTechnologyInput = z.infer<typeof createTechnologySchema>;
type UpdateTechnologyInput = z.infer<typeof updateTechnologySchema>;

export function listTechnologies() {
  return prisma.technology.findMany({ orderBy: { name: 'asc' } });
}

export async function createTechnology(input: CreateTechnologyInput) {
  const existingTechnology = await prisma.technology.findUnique({ where: { name: input.name } });

  if (existingTechnology) {
    throw new HttpError('Tecnologia já cadastrada.', 409);
  }

  return prisma.technology.create({ data: input });
}

export async function updateTechnology(id: string, input: UpdateTechnologyInput) {
  const technology = await prisma.technology.findUnique({ where: { id } });

  if (!technology) {
    throw new HttpError('Tecnologia não encontrada.', 404);
  }

  return prisma.technology.update({ where: { id }, data: input });
}

export async function deleteTechnology(id: string) {
  const technology = await prisma.technology.findUnique({ where: { id } });

  if (!technology) {
    throw new HttpError('Tecnologia não encontrada.', 404);
  }

  await prisma.technology.delete({ where: { id } });
}

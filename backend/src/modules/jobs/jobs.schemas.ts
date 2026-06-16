import {
  ContractType,
  JobStatus,
  SeniorityLevel,
  WorkMode,
} from '@prisma/client';
import { z } from 'zod';
import { paginationSchema } from '../../shared/utils/pagination';

function emptyToUndefined(value: unknown) {
  if (typeof value !== 'string') return value;

  const trimmed = value.trim();
  return trimmed === '' ? undefined : trimmed;
}

const optionalStringSchema = z.preprocess(
  emptyToUndefined,
  z.string().min(1).optional(),
);
const optionalNumberSchema = z.preprocess(
  emptyToUndefined,
  z.coerce.number().int().nonnegative().optional(),
);
const optionalWorkModeSchema = z.preprocess(
  emptyToUndefined,
  z.nativeEnum(WorkMode).optional(),
);
const optionalContractTypeSchema = z.preprocess(
  emptyToUndefined,
  z.nativeEnum(ContractType).optional(),
);
const optionalSeniorityLevelSchema = z.preprocess(
  emptyToUndefined,
  z.nativeEnum(SeniorityLevel).optional(),
);

export const jobIdParamsSchema = z.object({
  id: z.string().cuid(),
});

export const listJobsQuerySchema = paginationSchema
  .extend({
    search: optionalStringSchema,
    technology: optionalStringSchema,
    company: optionalStringSchema,
    workMode: optionalWorkModeSchema,
    contractType: optionalContractTypeSchema,
    seniorityLevel: optionalSeniorityLevelSchema,
    location: optionalStringSchema,
    salaryMin: optionalNumberSchema,
    salaryMax: optionalNumberSchema,
    status: z.preprocess(
      emptyToUndefined,
      z.nativeEnum(JobStatus).default(JobStatus.PUBLISHED),
    ),
    sort: z.preprocess(
      emptyToUndefined,
      z
        .enum(['recent', 'salary_desc', 'salary_asc', 'title_asc'])
        .default('recent'),
    ),
    sortBy: z.preprocess(
      emptyToUndefined,
      z
        .enum(['createdAt', 'publishedAt', 'salaryMin', 'salaryMax', 'title'])
        .optional(),
    ),
    order: z.preprocess(emptyToUndefined, z.enum(['asc', 'desc']).optional()),
  })
  .refine(
    (data) =>
      data.salaryMin === undefined ||
      data.salaryMax === undefined ||
      data.salaryMin <= data.salaryMax,
    {
      message: 'salaryMin deve ser menor ou igual a salaryMax.',
      path: ['salaryMin'],
    },
  );

export const matchJobBodySchema = z.object({
  technologies: z
    .array(z.string().trim().min(1, 'Informe uma tecnologia válida.'))
    .min(1, 'Informe ao menos uma tecnologia.')
    .max(50, 'Informe no máximo 50 tecnologias.')
    .transform((technologies) => [...new Set(technologies)]),
});

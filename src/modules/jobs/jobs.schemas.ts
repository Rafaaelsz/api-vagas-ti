import { ContractType, JobStatus, SeniorityLevel, WorkMode } from '@prisma/client';
import { z } from 'zod';
import { paginationSchema } from '../../shared/utils/pagination';

export const jobIdParamsSchema = z.object({
  id: z.string().cuid(),
});

const jobBaseSchema = z.object({
  title: z.string().min(3),
  description: z.string().min(20),
  companyId: z.string().cuid(),
  location: z.string().min(2).optional(),
  workMode: z.nativeEnum(WorkMode),
  contractType: z.nativeEnum(ContractType),
  seniorityLevel: z.nativeEnum(SeniorityLevel),
  salaryMin: z.number().int().nonnegative().optional(),
  salaryMax: z.number().int().nonnegative().optional(),
  currency: z.string().length(3).default('BRL'),
  expiresAt: z.coerce.date().optional(),
  technologyIds: z.array(z.string().cuid()).default([]),
  technologyNames: z.array(z.string().min(1)).default([]),
});

export const createJobSchema = jobBaseSchema.refine(
  (data) => !data.salaryMin || !data.salaryMax || data.salaryMin <= data.salaryMax,
  {
    message: 'salaryMin deve ser menor ou igual a salaryMax.',
    path: ['salaryMin'],
  },
);

export const updateJobSchema = jobBaseSchema
  .partial()
  .extend({
    status: z.nativeEnum(JobStatus).optional(),
  })
  .refine((data) => !data.salaryMin || !data.salaryMax || data.salaryMin <= data.salaryMax, {
    message: 'salaryMin deve ser menor ou igual a salaryMax.',
    path: ['salaryMin'],
  });

export const listJobsQuerySchema = paginationSchema.extend({
  search: z.string().optional(),
  technology: z.string().optional(),
  workMode: z.nativeEnum(WorkMode).optional(),
  contractType: z.nativeEnum(ContractType).optional(),
  seniorityLevel: z.nativeEnum(SeniorityLevel).optional(),
  location: z.string().optional(),
  salaryMin: z.coerce.number().int().nonnegative().optional(),
  salaryMax: z.coerce.number().int().nonnegative().optional(),
  status: z.nativeEnum(JobStatus).optional(),
  sortBy: z.enum(['createdAt', 'publishedAt', 'salaryMin', 'salaryMax', 'title']).default('createdAt'),
});

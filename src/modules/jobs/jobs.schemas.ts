import { ContractType, JobStatus, SeniorityLevel, WorkMode } from '@prisma/client';
import { z } from 'zod';
import { paginationSchema } from '../../shared/utils/pagination';

export const jobIdParamsSchema = z.object({
  id: z.string().cuid(),
});

export const listJobsQuerySchema = paginationSchema
  .extend({
    search: z.string().trim().min(1).optional(),
    technology: z.string().trim().min(1).optional(),
    workMode: z.nativeEnum(WorkMode).optional(),
    contractType: z.nativeEnum(ContractType).optional(),
    seniorityLevel: z.nativeEnum(SeniorityLevel).optional(),
    location: z.string().trim().min(1).optional(),
    salaryMin: z.coerce.number().int().nonnegative().optional(),
    salaryMax: z.coerce.number().int().nonnegative().optional(),
    status: z.nativeEnum(JobStatus).default(JobStatus.PUBLISHED),
    sort: z.enum(['recent', 'salary_desc', 'salary_asc', 'title_asc']).default('recent'),
    sortBy: z.enum(['createdAt', 'publishedAt', 'salaryMin', 'salaryMax', 'title']).optional(),
    order: z.enum(['asc', 'desc']).optional(),
  })
  .refine((data) => !data.salaryMin || !data.salaryMax || data.salaryMin <= data.salaryMax, {
    message: 'salaryMin deve ser menor ou igual a salaryMax.',
    path: ['salaryMin'],
  });

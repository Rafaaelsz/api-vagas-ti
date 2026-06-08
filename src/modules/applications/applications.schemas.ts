import { ApplicationStatus } from '@prisma/client';
import { z } from 'zod';

export const applicationIdParamsSchema = z.object({
  id: z.string().cuid(),
});

export const applyJobParamsSchema = z.object({
  jobId: z.string().cuid(),
});

export const applyJobSchema = z.object({
  coverLetter: z.string().max(3000).optional(),
});

export const updateApplicationStatusSchema = z.object({
  status: z.nativeEnum(ApplicationStatus),
});

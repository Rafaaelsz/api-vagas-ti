import { z } from 'zod';

export const companyIdParamsSchema = z.object({
  id: z.string().cuid(),
});

export const createCompanySchema = z.object({
  name: z.string().min(2),
  description: z.string().max(1000).optional(),
  website: z.string().url().optional(),
  location: z.string().min(2).optional(),
});

export const updateCompanySchema = createCompanySchema.partial();

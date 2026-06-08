import { z } from 'zod';

export const companyIdParamsSchema = z.object({
  id: z.string().cuid(),
});

export const listCompaniesQuerySchema = z.object({
  search: z.string().trim().min(1).optional(),
});

import { z } from 'zod';

export const listTechnologiesQuerySchema = z.object({
  search: z.string().trim().min(1).optional(),
});

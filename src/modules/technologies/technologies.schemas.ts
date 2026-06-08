import { z } from 'zod';

export const technologyIdParamsSchema = z.object({
  id: z.string().cuid(),
});

export const createTechnologySchema = z.object({
  name: z.string().min(1).max(80),
});

export const updateTechnologySchema = createTechnologySchema.partial();

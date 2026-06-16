import { z } from 'zod';
import { paginationSchema } from '../../shared/utils/pagination';

function emptyToUndefined(value: unknown) {
  if (typeof value !== 'string') return value;

  const trimmed = value.trim();
  return trimmed === '' ? undefined : trimmed;
}

export const companyIdParamsSchema = z.object({
  id: z.string().cuid(),
});

export const listCompaniesQuerySchema = paginationSchema
  .pick({ page: true, limit: true })
  .extend({
    search: z.preprocess(emptyToUndefined, z.string().trim().min(1).optional()),
  });

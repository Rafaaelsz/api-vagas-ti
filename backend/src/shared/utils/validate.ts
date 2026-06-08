import { z, type ZodTypeAny } from 'zod';

export function parseBody<T extends ZodTypeAny>(schema: T, body: unknown): z.output<T> {
  return schema.parse(body);
}

export function parseParams<T extends ZodTypeAny>(schema: T, params: unknown): z.output<T> {
  return schema.parse(params);
}

export function parseQuery<T extends ZodTypeAny>(schema: T, query: unknown): z.output<T> {
  return schema.parse(query);
}

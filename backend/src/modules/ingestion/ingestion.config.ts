import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { z } from 'zod';
import type { IngestionConfig } from './ingestion.types';

const sourceSchema = z.object({
  name: z.string().min(1),
  type: z.enum(['json', 'greenhouse', 'lever', 'remotive', 'arbeitnow']),
  enabled: z.boolean().default(true),
  url: z.string().url().optional(),
  filePath: z.string().optional(),
  boardToken: z.string().optional(),
  companySlug: z.string().optional(),
  defaultCompanyName: z.string().optional(),
  defaultCompanyWebsite: z.string().url().optional(),
  defaultLocation: z.string().optional(),
  expireMissing: z.boolean().default(false),
  includeKeywords: z.array(z.string().min(1)).default([]),
  excludeKeywords: z.array(z.string().min(1)).default([]),
  includeLocations: z.array(z.string().min(1)).default([]),
  excludeLocations: z.array(z.string().min(1)).default([]),
  requireTechnologyMatch: z.boolean().default(false),
  requestTimeoutMs: z.number().int().positive().max(60000).default(15000),
  retryAttempts: z.number().int().nonnegative().max(5).default(1),
});

const ingestionConfigSchema = z.object({
  sources: z.array(sourceSchema).default([]),
});

export function loadIngestionConfig(
  configPath = process.env.INGESTION_CONFIG_PATH ??
    'config/ingestion-sources.json',
): IngestionConfig {
  const absolutePath = path.resolve(process.cwd(), configPath);

  if (!existsSync(absolutePath)) {
    const examplePath = path.resolve(
      process.cwd(),
      'config/ingestion-sources.example.json',
    );

    if (absolutePath !== examplePath && existsSync(examplePath)) {
      const rawExampleConfig = JSON.parse(
        readFileSync(examplePath, 'utf8'),
      ) as unknown;
      return ingestionConfigSchema.parse(rawExampleConfig);
    }

    return { sources: [] };
  }

  const rawConfig = JSON.parse(readFileSync(absolutePath, 'utf8')) as unknown;
  return ingestionConfigSchema.parse(rawConfig);
}

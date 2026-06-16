import type { ContractType, SeniorityLevel, WorkMode } from '@prisma/client';

export type IngestionProviderType =
  | 'json'
  | 'greenhouse'
  | 'lever'
  | 'remotive'
  | 'arbeitnow';

export type IngestionSourceConfig = {
  name: string;
  type: IngestionProviderType;
  enabled?: boolean;
  url?: string;
  filePath?: string;
  boardToken?: string;
  companySlug?: string;
  defaultCompanyName?: string;
  defaultCompanyWebsite?: string;
  defaultLocation?: string;
  expireMissing?: boolean;
  includeKeywords?: string[];
  excludeKeywords?: string[];
  includeLocations?: string[];
  excludeLocations?: string[];
  requireTechnologyMatch?: boolean;
  requestTimeoutMs?: number;
  retryAttempts?: number;
};

export type IngestionConfig = {
  sources: IngestionSourceConfig[];
};

export type NormalizedCompany = {
  name: string;
  description?: string;
  website?: string;
  location?: string;
};

export type NormalizedJob = {
  source: string;
  externalId: string;
  sourceUrl?: string;
  title: string;
  description: string;
  company: NormalizedCompany;
  location?: string;
  workMode: WorkMode;
  contractType: ContractType;
  seniorityLevel: SeniorityLevel;
  salaryMin?: number;
  salaryMax?: number;
  currency?: string;
  externalUrl?: string;
  publishedAt?: Date;
  expiresAt?: Date;
  technologies: string[];
  rawPayload: unknown;
};

export type IngestionProvider = {
  source: IngestionSourceConfig;
  fetchJobs(): Promise<NormalizedJob[]>;
};

export type IngestionResult = {
  source: string;
  fetched: number;
  normalized: number;
  skipped: number;
  created: number;
  updated: number;
  unchanged: number;
  expired: number;
  failed: boolean;
  error?: string;
  durationMs: number;
};

export type IngestionLogger = {
  info(message: string): void;
  warn(message: string): void;
  error(message: string): void;
};

export type RunIngestionOptions = {
  logger?: IngestionLogger;
};

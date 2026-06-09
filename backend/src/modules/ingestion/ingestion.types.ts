import type { ContractType, SeniorityLevel, WorkMode } from '@prisma/client';

export type IngestionProviderType = 'json' | 'greenhouse' | 'lever';

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
  skipped: number;
  created: number;
  updated: number;
  unchanged: number;
  expired: number;
};

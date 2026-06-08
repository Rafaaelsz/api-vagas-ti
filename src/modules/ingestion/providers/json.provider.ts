import { readFile } from 'node:fs/promises';
import path from 'node:path';
import type { IngestionProvider, IngestionSourceConfig, NormalizedJob } from '../ingestion.types';
import {
  cleanText,
  extractTechnologies,
  inferContractType,
  inferSeniority,
  inferWorkMode,
  parseDate,
  parseSalary,
} from '../normalization';

type JsonJob = {
  id?: string;
  externalId?: string;
  title: string;
  description: string;
  companyName?: string;
  company?: {
    name?: string;
    description?: string;
    website?: string;
    location?: string;
  };
  location?: string;
  workMode?: string;
  contractType?: string;
  seniorityLevel?: string;
  salaryMin?: number | string;
  salaryMax?: number | string;
  currency?: string;
  externalUrl?: string;
  url?: string;
  sourceUrl?: string;
  publishedAt?: string;
  expiresAt?: string;
  technologies?: string[];
};

async function loadJson(source: IngestionSourceConfig) {
  if (source.url) {
    const response = await fetch(source.url);

    if (!response.ok) {
      throw new Error(`Fonte JSON retornou status ${response.status}: ${source.url}`);
    }

    return response.json() as Promise<unknown>;
  }

  if (!source.filePath) {
    throw new Error(`Fonte JSON "${source.name}" precisa de "url" ou "filePath".`);
  }

  const absolutePath = path.resolve(process.cwd(), source.filePath);
  return JSON.parse(await readFile(absolutePath, 'utf8')) as unknown;
}

function getItems(payload: unknown): JsonJob[] {
  if (Array.isArray(payload)) return payload as JsonJob[];

  if (payload && typeof payload === 'object' && 'jobs' in payload && Array.isArray(payload.jobs)) {
    return payload.jobs as JsonJob[];
  }

  throw new Error('JSON de ingestão deve ser um array ou um objeto com a propriedade "jobs".');
}

export function createJsonProvider(source: IngestionSourceConfig): IngestionProvider {
  return {
    source,
    async fetchJobs() {
      const payload = await loadJson(source);
      const items = getItems(payload);

      return items.map((item, index): NormalizedJob => {
        const description = cleanText(item.description, 'Descrição não informada.');
        const companyName = item.company?.name ?? item.companyName ?? source.defaultCompanyName ?? 'Empresa não informada';
        const location = item.location ?? item.company?.location ?? source.defaultLocation;
        const title = cleanText(item.title, 'Vaga sem título');

        return {
          source: source.name,
          externalId: String(item.externalId ?? item.id ?? `${source.name}-${index}-${title}`),
          sourceUrl: item.sourceUrl ?? item.url ?? item.externalUrl ?? source.url,
          title,
          description,
          company: {
            name: companyName,
            description: item.company?.description,
            website: item.company?.website ?? source.defaultCompanyWebsite,
            location: item.company?.location ?? location,
          },
          location,
          workMode: inferWorkMode(item.workMode, location, title, description),
          contractType: inferContractType(item.contractType, title, description),
          seniorityLevel: inferSeniority(item.seniorityLevel, title, description),
          salaryMin: parseSalary(item.salaryMin),
          salaryMax: parseSalary(item.salaryMax),
          currency: item.currency ?? 'BRL',
          externalUrl: item.externalUrl ?? item.url,
          publishedAt: parseDate(item.publishedAt),
          expiresAt: parseDate(item.expiresAt),
          technologies: item.technologies?.length ? item.technologies : extractTechnologies(title, description),
          rawPayload: item,
        };
      });
    },
  };
}

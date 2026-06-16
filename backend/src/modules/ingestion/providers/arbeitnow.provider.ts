import type {
  IngestionProvider,
  IngestionSourceConfig,
  NormalizedJob,
} from '../ingestion.types';
import { fetchJson } from '../http';
import {
  cleanText,
  extractTechnologies,
  inferContractType,
  inferSeniority,
  inferWorkMode,
  parseDate,
} from '../normalization';

type ArbeitnowJob = {
  slug: string;
  company_name: string;
  title: string;
  description?: string;
  remote?: boolean;
  url: string;
  tags?: string[];
  job_types?: string[];
  location?: string;
  created_at?: number;
};

type ArbeitnowPayload = {
  data?: ArbeitnowJob[];
};

export function createArbeitnowProvider(
  source: IngestionSourceConfig,
): IngestionProvider {
  return {
    source,
    async fetchJobs() {
      const url = source.url ?? 'https://www.arbeitnow.com/api/job-board-api';
      const payload = await fetchJson<ArbeitnowPayload>(url, source);
      const jobs = payload.data ?? [];

      return jobs.map((job): NormalizedJob => {
        const title = cleanText(job.title, 'Vaga sem título');
        const description = cleanText(
          job.description,
          'Descrição não informada.',
        );
        const location = job.location ?? source.defaultLocation;
        const jobTypes = job.job_types?.join(' ');

        return {
          source: source.name,
          externalId: job.slug,
          sourceUrl: url,
          title,
          description,
          company: {
            name: cleanText(
              job.company_name,
              source.defaultCompanyName ?? 'Empresa Arbeitnow',
            ),
            website: source.defaultCompanyWebsite,
            location,
          },
          location,
          workMode: job.remote
            ? 'REMOTE'
            : inferWorkMode(location, title, description),
          contractType: inferContractType(jobTypes, title, description),
          seniorityLevel: inferSeniority(title, description),
          currency: 'EUR',
          externalUrl: job.url,
          publishedAt: job.created_at
            ? parseDate(job.created_at * 1000)
            : undefined,
          technologies: job.tags?.length
            ? [
                ...new Set(
                  job.tags.map((tag) => cleanText(tag)).filter(Boolean),
                ),
              ]
            : extractTechnologies(title, description),
          rawPayload: job,
        };
      });
    },
  };
}

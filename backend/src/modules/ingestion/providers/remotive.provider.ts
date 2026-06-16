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
  parseSalaryRange,
} from '../normalization';

type RemotiveJob = {
  id: number;
  url: string;
  title: string;
  company_name: string;
  category?: string;
  tags?: string[];
  job_type?: string;
  publication_date?: string;
  candidate_required_location?: string;
  salary?: string;
  description?: string;
};

type RemotivePayload = {
  jobs?: RemotiveJob[];
};

export function createRemotiveProvider(
  source: IngestionSourceConfig,
): IngestionProvider {
  return {
    source,
    async fetchJobs() {
      const url =
        source.url ??
        'https://remotive.com/api/remote-jobs?category=software-dev';
      const payload = await fetchJson<RemotivePayload>(url, source);
      const jobs = payload.jobs ?? [];

      return jobs.map((job): NormalizedJob => {
        const title = cleanText(job.title, 'Vaga sem título');
        const description = cleanText(
          job.description,
          'Descrição não informada.',
        );
        const location =
          job.candidate_required_location ?? source.defaultLocation ?? 'Remote';
        const salaryRange = parseSalaryRange(job.salary);

        return {
          source: source.name,
          externalId: String(job.id),
          sourceUrl: url,
          title,
          description,
          company: {
            name: cleanText(
              job.company_name,
              source.defaultCompanyName ?? 'Empresa Remotive',
            ),
            website: source.defaultCompanyWebsite,
            location,
          },
          location,
          workMode: inferWorkMode('remote', location, title, description),
          contractType: inferContractType(job.job_type, title, description),
          seniorityLevel: inferSeniority(title, description),
          salaryMin: salaryRange.salaryMin,
          salaryMax: salaryRange.salaryMax,
          currency: 'USD',
          externalUrl: job.url,
          publishedAt: parseDate(job.publication_date),
          technologies: job.tags?.length
            ? [
                ...new Set(
                  job.tags.map((tag) => cleanText(tag)).filter(Boolean),
                ),
              ]
            : extractTechnologies(title, description, job.category),
          rawPayload: job,
        };
      });
    },
  };
}

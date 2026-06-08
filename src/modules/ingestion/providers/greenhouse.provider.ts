import type { IngestionProvider, IngestionSourceConfig, NormalizedJob } from '../ingestion.types';
import { cleanText, extractTechnologies, inferContractType, inferSeniority, inferWorkMode, parseDate } from '../normalization';

type GreenhouseJob = {
  id: number;
  title: string;
  absolute_url?: string;
  updated_at?: string;
  location?: {
    name?: string;
  };
  content?: string;
  departments?: Array<{ name?: string }>;
  offices?: Array<{ name?: string; location?: string }>;
};

export function createGreenhouseProvider(source: IngestionSourceConfig): IngestionProvider {
  return {
    source,
    async fetchJobs() {
      if (!source.boardToken) {
        throw new Error(`Fonte Greenhouse "${source.name}" precisa de "boardToken".`);
      }

      const url = `https://boards-api.greenhouse.io/v1/boards/${source.boardToken}/jobs?content=true`;
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`Greenhouse retornou status ${response.status} para ${source.boardToken}.`);
      }

      const payload = (await response.json()) as { jobs?: GreenhouseJob[] };
      const jobs = payload.jobs ?? [];

      return jobs.map((job): NormalizedJob => {
        const description = cleanText(job.content, 'Descrição não informada.');
        const title = cleanText(job.title, 'Vaga sem título');
        const location = job.location?.name ?? job.offices?.[0]?.location ?? job.offices?.[0]?.name ?? source.defaultLocation;

        return {
          source: source.name,
          externalId: String(job.id),
          sourceUrl: url,
          title,
          description,
          company: {
            name: source.defaultCompanyName ?? source.boardToken ?? 'Empresa Greenhouse',
            website: source.defaultCompanyWebsite,
            location,
          },
          location,
          workMode: inferWorkMode(location, title, description),
          contractType: inferContractType(title, description),
          seniorityLevel: inferSeniority(title, description),
          currency: 'BRL',
          externalUrl: job.absolute_url,
          publishedAt: parseDate(job.updated_at),
          technologies: extractTechnologies(title, description, job.departments?.map((department) => department.name).join(' ')),
          rawPayload: job,
        };
      });
    },
  };
}

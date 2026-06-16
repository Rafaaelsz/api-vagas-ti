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

type LeverPosting = {
  id: string;
  text: string;
  hostedUrl?: string;
  applyUrl?: string;
  createdAt?: number;
  categories?: {
    team?: string;
    department?: string;
    location?: string;
    commitment?: string;
    level?: string;
  };
  descriptionPlain?: string;
  description?: string;
  lists?: Array<{ text?: string; content?: string }>;
};

export function createLeverProvider(
  source: IngestionSourceConfig,
): IngestionProvider {
  return {
    source,
    async fetchJobs() {
      if (!source.companySlug) {
        throw new Error(
          `Fonte Lever "${source.name}" precisa de "companySlug".`,
        );
      }

      const url = `https://api.lever.co/v0/postings/${source.companySlug}?mode=json`;
      const postings = await fetchJson<LeverPosting[]>(url, source);

      return postings.map((posting): NormalizedJob => {
        const description = cleanText(
          [
            posting.descriptionPlain,
            posting.description,
            posting.lists
              ?.map((list) => `${list.text ?? ''} ${list.content ?? ''}`)
              .join(' '),
          ].join(' '),
          'Descrição não informada.',
        );
        const title = cleanText(posting.text, 'Vaga sem título');
        const location = posting.categories?.location ?? source.defaultLocation;

        return {
          source: source.name,
          externalId: posting.id,
          sourceUrl: url,
          title,
          description,
          company: {
            name:
              source.defaultCompanyName ??
              source.companySlug ??
              'Empresa Lever',
            website: source.defaultCompanyWebsite,
            location,
          },
          location,
          workMode: inferWorkMode(
            location,
            posting.categories?.commitment,
            title,
            description,
          ),
          contractType: inferContractType(
            posting.categories?.commitment,
            title,
            description,
          ),
          seniorityLevel: inferSeniority(
            posting.categories?.level,
            title,
            description,
          ),
          currency: 'BRL',
          externalUrl: posting.hostedUrl ?? posting.applyUrl,
          publishedAt: posting.createdAt
            ? parseDate(posting.createdAt)
            : undefined,
          technologies: extractTechnologies(
            title,
            description,
            posting.categories?.team,
            posting.categories?.department,
          ),
          rawPayload: posting,
        };
      });
    },
  };
}

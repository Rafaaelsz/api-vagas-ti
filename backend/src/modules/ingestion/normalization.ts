import { ContractType, SeniorityLevel, WorkMode } from '@prisma/client';
import { createHash } from 'node:crypto';

const technologyKeywords = [
  'Node.js',
  'React',
  'Next.js',
  'TypeScript',
  'JavaScript',
  'Python',
  'Django',
  'FastAPI',
  'Java',
  'Spring Boot',
  'PostgreSQL',
  'MySQL',
  'MongoDB',
  'Redis',
  'Docker',
  'Kubernetes',
  'AWS',
  'Azure',
  'GCP',
  'GraphQL',
  'REST',
  'Fastify',
  'NestJS',
  'Prisma',
];

export function contentHash(value: unknown) {
  return createHash('sha256').update(JSON.stringify(value)).digest('hex');
}

export function cleanText(value: unknown, fallback = '') {
  if (typeof value !== 'string') return fallback;

  return value
    .replace(/<[^>]*>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export function inferWorkMode(...values: Array<string | undefined | null>): WorkMode {
  const text = values.filter(Boolean).join(' ').toLowerCase();

  if (/\b(remote|remoto|home office|anywhere)\b/.test(text)) return WorkMode.REMOTE;
  if (/\b(hybrid|híbrido|hibrido)\b/.test(text)) return WorkMode.HYBRID;

  return WorkMode.ONSITE;
}

export function inferContractType(...values: Array<string | undefined | null>): ContractType {
  const text = values.filter(Boolean).join(' ').toLowerCase();

  if (/\b(internship|estágio|estagio)\b/.test(text)) return ContractType.INTERNSHIP;
  if (/\b(freelance|freela|contractor)\b/.test(text)) return ContractType.FREELANCE;
  if (/\b(temporary|temporário|temporario)\b/.test(text)) return ContractType.TEMPORARY;
  if (/\b(pj|contract)\b/.test(text)) return ContractType.PJ;

  return ContractType.CLT;
}

export function inferSeniority(...values: Array<string | undefined | null>): SeniorityLevel {
  const text = values.filter(Boolean).join(' ').toLowerCase();

  if (/\b(intern|internship|estágio|estagio)\b/.test(text)) return SeniorityLevel.INTERN;
  if (/\b(junior|jr\.?|júnior)\b/.test(text)) return SeniorityLevel.JUNIOR;
  if (/\b(mid|pleno|pl\.?|middle)\b/.test(text)) return SeniorityLevel.MID_LEVEL;
  if (/\b(senior|sr\.?|sênior)\b/.test(text)) return SeniorityLevel.SENIOR;
  if (/\b(specialist|especialista)\b/.test(text)) return SeniorityLevel.SPECIALIST;
  if (/\b(lead|staff|principal)\b/.test(text)) return SeniorityLevel.LEAD;

  return SeniorityLevel.MID_LEVEL;
}

export function extractTechnologies(...values: Array<string | undefined | null>) {
  const text = values.filter(Boolean).join(' ').toLowerCase();
  const found = technologyKeywords.filter((technology) => text.includes(technology.toLowerCase()));

  return [...new Set(found)];
}

export function parseDate(value: unknown): Date | undefined {
  if (!value) return undefined;

  const date = new Date(String(value));
  return Number.isNaN(date.getTime()) ? undefined : date;
}

export function parseSalary(value: unknown): number | undefined {
  if (typeof value === 'number' && Number.isFinite(value)) return Math.round(value);
  if (typeof value !== 'string') return undefined;

  const normalized = value.replace(/[^\d]/g, '');
  if (!normalized) return undefined;

  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : undefined;
}

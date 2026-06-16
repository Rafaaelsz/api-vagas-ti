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

  const decoded = value
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, ' ');

  return decoded
    .replace(/<[^>]*>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export function inferWorkMode(
  ...values: Array<string | undefined | null>
): WorkMode {
  const text = values.filter(Boolean).join(' ').toLowerCase();

  if (/\b(remote|remoto|home office|anywhere)\b/.test(text))
    return WorkMode.REMOTE;
  if (/\b(hybrid|híbrido|hibrido)\b/.test(text)) return WorkMode.HYBRID;

  return WorkMode.ONSITE;
}

export function inferContractType(
  ...values: Array<string | undefined | null>
): ContractType {
  const text = values.filter(Boolean).join(' ').toLowerCase();

  if (/\b(internship|estágio|estagio)\b/.test(text))
    return ContractType.INTERNSHIP;
  if (/\b(freelance|freela|contractor)\b/.test(text))
    return ContractType.FREELANCE;
  if (/\b(temporary|temporário|temporario)\b/.test(text))
    return ContractType.TEMPORARY;
  if (/\b(pj|contract)\b/.test(text)) return ContractType.PJ;

  return ContractType.CLT;
}

export function inferSeniority(
  ...values: Array<string | undefined | null>
): SeniorityLevel {
  const texts = values
    .filter((value): value is string => Boolean(value))
    .map((value) =>
      value
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase(),
    );

  for (const text of texts) {
    if (/\b(intern|internship|estagio)\b/.test(text))
      return SeniorityLevel.INTERN;
    if (/\b(lead|staff|principal)\b/.test(text)) return SeniorityLevel.LEAD;
    if (/\b(specialist|especialista)\b/.test(text))
      return SeniorityLevel.SPECIALIST;
    if (/\b(senior|sr\.?)\b/.test(text)) return SeniorityLevel.SENIOR;
    if (/\b(mid|pleno|pl\.?|middle)\b/.test(text))
      return SeniorityLevel.MID_LEVEL;
    if (/\b(junior|jr\.?)\b/.test(text)) return SeniorityLevel.JUNIOR;
  }

  return SeniorityLevel.MID_LEVEL;
}

export function extractTechnologies(
  ...values: Array<string | undefined | null>
) {
  const text = values.filter(Boolean).join(' ').toLowerCase();
  const found = technologyKeywords.filter((technology) =>
    text.includes(technology.toLowerCase()),
  );

  return [...new Set(found)];
}

export function parseDate(value: unknown): Date | undefined {
  if (!value) return undefined;

  const date = new Date(String(value));
  return Number.isNaN(date.getTime()) ? undefined : date;
}

export function parseSalary(value: unknown): number | undefined {
  if (typeof value === 'number' && Number.isFinite(value))
    return Math.round(value);
  if (typeof value !== 'string') return undefined;

  const normalized = value.replace(/[^\d]/g, '');
  if (!normalized) return undefined;

  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : undefined;
}

export function parseSalaryRange(value: unknown): {
  salaryMin?: number;
  salaryMax?: number;
} {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return { salaryMin: Math.round(value) };
  }

  if (typeof value !== 'string') {
    return {};
  }

  const matches = value.match(/\d+(?:[.,]\d+)?\s*k?/gi) ?? [];
  const salaries = matches
    .map((match) => {
      const hasThousandsSuffix = /k/i.test(match);
      const numeric = Number(match.replace(/k/gi, '').replace(',', '.').trim());

      if (!Number.isFinite(numeric)) return undefined;
      return Math.round(hasThousandsSuffix ? numeric * 1000 : numeric);
    })
    .filter((salary): salary is number => salary !== undefined && salary > 0);

  if (!salaries.length) {
    return {};
  }

  return {
    salaryMin: Math.min(...salaries),
    salaryMax: salaries.length > 1 ? Math.max(...salaries) : undefined,
  };
}

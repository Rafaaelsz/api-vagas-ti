import { ApiError, apiFetch } from '@/lib/api';
import type { Company, Job, StatsSummary, Technology } from '@/types/api';
import { getCompanies } from './companies-service';
import { getJobs } from './jobs-service';
import { getTechnologies } from './technologies-service';

type DashboardResponse = {
  summary: Omit<StatsSummary, 'source'>;
};

function countBy<T extends string>(items: T[]) {
  const counts = new Map<T, number>();
  items.forEach((item) => counts.set(item, (counts.get(item) ?? 0) + 1));
  return counts;
}

function topFromMap<T extends string>(counts: Map<T, number>, key: string) {
  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1])
    .map(([value, total]) => ({ [key]: value, total }));
}

function buildPublicSummary(
  jobs: Job[],
  companies: Company[],
  technologies: Technology[],
): StatsSummary {
  const technologyCounts = new Map<
    string,
    { technology: Technology; total: number }
  >();
  const companyCounts = new Map<string, { company: Company; total: number }>();

  jobs.forEach((job) => {
    if (job.company) {
      const current = companyCounts.get(job.company.id);
      companyCounts.set(job.company.id, {
        company: job.company,
        total: (current?.total ?? 0) + 1,
      });
    }

    job.technologies?.forEach(({ technology }) => {
      const current = technologyCounts.get(technology.id);
      technologyCounts.set(technology.id, {
        technology,
        total: (current?.total ?? 0) + 1,
      });
    });
  });

  return {
    source: 'public-fallback',
    totalJobs: jobs.length,
    totalPublishedJobs: jobs.filter((job) => job.status === 'PUBLISHED').length,
    totalClosedJobs: jobs.filter((job) => job.status === 'CLOSED').length,
    totalCompanies: companies.length,
    totalTechnologies: technologies.length,
    jobsByWorkMode: topFromMap(
      countBy(jobs.map((job) => job.workMode)),
      'workMode',
    ) as StatsSummary['jobsByWorkMode'],
    jobsBySeniority: topFromMap(
      countBy(jobs.map((job) => job.seniorityLevel)),
      'seniorityLevel',
    ) as StatsSummary['jobsBySeniority'],
    jobsByContractType: topFromMap(
      countBy(jobs.map((job) => job.contractType)),
      'contractType',
    ) as StatsSummary['jobsByContractType'],
    topTechnologies: [...technologyCounts.values()]
      .sort((a, b) => b.total - a.total)
      .slice(0, 10),
    topCompanies: [...companyCounts.values()]
      .sort((a, b) => b.total - a.total)
      .slice(0, 10),
    topLocations: topFromMap(
      countBy(jobs.map((job) => job.location ?? 'Não informado')),
      'location',
    ) as StatsSummary['topLocations'],
    recentJobs: [...jobs]
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      )
      .slice(0, 5),
  };
}

export async function getStatsSummary(): Promise<StatsSummary> {
  try {
    const response = await apiFetch<DashboardResponse>('/dashboard/summary');
    return { ...response.summary, source: 'dashboard' };
  } catch (error) {
    if (
      error instanceof ApiError &&
      error.statusCode &&
      ![401, 403, 404].includes(error.statusCode)
    ) {
      throw error;
    }

    const [jobsResponse, companies, technologies] = await Promise.all([
      getJobs({ limit: 100, sortBy: 'createdAt', order: 'desc' }),
      getCompanies(),
      getTechnologies().catch(() => []),
    ]);

    return buildPublicSummary(jobsResponse.data, companies, technologies);
  }
}

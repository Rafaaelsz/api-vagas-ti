import type { Metadata } from 'next';
import { ActiveJobFilters } from '@/components/jobs/active-job-filters';
import { JobFilters } from '@/components/jobs/job-filters';
import { JobList } from '@/components/jobs/job-list';
import { ErrorState } from '@/components/shared/error-state';
import { Pagination } from '@/components/shared/pagination';
import { getJobs } from '@/services/jobs-service';
import type { JobsQuery } from '@/types/api';

export const metadata: Metadata = {
  title: 'Vagas',
  description:
    'Busque e filtre vagas de tecnologia por cargo, tecnologia, modalidade, senioridade, contrato e salário.',
};

type PageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

function first(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function normalizeSort(
  searchParams: Record<string, string | string[] | undefined>,
) {
  const sort = first(searchParams.sort);
  const sortBy = first(searchParams.sortBy);
  const order = first(searchParams.order);
  const legacySort =
    sort ?? (sortBy && order ? `${sortBy}:${order}` : undefined);

  if (legacySort === 'salaryMax:desc') return 'salary_desc';
  if (legacySort === 'salaryMin:asc') return 'salary_asc';
  if (legacySort === 'title:asc') return 'title_asc';
  if (
    legacySort === 'recent' ||
    legacySort === 'salary_desc' ||
    legacySort === 'salary_asc' ||
    legacySort === 'title_asc'
  )
    return legacySort;

  return 'recent';
}

function toQuery(
  searchParams: Record<string, string | string[] | undefined>,
): JobsQuery & { sort?: string } {
  return {
    search: first(searchParams.search),
    technology: first(searchParams.technology),
    company: first(searchParams.company),
    workMode: first(searchParams.workMode),
    contractType: first(searchParams.contractType),
    seniorityLevel: first(searchParams.seniorityLevel),
    location: first(searchParams.location),
    salaryMin: first(searchParams.salaryMin),
    salaryMax: first(searchParams.salaryMax),
    page: first(searchParams.page) ?? 1,
    limit: first(searchParams.limit) ?? 10,
    sort: normalizeSort(searchParams),
  };
}

function buildPageHref(query: JobsQuery & { sort?: string }, page: number) {
  const params = new URLSearchParams();
  Object.entries({ ...query, page }).forEach(([key, value]) => {
    if (value !== undefined && String(value).trim() !== '')
      params.set(key, String(value));
  });
  return `/vagas?${params.toString()}`;
}

export default async function JobsPage({ searchParams }: PageProps) {
  const rawParams = await searchParams;
  const query = toQuery(rawParams);

  try {
    const response = await getJobs(query);

    return (
      <section className="mx-auto grid max-w-7xl gap-6 px-4 py-10 sm:px-6 lg:px-8">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
            Vagas de tecnologia
          </h1>
          <p className="mt-2 max-w-2xl text-muted-foreground">
            Filtre oportunidades publicadas pela API e encontre vagas com mais
            contexto antes de abrir os detalhes.
          </p>
        </div>

        <JobFilters values={query as Record<string, string | undefined>} />
        <ActiveJobFilters query={query} total={response.meta.total} />

        <JobList jobs={response.data} />
        <Pagination
          page={response.meta.page}
          totalPages={response.meta.totalPages}
          buildHref={(page) => buildPageHref(query, page)}
        />
      </section>
    );
  } catch (error) {
    return (
      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <ErrorState
          message={error instanceof Error ? error.message : undefined}
        />
      </section>
    );
  }
}

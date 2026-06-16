import { apiFetch } from '@/lib/api';
import type { Job, JobMatch, JobsQuery, PaginatedResponse } from '@/types/api';

type JobResponse = { job: Job };
type JobMatchResponse = { match: JobMatch };

export async function getJobs(query: JobsQuery = {}) {
  return apiFetch<PaginatedResponse<Job>>('/jobs', {
    params: {
      status: 'PUBLISHED',
      limit: 10,
      ...query,
    },
  });
}

export async function getRecentJobs(limit = 6) {
  return getJobs({ page: 1, limit, sortBy: 'createdAt', order: 'desc' });
}

export async function getJobById(id: string) {
  const response = await apiFetch<JobResponse>(`/jobs/${id}`);
  return response.job;
}

export async function calculateJobMatch(id: string, technologies: string[]) {
  const response = await apiFetch<JobMatchResponse>(`/jobs/${id}/match`, {
    method: 'POST',
    body: JSON.stringify({ technologies }),
  });

  return response.match;
}

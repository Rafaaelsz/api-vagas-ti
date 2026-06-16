import { apiFetch } from '@/lib/api';
import type { Company, Job, PaginatedResponse } from '@/types/api';
import { getJobs } from './jobs-service';

type CompanyResponse = { company: Company };

export async function getCompanies() {
  const response = await apiFetch<PaginatedResponse<Company>>('/companies', {
    params: { limit: 100 },
  });

  return response.data;
}

export async function getCompanyById(id: string) {
  const response = await apiFetch<CompanyResponse>(`/companies/${id}`);
  return response.company;
}

export async function getPublishedJobsByCompany(id: string) {
  const response = await getJobs({ limit: 100 });
  return response.data.filter(
    (job: Job) => job.company?.id === id || job.companyId === id,
  );
}

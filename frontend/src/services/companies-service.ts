import { apiFetch } from '@/lib/api';
import type { Company, Job } from '@/types/api';
import { getJobs } from './jobs-service';

type CompaniesResponse = { data: Company[] };
type CompanyResponse = { company: Company };

export async function getCompanies() {
  const response = await apiFetch<CompaniesResponse>('/companies');
  return response.data;
}

export async function getCompanyById(id: string) {
  const response = await apiFetch<CompanyResponse>(`/companies/${id}`);
  return response.company;
}

export async function getPublishedJobsByCompany(id: string) {
  const response = await getJobs({ limit: 100 });
  return response.data.filter((job: Job) => job.company?.id === id || job.companyId === id);
}

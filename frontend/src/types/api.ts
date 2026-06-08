export type UserRole = 'ADMIN' | 'RECRUITER' | 'CANDIDATE';
export type WorkMode = 'REMOTE' | 'HYBRID' | 'ONSITE';
export type ContractType = 'CLT' | 'PJ' | 'INTERNSHIP' | 'FREELANCE' | 'TEMPORARY';
export type SeniorityLevel = 'INTERN' | 'JUNIOR' | 'MID_LEVEL' | 'SENIOR' | 'SPECIALIST' | 'LEAD';
export type JobStatus = 'DRAFT' | 'PUBLISHED' | 'CLOSED' | 'EXPIRED';

export type Technology = {
  id: string;
  name: string;
  createdAt?: string;
  updatedAt?: string;
};

export type JobTechnology = {
  jobId?: string;
  technologyId?: string;
  technology: Technology;
};

export type Company = {
  id: string;
  name: string;
  description?: string | null;
  website?: string | null;
  location?: string | null;
  jobs?: Array<Pick<Job, 'id' | 'title' | 'status' | 'createdAt'>>;
  _count?: {
    jobs?: number;
  };
  createdAt?: string;
  updatedAt?: string;
};

export type Job = {
  id: string;
  title: string;
  description: string;
  companyId: string;
  company?: Company;
  location?: string | null;
  workMode: WorkMode;
  contractType: ContractType;
  seniorityLevel: SeniorityLevel;
  salaryMin?: number | null;
  salaryMax?: number | null;
  currency: string;
  externalUrl?: string | null;
  source?: string | null;
  status: JobStatus;
  publishedAt?: string | null;
  expiresAt?: string | null;
  createdAt: string;
  updatedAt?: string;
  technologies?: JobTechnology[];
};

export type PaginatedResponse<T> = {
  data: T[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
};

export type JobsQuery = {
  search?: string;
  technology?: string;
  workMode?: WorkMode | string;
  contractType?: ContractType | string;
  seniorityLevel?: SeniorityLevel | string;
  location?: string;
  salaryMin?: string | number;
  salaryMax?: string | number;
  page?: string | number;
  limit?: string | number;
  sort?: string;
  sortBy?: string;
  order?: 'asc' | 'desc' | string;
  status?: JobStatus | string;
};

export type StatsSummary = {
  totalJobs: number;
  totalPublishedJobs: number;
  totalClosedJobs: number;
  totalCompanies: number;
  totalApplications?: number;
  totalTechnologies?: number;
  jobsByWorkMode: Array<{ workMode: WorkMode | string; total: number }>;
  jobsBySeniority: Array<{ seniorityLevel: SeniorityLevel | string; total: number }>;
  jobsByContractType?: Array<{ contractType: ContractType | string; total: number }>;
  topTechnologies: Array<{ technology: Technology | null; total: number }>;
  topLocations?: Array<{ location: string; total: number }>;
  recentJobs: Job[];
  source: 'dashboard' | 'public-fallback';
};

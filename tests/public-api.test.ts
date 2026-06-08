import { ContractType, JobStatus, SeniorityLevel, WorkMode } from '@prisma/client';
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';

process.env.NODE_ENV = 'test';
process.env.FRONTEND_URL = 'http://localhost:3000';
process.env.PORT = '3333';
process.env.HOST = '127.0.0.1';
process.env.DATABASE_URL =
  process.env.DATABASE_URL ?? 'postgresql://postgres:postgres@localhost:5432/api_vagas_test?schema=public';

const { buildApp } = await import('../src/app');
const { prisma } = await import('../src/shared/database/prisma');

const app = await buildApp();

async function seedPublicData() {
  const company = await prisma.company.create({
    data: {
      name: 'CodeWorks Brasil',
      description: 'Consultoria de APIs e produtos digitais.',
      website: 'https://codeworks.example.com',
      location: 'São Paulo, SP',
    },
  });

  const remoteCompany = await prisma.company.create({
    data: {
      name: 'Remote Labs',
      description: 'Times distribuídos para produtos web.',
      website: 'https://remote.example.com',
      location: 'Remoto',
    },
  });

  const [node, react, postgres] = await Promise.all(
    ['Node.js', 'React', 'PostgreSQL'].map((name) => prisma.technology.create({ data: { name } })),
  );

  const backendJob = await prisma.job.create({
    data: {
      title: 'Backend Developer Node.js',
      description: 'Construção de APIs REST com Node.js, TypeScript e PostgreSQL.',
      companyId: company.id,
      location: 'São Paulo, SP',
      workMode: WorkMode.REMOTE,
      contractType: ContractType.PJ,
      seniorityLevel: SeniorityLevel.JUNIOR,
      salaryMin: 3000,
      salaryMax: 8000,
      externalUrl: 'https://jobs.example.com/backend-node',
      source: 'Vitest',
      status: JobStatus.PUBLISHED,
      publishedAt: new Date(),
      technologies: {
        create: [{ technologyId: node.id }, { technologyId: postgres.id }],
      },
    },
  });

  await prisma.job.create({
    data: {
      title: 'Frontend Developer React',
      description: 'Criação de interfaces públicas com React e consumo de APIs REST.',
      companyId: remoteCompany.id,
      location: 'Remoto',
      workMode: WorkMode.REMOTE,
      contractType: ContractType.CLT,
      seniorityLevel: SeniorityLevel.MID_LEVEL,
      salaryMin: 7000,
      salaryMax: 10000,
      externalUrl: 'https://jobs.example.com/frontend-react',
      source: 'Vitest',
      status: JobStatus.PUBLISHED,
      publishedAt: new Date(),
      technologies: {
        create: [{ technologyId: react.id }],
      },
    },
  });

  return { backendJob };
}

describe('public jobs API', () => {
  beforeAll(async () => {
    await app.ready();
  });

  beforeEach(async () => {
    await prisma.jobTechnology.deleteMany();
    await prisma.job.deleteMany();
    await prisma.company.deleteMany();
    await prisma.technology.deleteMany();
  });

  afterAll(async () => {
    await app.close();
    await prisma.$disconnect();
  });

  it('retorna health check', async () => {
    const response = await app.inject({ method: 'GET', url: '/health' });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toEqual({ status: 'ok' });
  });

  it('lista vagas públicas com paginação', async () => {
    await seedPublicData();

    const response = await app.inject({ method: 'GET', url: '/jobs?page=1&limit=1' });
    const body = response.json();

    expect(response.statusCode).toBe(200);
    expect(body.data).toHaveLength(1);
    expect(body.meta).toEqual({ page: 1, limit: 1, total: 2, totalPages: 2 });
  });

  it('filtra vagas por busca, tecnologia e enums', async () => {
    await seedPublicData();

    const response = await app.inject({
      method: 'GET',
      url: '/jobs?search=node&technology=postgres&workMode=REMOTE&contractType=PJ&seniorityLevel=JUNIOR',
    });
    const body = response.json();

    expect(response.statusCode).toBe(200);
    expect(body.data).toHaveLength(1);
    expect(body.data[0].title).toContain('Node.js');
  });

  it('retorna detalhes da vaga com empresa, tecnologias e externalUrl', async () => {
    const { backendJob } = await seedPublicData();

    const response = await app.inject({ method: 'GET', url: `/jobs/${backendJob.id}` });
    const body = response.json();

    expect(response.statusCode).toBe(200);
    expect(body.job.company.name).toBe('CodeWorks Brasil');
    expect(body.job.externalUrl).toBe('https://jobs.example.com/backend-node');
    expect(body.job.technologies).toHaveLength(2);
  });

  it('lista empresas e tecnologias públicas', async () => {
    await seedPublicData();

    const companiesResponse = await app.inject({ method: 'GET', url: '/companies' });
    const technologiesResponse = await app.inject({ method: 'GET', url: '/technologies' });

    expect(companiesResponse.statusCode).toBe(200);
    expect(companiesResponse.json().data).toHaveLength(2);
    expect(technologiesResponse.statusCode).toBe(200);
    expect(technologiesResponse.json().data).toHaveLength(3);
  });

  it('retorna estatísticas públicas e alias dashboard/summary', async () => {
    await seedPublicData();

    const statsResponse = await app.inject({ method: 'GET', url: '/stats' });
    const dashboardResponse = await app.inject({ method: 'GET', url: '/dashboard/summary' });

    expect(statsResponse.statusCode).toBe(200);
    expect(statsResponse.json().totalPublishedJobs).toBe(2);
    expect(statsResponse.json().jobsByContractType).toHaveLength(2);
    expect(dashboardResponse.statusCode).toBe(200);
    expect(dashboardResponse.json().summary.totalCompanies).toBe(2);
  });
});

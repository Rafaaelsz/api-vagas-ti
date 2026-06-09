import { ContractType, JobStatus, SeniorityLevel, WorkMode } from '@prisma/client';
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';

process.env.NODE_ENV = 'test';
process.env.FRONTEND_URL = 'http://localhost:3000';
process.env.PORT = '3333';
process.env.HOST = '127.0.0.1';
process.env.DATABASE_URL =
  process.env.TEST_DATABASE_URL ?? 'postgresql://postgres:postgres@localhost:5432/api_vagas_test?schema=public';

const { buildApp } = await import('../src/app');
const { prisma } = await import('../src/shared/database/prisma');

const app = await buildApp();

async function seedPublicData() {
  const thoughtworks = await prisma.company.create({
    data: {
      name: 'Thoughtworks',
      description: 'Consultoria global de tecnologia.',
      website: 'https://www.thoughtworks.com',
      location: 'Brazil, Brazil',
    },
  });

  const wellhub = await prisma.company.create({
    data: {
      name: 'Wellhub',
      description: 'Plataforma corporativa de bem-estar anteriormente conhecida como Gympass.',
      website: 'https://wellhub.com',
      location: 'Brazil (Remote)',
    },
  });

  const [java, react, python] = await Promise.all(
    ['Java', 'React', 'Python'].map((name) => prisma.technology.create({ data: { name } })),
  );

  const backendJob = await prisma.job.create({
    data: {
      title: 'Developer Senior Java& Kafka&Quarkus&React',
      description: 'Vaga publica da Thoughtworks para desenvolvimento com Java e React.',
      companyId: thoughtworks.id,
      location: 'Brazil, Brazil',
      workMode: WorkMode.REMOTE,
      contractType: ContractType.CLT,
      seniorityLevel: SeniorityLevel.SENIOR,
      salaryMin: 12000,
      salaryMax: 18000,
      externalId: 'greenhouse-thoughtworks-7947042',
      externalUrl: 'https://www.thoughtworks.com/careers/jobs/7947042?gh_jid=7947042',
      source: 'test-suite',
      status: JobStatus.PUBLISHED,
      publishedAt: new Date(),
      technologies: {
        create: [{ technologyId: java.id }, { technologyId: react.id }],
      },
    },
  });

  await prisma.job.create({
    data: {
      title: 'AI & Data Intern',
      description: 'Vaga publica da Wellhub para estagio em dados e IA.',
      companyId: wellhub.id,
      location: 'Brazil (Remote)',
      workMode: WorkMode.REMOTE,
      contractType: ContractType.INTERNSHIP,
      seniorityLevel: SeniorityLevel.INTERN,
      salaryMin: 2000,
      salaryMax: 3500,
      externalId: 'greenhouse-gympass-8562202002',
      externalUrl: 'https://job-boards.greenhouse.io/gympass/jobs/8562202002',
      source: 'test-suite',
      status: JobStatus.PUBLISHED,
      publishedAt: new Date(),
      technologies: {
        create: [{ technologyId: python.id }],
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

  it('lista vagas publicas com paginacao', async () => {
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
      url: '/jobs?search=java&technology=react&workMode=REMOTE&contractType=CLT&seniorityLevel=SENIOR',
    });
    const body = response.json();

    expect(response.statusCode).toBe(200);
    expect(body.data).toHaveLength(1);
    expect(body.data[0].title).toContain('Java');
  });

  it('retorna vagas quando filtros combinados usam localizacao com acento e faixa salarial parcial', async () => {
    await seedPublicData();

    const response = await app.inject({
      method: 'GET',
      url: '/jobs?search=java&technology=react&location=Brasil&workMode=REMOTE&contractType=CLT&seniorityLevel=SENIOR&salaryMin=17000&salaryMax=20000',
    });
    const body = response.json();

    expect(response.statusCode).toBe(200);
    expect(body.data).toHaveLength(1);
    expect(body.data[0].title).toBe('Developer Senior Java& Kafka&Quarkus&React');
  });

  it('ignora filtros vazios na query string', async () => {
    await seedPublicData();

    const response = await app.inject({
      method: 'GET',
      url: '/jobs?search=&technology=&location=&salaryMin=&salaryMax=&sort=',
    });
    const body = response.json();

    expect(response.statusCode).toBe(200);
    expect(body.meta.total).toBe(2);
  });

  it('retorna detalhes da vaga com empresa, tecnologias e externalUrl', async () => {
    const { backendJob } = await seedPublicData();

    const response = await app.inject({ method: 'GET', url: `/jobs/${backendJob.id}` });
    const body = response.json();

    expect(response.statusCode).toBe(200);
    expect(body.job.company.name).toBe('Thoughtworks');
    expect(body.job.externalUrl).toBe('https://www.thoughtworks.com/careers/jobs/7947042?gh_jid=7947042');
    expect(body.job.technologies).toHaveLength(2);
  });

  it('lista empresas e tecnologias publicas', async () => {
    await seedPublicData();

    const companiesResponse = await app.inject({ method: 'GET', url: '/companies' });
    const technologiesResponse = await app.inject({ method: 'GET', url: '/technologies' });

    expect(companiesResponse.statusCode).toBe(200);
    expect(companiesResponse.json().data).toHaveLength(2);
    expect(technologiesResponse.statusCode).toBe(200);
    expect(technologiesResponse.json().data).toHaveLength(3);
  });

  it('retorna estatisticas publicas e alias dashboard/summary', async () => {
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

import { afterAll, beforeEach, describe, expect, it } from 'vitest';

process.env.NODE_ENV = 'test';
process.env.FRONTEND_URL = 'http://localhost:3000';
process.env.PORT = '3333';
process.env.HOST = '127.0.0.1';
process.env.DATABASE_URL =
  process.env.TEST_DATABASE_URL ??
  'postgresql://postgres:postgres@localhost:5432/api_vagas_test?schema=public';

const { removeLegacyDemoData, runIngestion } =
  await import('../src/modules/ingestion/ingestion.service');
const { inferSeniority } =
  await import('../src/modules/ingestion/normalization');
const { prisma } = await import('../src/shared/database/prisma');

describe('ingestion pipeline', () => {
  beforeEach(async () => {
    await prisma.jobTechnology.deleteMany();
    await prisma.job.deleteMany();
    await prisma.company.deleteMany();
    await prisma.technology.deleteMany();
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it('ingere vagas de JSON local com upsert idempotente', async () => {
    const config = {
      sources: [
        {
          name: 'test-json',
          type: 'json' as const,
          filePath: 'data/jobs-sample.json',
          expireMissing: true,
        },
      ],
    };

    const firstRun = await runIngestion(config);
    const secondRun = await runIngestion(config);

    const jobs = await prisma.job.findMany({
      include: {
        company: true,
        technologies: { include: { technology: true } },
      },
      orderBy: { title: 'asc' },
    });

    expect(firstRun).toHaveLength(1);
    expect(firstRun[0]).toMatchObject({
      source: 'test-json',
      fetched: 3,
      normalized: 3,
      skipped: 0,
      created: 3,
      updated: 0,
      unchanged: 0,
      expired: 0,
      failed: false,
    });
    expect(secondRun[0]).toMatchObject({
      source: 'test-json',
      fetched: 3,
      normalized: 3,
      skipped: 0,
      created: 0,
      unchanged: 3,
      expired: 0,
      failed: false,
    });
    expect(jobs).toHaveLength(3);
    expect(jobs[0].externalId).toBeTruthy();
    expect(jobs[0].source).toBe('test-json');
    expect(jobs[0].contentHash).toBeTruthy();
    expect(jobs[0].rawPayload).toBeTruthy();
    expect(jobs[0].lastSeenAt).toBeInstanceOf(Date);
    expect(jobs[0].technologies.length).toBeGreaterThan(0);
  });

  it('filtra ingestao por localizacao quando includeLocations e informado', async () => {
    const config = {
      sources: [
        {
          name: 'test-json',
          type: 'json' as const,
          filePath: 'data/jobs-sample.json',
          includeLocations: ['Sao Paulo'],
        },
      ],
    };

    const result = await runIngestion(config);
    const jobs = await prisma.job.findMany({ orderBy: { title: 'asc' } });

    expect(result[0]).toMatchObject({
      fetched: 3,
      normalized: 3,
      skipped: 2,
      created: 1,
      failed: false,
    });
    expect(jobs).toHaveLength(1);
    expect(jobs[0].location).toContain('Sao Paulo');
  });

  it('prioriza senioridade explicita do titulo antes de mencoes soltas na descricao', () => {
    expect(
      inferSeniority(
        'Staff Software Engineer',
        'Mentora pessoas junior e pleno.',
      ),
    ).toBe('LEAD');
    expect(
      inferSeniority(
        'Senior Software Engineer',
        'Trabalha com pessoas junior e pleno.',
      ),
    ).toBe('SENIOR');
    expect(
      inferSeniority('AI & Data Intern', 'Interage com times senior.'),
    ).toBe('INTERN');
  });

  it('mantem fallback por fonte quando uma ingestao falha', async () => {
    const config = {
      sources: [
        {
          name: 'broken-json',
          type: 'json' as const,
          filePath: 'data/arquivo-inexistente.json',
        },
        {
          name: 'test-json',
          type: 'json' as const,
          filePath: 'data/jobs-sample.json',
        },
      ],
    };

    const result = await runIngestion(config);
    const jobs = await prisma.job.findMany();

    expect(result[0]).toMatchObject({
      source: 'broken-json',
      fetched: 0,
      created: 0,
      failed: true,
    });
    expect(result[0].error).toBeTruthy();
    expect(result[1]).toMatchObject({
      source: 'test-json',
      fetched: 3,
      created: 3,
      failed: false,
    });
    expect(jobs).toHaveLength(3);
  });

  it('remove vagas demo legadas sem apagar vagas reais importadas', async () => {
    const [legacyCompany, realCompany] = await Promise.all([
      prisma.company.create({
        data: {
          name: 'Legacy Demo Company',
          website: 'https://legacy.example.com',
          location: 'Remoto',
        },
      }),
      prisma.company.create({
        data: {
          name: 'Nubank',
          website: 'https://nubank.com.br',
          location: 'Brazil, Sao Paulo',
        },
      }),
    ]);

    await Promise.all([
      prisma.job.create({
        data: {
          title: 'Demo Backend Developer',
          description: 'Registro legado criado antes da ingestao real.',
          companyId: legacyCompany.id,
          location: 'Remoto',
          workMode: 'REMOTE',
          contractType: 'PJ',
          seniorityLevel: 'JUNIOR',
          externalUrl: 'https://jobs.example.com/demo-backend',
          source: 'Seed Jobs',
          status: 'PUBLISHED',
        },
      }),
      prisma.job.create({
        data: {
          title: 'Finance Data Specialist',
          description: 'Vaga real importada de fonte publica oficial.',
          companyId: realCompany.id,
          location: 'Brazil, Sao Paulo',
          workMode: 'ONSITE',
          contractType: 'CLT',
          seniorityLevel: 'SPECIALIST',
          externalUrl: 'https://job-boards.greenhouse.io/nubank/jobs/7954561',
          source: 'greenhouse-nubank',
          externalId: '7954561',
          status: 'PUBLISHED',
        },
      }),
    ]);

    const removed = await removeLegacyDemoData();
    const jobs = await prisma.job.findMany({
      include: { company: true },
      orderBy: { title: 'asc' },
    });

    expect(removed).toEqual({ jobs: 1, companies: 1 });
    expect(jobs).toHaveLength(1);
    expect(jobs[0].company.name).toBe('Nubank');
    expect(jobs[0].source).toBe('greenhouse-nubank');
  });
});

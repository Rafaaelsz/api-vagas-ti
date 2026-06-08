import { afterAll, beforeEach, describe, expect, it } from 'vitest';

process.env.NODE_ENV = 'test';
process.env.FRONTEND_URL = 'http://localhost:3000';
process.env.PORT = '3333';
process.env.HOST = '127.0.0.1';
process.env.DATABASE_URL =
  process.env.TEST_DATABASE_URL ?? 'postgresql://postgres:postgres@localhost:5432/api_vagas_test?schema=public';

const { runIngestion } = await import('../src/modules/ingestion/ingestion.service');
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

    expect(firstRun).toEqual([
      {
        source: 'test-json',
        fetched: 2,
        skipped: 0,
        created: 2,
        updated: 0,
        unchanged: 0,
        expired: 0,
      },
    ]);
    expect(secondRun[0]).toMatchObject({
      source: 'test-json',
      fetched: 2,
      skipped: 0,
      created: 0,
      unchanged: 2,
      expired: 0,
    });
    expect(jobs).toHaveLength(2);
    expect(jobs[0].externalId).toBeTruthy();
    expect(jobs[0].source).toBe('test-json');
    expect(jobs[0].contentHash).toBeTruthy();
    expect(jobs[0].rawPayload).toBeTruthy();
    expect(jobs[0].lastSeenAt).toBeInstanceOf(Date);
    expect(jobs[0].technologies.length).toBeGreaterThan(0);
  });
});

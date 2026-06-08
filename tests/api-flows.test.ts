import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';

process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-secret-with-at-least-16-chars';
process.env.JWT_EXPIRES_IN = '1d';
process.env.CORS_ORIGIN = '*';
process.env.PORT = '3333';
process.env.HOST = '127.0.0.1';
process.env.DATABASE_URL =
  process.env.DATABASE_URL ?? 'postgresql://postgres:postgres@localhost:5432/api_vagas_test?schema=public';

const { buildApp } = await import('../src/app');
const { prisma } = await import('../src/shared/database/prisma');

const app = await buildApp();

async function registerUser(role: 'ADMIN' | 'RECRUITER' | 'CANDIDATE', email: string) {
  const response = await app.inject({
    method: 'POST',
    url: '/auth/register',
    payload: {
      name: `${role} User`,
      email,
      password: 'Password123',
      role,
    },
  });

  return response.json<{ token: string; user: { id: string } }>();
}

describe('API flows', () => {
  beforeAll(async () => {
    await app.ready();
  });

  beforeEach(async () => {
    await prisma.application.deleteMany();
    await prisma.jobTechnology.deleteMany();
    await prisma.job.deleteMany();
    await prisma.company.deleteMany();
    await prisma.technology.deleteMany();
    await prisma.user.deleteMany();
  });

  afterAll(async () => {
    await app.close();
    await prisma.$disconnect();
  });

  it('registra usuário e faz login', async () => {
    const registerResponse = await app.inject({
      method: 'POST',
      url: '/auth/register',
      payload: {
        name: 'Candidate User',
        email: 'candidate@test.dev',
        password: 'Password123',
        role: 'CANDIDATE',
      },
    });

    expect(registerResponse.statusCode).toBe(201);
    expect(registerResponse.json().user.passwordHash).toBeUndefined();

    const loginResponse = await app.inject({
      method: 'POST',
      url: '/auth/login',
      payload: {
        email: 'candidate@test.dev',
        password: 'Password123',
      },
    });

    expect(loginResponse.statusCode).toBe(200);
    expect(loginResponse.json().token).toBeTruthy();
  });

  it('bloqueia rota privada sem token', async () => {
    const response = await app.inject({ method: 'GET', url: '/users/me' });
    expect(response.statusCode).toBe(401);
  });

  it('cria empresa, vaga, lista vagas e filtra por tecnologia', async () => {
    const recruiter = await registerUser('RECRUITER', 'recruiter@test.dev');

    const companyResponse = await app.inject({
      method: 'POST',
      url: '/companies',
      headers: { authorization: `Bearer ${recruiter.token}` },
      payload: {
        name: 'Test Company',
        location: 'São Paulo',
      },
    });

    expect(companyResponse.statusCode).toBe(201);
    const companyId = companyResponse.json().company.id;

    const jobResponse = await app.inject({
      method: 'POST',
      url: '/jobs',
      headers: { authorization: `Bearer ${recruiter.token}` },
      payload: {
        title: 'Node.js Developer',
        description: 'Construção de APIs REST com Node.js, Fastify, Prisma e PostgreSQL.',
        companyId,
        location: 'Remoto',
        workMode: 'REMOTE',
        contractType: 'PJ',
        seniorityLevel: 'JUNIOR',
        salaryMin: 3000,
        salaryMax: 8000,
        technologyNames: ['Node.js', 'Fastify'],
      },
    });

    expect(jobResponse.statusCode).toBe(201);

    const listResponse = await app.inject({ method: 'GET', url: '/jobs?page=1&limit=10' });
    expect(listResponse.statusCode).toBe(200);
    expect(listResponse.json().meta.total).toBe(1);

    const filterResponse = await app.inject({ method: 'GET', url: '/jobs?technology=fastify' });
    expect(filterResponse.statusCode).toBe(200);
    expect(filterResponse.json().data).toHaveLength(1);
  });

  it('permite candidatura em vaga publicada e bloqueia duplicidade', async () => {
    const recruiter = await registerUser('RECRUITER', 'recruiter@test.dev');
    const candidate = await registerUser('CANDIDATE', 'candidate@test.dev');

    const companyResponse = await app.inject({
      method: 'POST',
      url: '/companies',
      headers: { authorization: `Bearer ${recruiter.token}` },
      payload: { name: 'Hiring Company' },
    });

    const jobResponse = await app.inject({
      method: 'POST',
      url: '/jobs',
      headers: { authorization: `Bearer ${recruiter.token}` },
      payload: {
        title: 'Backend Developer',
        description: 'Vaga para desenvolvimento backend com Node.js e PostgreSQL.',
        companyId: companyResponse.json().company.id,
        workMode: 'REMOTE',
        contractType: 'PJ',
        seniorityLevel: 'MID_LEVEL',
      },
    });

    const jobId = jobResponse.json().job.id;

    await app.inject({
      method: 'PATCH',
      url: `/jobs/${jobId}/publish`,
      headers: { authorization: `Bearer ${recruiter.token}` },
    });

    const applyResponse = await app.inject({
      method: 'POST',
      url: `/jobs/${jobId}/apply`,
      headers: { authorization: `Bearer ${candidate.token}` },
      payload: { coverLetter: 'Tenho interesse na vaga.' },
    });

    expect(applyResponse.statusCode).toBe(201);

    const duplicatedResponse = await app.inject({
      method: 'POST',
      url: `/jobs/${jobId}/apply`,
      headers: { authorization: `Bearer ${candidate.token}` },
      payload: {},
    });

    expect(duplicatedResponse.statusCode).toBe(409);
  });
});

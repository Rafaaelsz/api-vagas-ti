import {
  ApplicationStatus,
  ContractType,
  JobStatus,
  PrismaClient,
  SeniorityLevel,
  UserRole,
  WorkMode,
} from '@prisma/client';
import { hashPassword } from '../src/shared/utils/password';

const prisma = new PrismaClient();

async function main() {
  const [adminPassword, recruiterPassword, candidatePassword] = await Promise.all([
    hashPassword('Admin1234'),
    hashPassword('Recruiter1234'),
    hashPassword('Candidate1234'),
  ]);

  const admin = await prisma.user.upsert({
    where: { email: 'admin@apivagas.dev' },
    update: {},
    create: {
      name: 'Admin API Vagas',
      email: 'admin@apivagas.dev',
      passwordHash: adminPassword,
      role: UserRole.ADMIN,
    },
  });

  const recruiter = await prisma.user.upsert({
    where: { email: 'recruiter@apivagas.dev' },
    update: {},
    create: {
      name: 'Tech Recruiter',
      email: 'recruiter@apivagas.dev',
      passwordHash: recruiterPassword,
      role: UserRole.RECRUITER,
    },
  });

  const candidate = await prisma.user.upsert({
    where: { email: 'candidate@apivagas.dev' },
    update: {},
    create: {
      name: 'Pessoa Candidata',
      email: 'candidate@apivagas.dev',
      passwordHash: candidatePassword,
      role: UserRole.CANDIDATE,
    },
  });

  const company = await prisma.company.create({
    data: {
      name: 'CodeWorks Brasil',
      description: 'Consultoria especializada em produtos digitais e times de engenharia.',
      website: 'https://codeworks.example.com',
      location: 'São Paulo, SP',
      userId: recruiter.id,
    },
  });

  const technologies = await Promise.all(
    ['Node.js', 'TypeScript', 'React', 'PostgreSQL', 'Docker', 'Prisma'].map((name) =>
      prisma.technology.upsert({
        where: { name },
        update: {},
        create: { name },
      }),
    ),
  );

  const backendJob = await prisma.job.create({
    data: {
      title: 'Backend Developer Node.js',
      description: 'Desenvolvimento de APIs REST escaláveis com Node.js, TypeScript, Prisma e PostgreSQL.',
      companyId: company.id,
      location: 'Remoto',
      workMode: WorkMode.REMOTE,
      contractType: ContractType.PJ,
      seniorityLevel: SeniorityLevel.SENIOR,
      salaryMin: 9000,
      salaryMax: 14000,
      status: JobStatus.PUBLISHED,
      publishedAt: new Date(),
      technologies: {
        create: technologies
          .filter((technology) => ['Node.js', 'TypeScript', 'PostgreSQL', 'Prisma'].includes(technology.name))
          .map((technology) => ({ technologyId: technology.id })),
      },
    },
  });

  await prisma.job.create({
    data: {
      title: 'Full Stack Developer',
      description: 'Construção de produtos web usando React, Node.js, Docker e boas práticas de engenharia.',
      companyId: company.id,
      location: 'São Paulo, SP',
      workMode: WorkMode.HYBRID,
      contractType: ContractType.CLT,
      seniorityLevel: SeniorityLevel.MID_LEVEL,
      salaryMin: 7000,
      salaryMax: 10000,
      status: JobStatus.DRAFT,
      technologies: {
        create: technologies
          .filter((technology) => ['React', 'Node.js', 'Docker'].includes(technology.name))
          .map((technology) => ({ technologyId: technology.id })),
      },
    },
  });

  await prisma.application.upsert({
    where: { jobId_userId: { jobId: backendJob.id, userId: candidate.id } },
    update: {},
    create: {
      jobId: backendJob.id,
      userId: candidate.id,
      status: ApplicationStatus.IN_REVIEW,
      coverLetter: 'Tenho experiência com APIs Node.js e interesse na vaga.',
    },
  });

  console.log({
    admin: admin.email,
    recruiter: recruiter.email,
    candidate: candidate.email,
    passwords: {
      admin: 'Admin1234',
      recruiter: 'Recruiter1234',
      candidate: 'Candidate1234',
    },
  });
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

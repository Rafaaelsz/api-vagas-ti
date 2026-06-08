import { ContractType, JobStatus, PrismaClient, SeniorityLevel, WorkMode } from '@prisma/client';

const prisma = new PrismaClient();

const technologies = [
  'Node.js',
  'React',
  'Next.js',
  'Python',
  'Django',
  'Java',
  'Spring Boot',
  'PostgreSQL',
  'Docker',
  'AWS',
  'TypeScript',
];

const companies = [
  {
    name: 'CodeWorks Brasil',
    description: 'Consultoria de produtos digitais com foco em APIs, plataformas web e arquitetura cloud.',
    website: 'https://codeworks.example.com',
    location: 'São Paulo, SP',
  },
  {
    name: 'Northstar Tech',
    description: 'Empresa de tecnologia financeira com times distribuídos e cultura orientada a produto.',
    website: 'https://northstar.example.com',
    location: 'Remoto',
  },
  {
    name: 'DataBridge Labs',
    description: 'Laboratório de dados e automação para operações digitais de alto volume.',
    website: 'https://databridge.example.com',
    location: 'Belo Horizonte, MG',
  },
  {
    name: 'Pixel Forge',
    description: 'Studio de experiências web para produtos SaaS e e-commerces complexos.',
    website: 'https://pixelforge.example.com',
    location: 'Curitiba, PR',
  },
];

const jobs = [
  {
    title: 'Backend Developer Node.js',
    description:
      'Desenvolvimento de APIs REST públicas com Node.js, TypeScript, PostgreSQL e Docker. Experiência com Prisma e boas práticas de observabilidade será um diferencial.',
    company: 'CodeWorks Brasil',
    location: 'Remoto',
    workMode: WorkMode.REMOTE,
    contractType: ContractType.PJ,
    seniorityLevel: SeniorityLevel.SENIOR,
    salaryMin: 10000,
    salaryMax: 15000,
    externalUrl: 'https://jobs.example.com/codeworks-backend-node',
    source: 'Seed Jobs',
    technologies: ['Node.js', 'TypeScript', 'PostgreSQL', 'Docker', 'AWS'],
  },
  {
    title: 'Frontend Engineer React e Next.js',
    description:
      'Construção de interfaces públicas responsivas com React, Next.js e TypeScript, integrando APIs REST e dashboards com dados em tempo real.',
    company: 'Pixel Forge',
    location: 'Curitiba, PR',
    workMode: WorkMode.HYBRID,
    contractType: ContractType.CLT,
    seniorityLevel: SeniorityLevel.MID_LEVEL,
    salaryMin: 7000,
    salaryMax: 10500,
    externalUrl: 'https://jobs.example.com/pixelforge-frontend',
    source: 'Seed Jobs',
    technologies: ['React', 'Next.js', 'TypeScript'],
  },
  {
    title: 'Python Developer Django',
    description:
      'Atuação em sistemas backend com Python, Django, PostgreSQL e integrações com serviços externos. Perfil colaborativo e foco em qualidade de código.',
    company: 'DataBridge Labs',
    location: 'Belo Horizonte, MG',
    workMode: WorkMode.ONSITE,
    contractType: ContractType.CLT,
    seniorityLevel: SeniorityLevel.JUNIOR,
    salaryMin: 4500,
    salaryMax: 6500,
    externalUrl: 'https://jobs.example.com/databridge-python',
    source: 'Seed Jobs',
    technologies: ['Python', 'Django', 'PostgreSQL', 'Docker'],
  },
  {
    title: 'Java Spring Boot Engineer',
    description:
      'Desenvolvimento de microsserviços em Java e Spring Boot, com PostgreSQL, mensageria e deploy em ambiente cloud AWS.',
    company: 'Northstar Tech',
    location: 'Remoto',
    workMode: WorkMode.REMOTE,
    contractType: ContractType.PJ,
    seniorityLevel: SeniorityLevel.SENIOR,
    salaryMin: 12000,
    salaryMax: 18000,
    externalUrl: 'https://jobs.example.com/northstar-java',
    source: 'Seed Jobs',
    technologies: ['Java', 'Spring Boot', 'PostgreSQL', 'AWS', 'Docker'],
  },
  {
    title: 'Estágio em Desenvolvimento Full Stack',
    description:
      'Vaga de estágio para aprender desenvolvimento web com React, Node.js, PostgreSQL e práticas modernas de entrega de software.',
    company: 'CodeWorks Brasil',
    location: 'São Paulo, SP',
    workMode: WorkMode.HYBRID,
    contractType: ContractType.INTERNSHIP,
    seniorityLevel: SeniorityLevel.INTERN,
    salaryMin: 1800,
    salaryMax: 2500,
    externalUrl: 'https://jobs.example.com/codeworks-estagio',
    source: 'Seed Jobs',
    technologies: ['React', 'Node.js', 'PostgreSQL', 'TypeScript'],
  },
  {
    title: 'Freelancer Next.js Landing Pages',
    description:
      'Projeto freelance para criar landing pages performáticas com Next.js, React e integração com APIs públicas de conteúdo.',
    company: 'Pixel Forge',
    location: 'Remoto',
    workMode: WorkMode.REMOTE,
    contractType: ContractType.FREELANCE,
    seniorityLevel: SeniorityLevel.JUNIOR,
    salaryMin: 3000,
    salaryMax: 6000,
    externalUrl: 'https://jobs.example.com/pixelforge-next-freela',
    source: 'Seed Jobs',
    technologies: ['Next.js', 'React', 'TypeScript'],
  },
];

async function main() {
  await prisma.jobTechnology.deleteMany();
  await prisma.job.deleteMany();
  await prisma.company.deleteMany();
  await prisma.technology.deleteMany();

  const createdTechnologies = await Promise.all(
    technologies.map((name) =>
      prisma.technology.create({
        data: { name },
      }),
    ),
  );

  const technologyByName = new Map(createdTechnologies.map((technology) => [technology.name, technology]));

  const createdCompanies = await Promise.all(
    companies.map((company) =>
      prisma.company.create({
        data: company,
      }),
    ),
  );

  const companyByName = new Map(createdCompanies.map((company) => [company.name, company]));

  for (const job of jobs) {
    const company = companyByName.get(job.company);

    if (!company) {
      throw new Error(`Empresa não encontrada no seed: ${job.company}`);
    }

    await prisma.job.create({
      data: {
        title: job.title,
        description: job.description,
        companyId: company.id,
        location: job.location,
        workMode: job.workMode,
        contractType: job.contractType,
        seniorityLevel: job.seniorityLevel,
        salaryMin: job.salaryMin,
        salaryMax: job.salaryMax,
        currency: 'BRL',
        externalUrl: job.externalUrl,
        source: job.source,
        status: JobStatus.PUBLISHED,
        publishedAt: new Date(),
        technologies: {
          create: job.technologies.map((technologyName) => {
            const technology = technologyByName.get(technologyName);

            if (!technology) {
              throw new Error(`Tecnologia não encontrada no seed: ${technologyName}`);
            }

            return { technologyId: technology.id };
          }),
        },
      },
    });
  }

  console.log({
    companies: companies.length,
    technologies: technologies.length,
    jobs: jobs.length,
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

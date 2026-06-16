import 'dotenv/config';
import { loadIngestionConfig } from '../src/modules/ingestion/ingestion.config';
import { runIngestion } from '../src/modules/ingestion/ingestion.service';
import { prisma } from '../src/shared/database/prisma';

function ensureDatabaseUrl() {
  if (!process.env.DATABASE_URL) {
    throw new Error(
      'DATABASE_URL não encontrada. Crie backend/.env a partir de backend/.env.example ou defina DATABASE_URL no terminal.',
    );
  }
}

function loadSeedConfig() {
  const configuredPath = process.env.INGESTION_CONFIG_PATH;
  const configured = configuredPath
    ? loadIngestionConfig(configuredPath)
    : { sources: [] };

  if (configured.sources.length) {
    return configured;
  }

  return loadIngestionConfig('config/ingestion-sources.example.json');
}

async function main() {
  ensureDatabaseUrl();

  await prisma.jobTechnology.deleteMany();
  await prisma.job.deleteMany();
  await prisma.company.deleteMany();
  await prisma.technology.deleteMany();

  const config = loadSeedConfig();

  if (!config.sources.length) {
    throw new Error(
      'Nenhuma fonte real de ingestao configurada para popular o seed.',
    );
  }

  const results = await runIngestion(config, { logger: console });
  const importedJobs = results.reduce(
    (total, result) =>
      total + result.created + result.updated + result.unchanged,
    0,
  );

  if (importedJobs === 0) {
    throw new Error(
      'A ingestao nao retornou vagas reais. Verifique as fontes configuradas.',
    );
  }

  console.table(results);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

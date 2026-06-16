import 'dotenv/config';
import { loadIngestionConfig } from '../src/modules/ingestion/ingestion.config';
import {
  removeLegacyDemoData,
  runIngestion,
} from '../src/modules/ingestion/ingestion.service';
import { prisma } from '../src/shared/database/prisma';

function ensureDatabaseUrl() {
  if (!process.env.DATABASE_URL) {
    throw new Error(
      'DATABASE_URL não encontrada. Crie backend/.env a partir de backend/.env.example ou defina DATABASE_URL no terminal.',
    );
  }
}

async function main() {
  ensureDatabaseUrl();

  const config = loadIngestionConfig();

  if (!config.sources.length) {
    console.log(
      'Nenhuma fonte de ingestão configurada. Veja config/ingestion-sources.example.json.',
    );
    return;
  }

  const removedDemoData = await removeLegacyDemoData();

  if (removedDemoData.jobs || removedDemoData.companies) {
    console.log(
      `Dados ficticios legados removidos: ${removedDemoData.jobs} vagas, ${removedDemoData.companies} empresas.`,
    );
  }

  const results = await runIngestion(config, { logger: console });
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

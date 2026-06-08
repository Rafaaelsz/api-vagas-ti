import { loadIngestionConfig } from '../src/modules/ingestion/ingestion.config';
import { runIngestion } from '../src/modules/ingestion/ingestion.service';
import { prisma } from '../src/shared/database/prisma';

async function main() {
  const config = loadIngestionConfig();

  if (!config.sources.length) {
    console.log('Nenhuma fonte de ingestão configurada. Veja config/ingestion-sources.example.json.');
    return;
  }

  const results = await runIngestion(config);
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

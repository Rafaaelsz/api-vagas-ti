import { buildApp } from './app';
import { env } from './shared/config/env';

async function bootstrap() {
  const app = await buildApp();
  await app.listen({ host: env.HOST, port: env.PORT });
}

bootstrap().catch((error) => {
  console.error(error);
  process.exit(1);
});

import { buildApp } from './app';
import { env } from './shared/config/env';

async function bootstrap() {
  const app = await buildApp();

  await app.listen({
    host: env.HOST || '0.0.0.0',
    port: Number(env.PORT || 3000)
  });
}

bootstrap().catch((error) => {
  console.error(error);
  process.exit(1);
});
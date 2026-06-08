import cors from '@fastify/cors';
import swagger from '@fastify/swagger';
import swaggerUi from '@fastify/swagger-ui';
import Fastify from 'fastify';
import { companiesRoutes } from './modules/companies/companies.routes';
import { jobsRoutes } from './modules/jobs/jobs.routes';
import { dashboardCompatibilityRoutes, statsRoutes } from './modules/stats/stats.routes';
import { technologiesRoutes } from './modules/technologies/technologies.routes';
import { env } from './shared/config/env';
import { errorHandler } from './shared/errors/error-handler';

export async function buildApp() {
  const app = Fastify({
    logger: env.NODE_ENV !== 'test',
  });

  app.setErrorHandler(errorHandler);

  await app.register(cors, {
    origin:
      env.NODE_ENV === 'development'
        ? true
        : env.FRONTEND_URL.split(',').map((origin) => origin.trim()),
  });

  await app.register(swagger, {
    openapi: {
      info: {
        title: 'API Pública de Vagas de TI',
        description: 'API REST pública para busca, filtro e exploração de vagas de tecnologia.',
        version: '1.0.0',
      },
      tags: [
        { name: 'Health', description: 'Status da API' },
        { name: 'Jobs', description: 'Busca e detalhes de vagas públicas' },
        { name: 'Companies', description: 'Empresas com vagas publicadas' },
        { name: 'Technologies', description: 'Tecnologias relacionadas às vagas' },
        { name: 'Stats', description: 'Estatísticas públicas' },
      ],
    },
  });

  await app.register(swaggerUi, {
    routePrefix: '/docs',
  });

  app.get('/health', {
    schema: {
      tags: ['Health'],
      response: {
        200: {
          type: 'object',
          properties: {
            status: { type: 'string' },
          },
        },
      },
    },
    handler: async () => ({ status: 'ok' }),
  });

  await app.register(jobsRoutes, { prefix: '/jobs' });
  await app.register(companiesRoutes, { prefix: '/companies' });
  await app.register(technologiesRoutes, { prefix: '/technologies' });
  await app.register(statsRoutes, { prefix: '/stats' });
  await app.register(dashboardCompatibilityRoutes, { prefix: '/dashboard' });

  return app;
}

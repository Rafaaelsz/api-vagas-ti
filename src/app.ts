import cors from '@fastify/cors';
import jwt from '@fastify/jwt';
import rateLimit from '@fastify/rate-limit';
import swagger from '@fastify/swagger';
import swaggerUi from '@fastify/swagger-ui';
import Fastify from 'fastify';
import { applicationsRoutes } from './modules/applications/applications.routes';
import { authRoutes } from './modules/auth/auth.routes';
import { companiesRoutes } from './modules/companies/companies.routes';
import { dashboardRoutes } from './modules/dashboard/dashboard.routes';
import { jobsRoutes } from './modules/jobs/jobs.routes';
import { technologiesRoutes } from './modules/technologies/technologies.routes';
import { usersRoutes } from './modules/users/users.routes';
import { env } from './shared/config/env';
import { errorHandler } from './shared/errors/error-handler';

export async function buildApp() {
  const app = Fastify({
    logger: env.NODE_ENV !== 'test',
  });

  app.setErrorHandler(errorHandler);

  await app.register(cors, {
    origin: env.CORS_ORIGIN === '*' ? true : env.CORS_ORIGIN.split(',').map((origin) => origin.trim()),
    credentials: true,
  });

  await app.register(rateLimit, {
    max: 100,
    timeWindow: '1 minute',
  });

  await app.register(jwt, {
    secret: env.JWT_SECRET,
    sign: {
      expiresIn: env.JWT_EXPIRES_IN,
    },
  });

  await app.register(swagger, {
    openapi: {
      info: {
        title: 'API de Vagas de TI',
        description: 'API REST para cadastro, busca e gerenciamento de vagas de tecnologia.',
        version: '1.0',
      },
      components: {
        securitySchemes: {
          bearerAuth: {
            type: 'http',
            scheme: 'bearer',
            bearerFormat: 'JWT',
          },
        },
      },
      security: [{ bearerAuth: [] }],
    },
  });

  await app.register(swaggerUi, {
    routePrefix: '/docs',
  });

  app.get('/health', async () => ({ status: 'ok' }));

  await app.register(authRoutes, { prefix: '/auth' });
  await app.register(usersRoutes, { prefix: '/users' });
  await app.register(companiesRoutes, { prefix: '/companies' });
  await app.register(jobsRoutes, { prefix: '/jobs' });
  await app.register(technologiesRoutes, { prefix: '/technologies' });
  await app.register(applicationsRoutes, { prefix: '/applications' });
  await app.register(dashboardRoutes, { prefix: '/dashboard' });

  return app;
}

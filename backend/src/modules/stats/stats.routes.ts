import type { FastifyInstance } from 'fastify';
import * as statsController from './stats.controller';

export async function statsRoutes(app: FastifyInstance) {
  app.get(
    '/',
    {
      schema: {
        tags: ['Stats'],
        summary: 'Retorna estatísticas públicas para dashboards.',
      },
    },
    statsController.getStats,
  );
}

export async function dashboardCompatibilityRoutes(app: FastifyInstance) {
  app.get(
    '/summary',
    {
      schema: {
        tags: ['Stats'],
        summary: 'Alias de compatibilidade para as estatísticas públicas.',
      },
    },
    statsController.getDashboardSummary,
  );
}

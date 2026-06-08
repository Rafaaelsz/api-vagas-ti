import type { FastifyInstance } from 'fastify';
import * as statsController from './stats.controller';

export async function statsRoutes(app: FastifyInstance) {
  app.get('/', statsController.getStats);
}

export async function dashboardCompatibilityRoutes(app: FastifyInstance) {
  app.get('/summary', statsController.getDashboardSummary);
}

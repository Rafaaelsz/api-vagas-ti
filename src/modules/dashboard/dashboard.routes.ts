import { UserRole } from '@prisma/client';
import type { FastifyInstance } from 'fastify';
import { requireAuth } from '../../shared/middlewares/auth';
import { requireRoles } from '../../shared/middlewares/roles';
import * as dashboardController from './dashboard.controller';

export async function dashboardRoutes(app: FastifyInstance) {
  app.get(
    '/summary',
    { preHandler: [requireAuth, requireRoles([UserRole.ADMIN])] },
    dashboardController.getSummary,
  );
}

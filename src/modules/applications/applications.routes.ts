import { UserRole } from '@prisma/client';
import type { FastifyInstance } from 'fastify';
import { requireAuth } from '../../shared/middlewares/auth';
import { requireRoles } from '../../shared/middlewares/roles';
import * as applicationsController from './applications.controller';

export async function applicationsRoutes(app: FastifyInstance) {
  app.addHook('preHandler', requireAuth);

  app.get('/', applicationsController.listApplications);
  app.get('/:id', applicationsController.getApplication);
  app.patch(
    '/:id/status',
    { preHandler: [requireRoles([UserRole.ADMIN, UserRole.RECRUITER])] },
    applicationsController.updateApplicationStatus,
  );
  app.delete('/:id', applicationsController.deleteApplication);
}

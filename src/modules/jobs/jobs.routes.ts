import { UserRole } from '@prisma/client';
import type { FastifyInstance } from 'fastify';
import { requireAuth } from '../../shared/middlewares/auth';
import { requireRoles } from '../../shared/middlewares/roles';
import * as applicationsController from '../applications/applications.controller';
import * as jobsController from './jobs.controller';

const manageJobs = [requireAuth, requireRoles([UserRole.ADMIN, UserRole.RECRUITER])];
const applyJobs = [requireAuth, requireRoles([UserRole.CANDIDATE])];

export async function jobsRoutes(app: FastifyInstance) {
  app.get('/', jobsController.listJobs);
  app.get('/:id', jobsController.getJob);
  app.post('/', { preHandler: manageJobs }, jobsController.createJob);
  app.put('/:id', { preHandler: manageJobs }, jobsController.updateJob);
  app.delete('/:id', { preHandler: manageJobs }, jobsController.deleteJob);
  app.patch('/:id/publish', { preHandler: manageJobs }, jobsController.publishJob);
  app.patch('/:id/close', { preHandler: manageJobs }, jobsController.closeJob);
  app.post('/:jobId/apply', { preHandler: applyJobs }, applicationsController.applyToJob);
}

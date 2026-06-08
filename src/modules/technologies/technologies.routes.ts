import { UserRole } from '@prisma/client';
import type { FastifyInstance } from 'fastify';
import { requireAuth } from '../../shared/middlewares/auth';
import { requireRoles } from '../../shared/middlewares/roles';
import * as technologiesController from './technologies.controller';

const adminOnly = [requireAuth, requireRoles([UserRole.ADMIN])];

export async function technologiesRoutes(app: FastifyInstance) {
  app.get('/', technologiesController.listTechnologies);
  app.post('/', { preHandler: adminOnly }, technologiesController.createTechnology);
  app.put('/:id', { preHandler: adminOnly }, technologiesController.updateTechnology);
  app.delete('/:id', { preHandler: adminOnly }, technologiesController.deleteTechnology);
}

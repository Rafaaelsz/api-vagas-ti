import type { FastifyInstance } from 'fastify';
import { UserRole } from '@prisma/client';
import { requireAuth } from '../../shared/middlewares/auth';
import { requireRoles } from '../../shared/middlewares/roles';
import * as companiesController from './companies.controller';

export async function companiesRoutes(app: FastifyInstance) {
  app.get('/', companiesController.listCompanies);
  app.get('/:id', companiesController.getCompany);
  app.post('/', { preHandler: [requireAuth, requireRoles([UserRole.ADMIN, UserRole.RECRUITER])] }, companiesController.createCompany);
  app.put('/:id', { preHandler: [requireAuth] }, companiesController.updateCompany);
  app.delete('/:id', { preHandler: [requireAuth] }, companiesController.deleteCompany);
}

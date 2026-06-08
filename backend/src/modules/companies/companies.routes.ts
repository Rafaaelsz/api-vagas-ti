import type { FastifyInstance } from 'fastify';
import * as companiesController from './companies.controller';

export async function companiesRoutes(app: FastifyInstance) {
  app.get('/', companiesController.listCompanies);
  app.get('/:id', companiesController.getCompany);
}

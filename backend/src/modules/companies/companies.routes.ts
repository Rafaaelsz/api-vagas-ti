import type { FastifyInstance } from 'fastify';
import * as companiesController from './companies.controller';

export async function companiesRoutes(app: FastifyInstance) {
  app.get(
    '/',
    {
      schema: {
        tags: ['Companies'],
        summary: 'Lista empresas com vagas públicas e paginação.',
      },
    },
    companiesController.listCompanies,
  );

  app.get(
    '/:id',
    {
      schema: {
        tags: ['Companies'],
        summary: 'Retorna detalhes de uma empresa e suas vagas publicadas.',
      },
    },
    companiesController.getCompany,
  );
}

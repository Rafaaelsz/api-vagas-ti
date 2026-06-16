import type { FastifyInstance } from 'fastify';
import * as jobsController from './jobs.controller';

export async function jobsRoutes(app: FastifyInstance) {
  app.get(
    '/',
    {
      schema: {
        tags: ['Jobs'],
        summary: 'Lista vagas públicas com busca, filtros e paginação.',
      },
    },
    jobsController.listJobs,
  );

  app.post(
    '/:id/match',
    {
      schema: {
        tags: ['Jobs'],
        summary:
          'Calcula compatibilidade simples entre tecnologias do candidato e da vaga.',
        body: {
          type: 'object',
          required: ['technologies'],
          properties: {
            technologies: {
              type: 'array',
              minItems: 1,
              maxItems: 50,
              items: { type: 'string' },
            },
          },
        },
      },
    },
    jobsController.calculateJobMatch,
  );

  app.get(
    '/:id',
    {
      schema: {
        tags: ['Jobs'],
        summary: 'Retorna detalhes completos de uma vaga pública.',
      },
    },
    jobsController.getJob,
  );
}

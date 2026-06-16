import type { FastifyInstance } from 'fastify';
import * as technologiesController from './technologies.controller';

export async function technologiesRoutes(app: FastifyInstance) {
  app.get(
    '/',
    {
      schema: {
        tags: ['Technologies'],
        summary: 'Lista tecnologias relacionadas às vagas públicas.',
      },
    },
    technologiesController.listTechnologies,
  );
}

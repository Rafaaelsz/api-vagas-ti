import type { FastifyInstance } from 'fastify';
import * as jobsController from './jobs.controller';

export async function jobsRoutes(app: FastifyInstance) {
  app.get('/', jobsController.listJobs);
  app.get('/:id', jobsController.getJob);
}

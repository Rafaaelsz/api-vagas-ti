import type { FastifyInstance } from 'fastify';
import { requireAuth } from '../../shared/middlewares/auth';
import * as usersController from './users.controller';

export async function usersRoutes(app: FastifyInstance) {
  app.addHook('preHandler', requireAuth);

  app.get('/me', usersController.getMe);
  app.put('/me', usersController.updateMe);
  app.delete('/me', usersController.deleteMe);
}

import type { FastifyInstance } from 'fastify';
import { requireAuth } from '../../shared/middlewares/auth';
import * as authController from './auth.controller';

export async function authRoutes(app: FastifyInstance) {
  app.post('/register', authController.register);
  app.post('/login', {
    config: {
      rateLimit: {
        max: 5,
        timeWindow: '1 minute',
      },
    },
    handler: authController.login,
  });
  app.get('/me', { preHandler: [requireAuth] }, authController.me);
  app.post('/logout', { preHandler: [requireAuth] }, authController.logout);
}

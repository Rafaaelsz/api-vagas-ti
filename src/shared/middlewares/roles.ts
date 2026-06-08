import type { UserRole } from '@prisma/client';
import type { FastifyReply, FastifyRequest } from 'fastify';
import { HttpError } from '../errors/http-error';

export function requireRoles(roles: UserRole[]) {
  return async function roleMiddleware(request: FastifyRequest, _reply: FastifyReply) {
    if (!request.user || !roles.includes(request.user.role)) {
      throw new HttpError('Você não tem permissão para acessar este recurso.', 403);
    }
  };
}

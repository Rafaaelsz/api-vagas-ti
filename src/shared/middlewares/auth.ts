import type { FastifyReply, FastifyRequest } from 'fastify';
import { HttpError } from '../errors/http-error';

export async function requireAuth(request: FastifyRequest, _reply: FastifyReply) {
  try {
    await request.jwtVerify();
  } catch {
    throw new HttpError('Token de autenticação inválido ou ausente.', 401);
  }
}

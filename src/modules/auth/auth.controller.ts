import type { FastifyReply, FastifyRequest } from 'fastify';
import { parseBody } from '../../shared/utils/validate';
import { loginSchema, registerSchema } from './auth.schemas';
import * as authService from './auth.service';

export async function register(request: FastifyRequest, reply: FastifyReply) {
  const input = parseBody(registerSchema, request.body);
  const result = await authService.register(input, request.server);
  return reply.status(201).send(result);
}

export async function login(request: FastifyRequest, reply: FastifyReply) {
  const input = parseBody(loginSchema, request.body);
  const result = await authService.login(input, request.server);
  return reply.send(result);
}

export async function me(request: FastifyRequest, reply: FastifyReply) {
  return reply.send({ user: await authService.me(request.user.id) });
}

export async function logout(_request: FastifyRequest, reply: FastifyReply) {
  return reply.status(204).send();
}

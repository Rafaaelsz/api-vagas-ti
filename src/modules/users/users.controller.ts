import type { FastifyReply, FastifyRequest } from 'fastify';
import { parseBody } from '../../shared/utils/validate';
import { updateMeSchema } from './users.schemas';
import * as usersService from './users.service';

export async function getMe(request: FastifyRequest, reply: FastifyReply) {
  return reply.send({ user: await usersService.getMe(request.user.id) });
}

export async function updateMe(request: FastifyRequest, reply: FastifyReply) {
  const input = parseBody(updateMeSchema, request.body);
  return reply.send({ user: await usersService.updateMe(request.user.id, input) });
}

export async function deleteMe(request: FastifyRequest, reply: FastifyReply) {
  await usersService.deleteMe(request.user.id);
  return reply.status(204).send();
}

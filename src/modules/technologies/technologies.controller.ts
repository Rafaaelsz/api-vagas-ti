import type { FastifyReply, FastifyRequest } from 'fastify';
import { parseQuery } from '../../shared/utils/validate';
import { listTechnologiesQuerySchema } from './technologies.schemas';
import * as technologiesService from './technologies.service';

export async function listTechnologies(request: FastifyRequest, reply: FastifyReply) {
  const query = parseQuery(listTechnologiesQuerySchema, request.query);
  return reply.send({ data: await technologiesService.listTechnologies(query) });
}

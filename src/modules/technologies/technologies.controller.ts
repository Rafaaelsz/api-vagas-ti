import type { FastifyReply, FastifyRequest } from 'fastify';
import { parseBody, parseParams } from '../../shared/utils/validate';
import { createTechnologySchema, technologyIdParamsSchema, updateTechnologySchema } from './technologies.schemas';
import * as technologiesService from './technologies.service';

export async function listTechnologies(_request: FastifyRequest, reply: FastifyReply) {
  return reply.send({ data: await technologiesService.listTechnologies() });
}

export async function createTechnology(request: FastifyRequest, reply: FastifyReply) {
  const input = parseBody(createTechnologySchema, request.body);
  const technology = await technologiesService.createTechnology(input);
  return reply.status(201).send({ technology });
}

export async function updateTechnology(request: FastifyRequest, reply: FastifyReply) {
  const { id } = parseParams(technologyIdParamsSchema, request.params);
  const input = parseBody(updateTechnologySchema, request.body);
  return reply.send({ technology: await technologiesService.updateTechnology(id, input) });
}

export async function deleteTechnology(request: FastifyRequest, reply: FastifyReply) {
  const { id } = parseParams(technologyIdParamsSchema, request.params);
  await technologiesService.deleteTechnology(id);
  return reply.status(204).send();
}

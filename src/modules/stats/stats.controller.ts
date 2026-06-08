import type { FastifyReply, FastifyRequest } from 'fastify';
import * as statsService from './stats.service';

export async function getStats(_request: FastifyRequest, reply: FastifyReply) {
  return reply.send(await statsService.getStats());
}

export async function getDashboardSummary(_request: FastifyRequest, reply: FastifyReply) {
  return reply.send({ summary: await statsService.getStats() });
}

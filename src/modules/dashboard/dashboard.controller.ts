import type { FastifyReply, FastifyRequest } from 'fastify';
import * as dashboardService from './dashboard.service';

export async function getSummary(_request: FastifyRequest, reply: FastifyReply) {
  return reply.send({ summary: await dashboardService.getSummary() });
}

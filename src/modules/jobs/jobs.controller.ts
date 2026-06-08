import type { FastifyReply, FastifyRequest } from 'fastify';
import { parseParams, parseQuery } from '../../shared/utils/validate';
import { jobIdParamsSchema, listJobsQuerySchema } from './jobs.schemas';
import * as jobsService from './jobs.service';

export async function listJobs(request: FastifyRequest, reply: FastifyReply) {
  const query = parseQuery(listJobsQuerySchema, request.query);
  return reply.send(await jobsService.listJobs(query));
}

export async function getJob(request: FastifyRequest, reply: FastifyReply) {
  const { id } = parseParams(jobIdParamsSchema, request.params);
  return reply.send({ job: await jobsService.getJob(id) });
}

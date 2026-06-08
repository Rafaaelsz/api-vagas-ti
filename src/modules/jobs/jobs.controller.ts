import type { FastifyReply, FastifyRequest } from 'fastify';
import { parseBody, parseParams, parseQuery } from '../../shared/utils/validate';
import { createJobSchema, jobIdParamsSchema, listJobsQuerySchema, updateJobSchema } from './jobs.schemas';
import * as jobsService from './jobs.service';

export async function listJobs(request: FastifyRequest, reply: FastifyReply) {
  const query = parseQuery(listJobsQuerySchema, request.query);
  return reply.send(await jobsService.listJobs(query));
}

export async function getJob(request: FastifyRequest, reply: FastifyReply) {
  const { id } = parseParams(jobIdParamsSchema, request.params);
  return reply.send({ job: await jobsService.getJob(id) });
}

export async function createJob(request: FastifyRequest, reply: FastifyReply) {
  const input = parseBody(createJobSchema, request.body);
  const job = await jobsService.createJob(request.user.id, request.user.role, input);
  return reply.status(201).send({ job });
}

export async function updateJob(request: FastifyRequest, reply: FastifyReply) {
  const { id } = parseParams(jobIdParamsSchema, request.params);
  const input = parseBody(updateJobSchema, request.body);
  const job = await jobsService.updateJob(id, request.user.id, request.user.role, input);
  return reply.send({ job });
}

export async function deleteJob(request: FastifyRequest, reply: FastifyReply) {
  const { id } = parseParams(jobIdParamsSchema, request.params);
  await jobsService.deleteJob(id, request.user.id, request.user.role);
  return reply.status(204).send();
}

export async function publishJob(request: FastifyRequest, reply: FastifyReply) {
  const { id } = parseParams(jobIdParamsSchema, request.params);
  return reply.send({ job: await jobsService.publishJob(id, request.user.id, request.user.role) });
}

export async function closeJob(request: FastifyRequest, reply: FastifyReply) {
  const { id } = parseParams(jobIdParamsSchema, request.params);
  return reply.send({ job: await jobsService.closeJob(id, request.user.id, request.user.role) });
}

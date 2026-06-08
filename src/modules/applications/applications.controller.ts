import type { FastifyReply, FastifyRequest } from 'fastify';
import { parseBody, parseParams } from '../../shared/utils/validate';
import {
  applicationIdParamsSchema,
  applyJobParamsSchema,
  applyJobSchema,
  updateApplicationStatusSchema,
} from './applications.schemas';
import * as applicationsService from './applications.service';

export async function listApplications(request: FastifyRequest, reply: FastifyReply) {
  return reply.send({ data: await applicationsService.listApplications(request.user.id, request.user.role) });
}

export async function getApplication(request: FastifyRequest, reply: FastifyReply) {
  const { id } = parseParams(applicationIdParamsSchema, request.params);
  return reply.send({ application: await applicationsService.getApplication(id, request.user.id, request.user.role) });
}

export async function applyToJob(request: FastifyRequest, reply: FastifyReply) {
  const { jobId } = parseParams(applyJobParamsSchema, request.params);
  const input = parseBody(applyJobSchema, request.body);
  const application = await applicationsService.applyToJob(jobId, request.user.id, request.user.role, input);
  return reply.status(201).send({ application });
}

export async function updateApplicationStatus(request: FastifyRequest, reply: FastifyReply) {
  const { id } = parseParams(applicationIdParamsSchema, request.params);
  const input = parseBody(updateApplicationStatusSchema, request.body);
  return reply.send({
    application: await applicationsService.updateApplicationStatus(id, request.user.id, request.user.role, input),
  });
}

export async function deleteApplication(request: FastifyRequest, reply: FastifyReply) {
  const { id } = parseParams(applicationIdParamsSchema, request.params);
  await applicationsService.deleteApplication(id, request.user.id, request.user.role);
  return reply.status(204).send();
}

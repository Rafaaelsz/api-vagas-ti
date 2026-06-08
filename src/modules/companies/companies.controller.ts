import type { FastifyReply, FastifyRequest } from 'fastify';
import { parseBody, parseParams } from '../../shared/utils/validate';
import { companyIdParamsSchema, createCompanySchema, updateCompanySchema } from './companies.schemas';
import * as companiesService from './companies.service';

export async function listCompanies(_request: FastifyRequest, reply: FastifyReply) {
  return reply.send({ data: await companiesService.listCompanies() });
}

export async function getCompany(request: FastifyRequest, reply: FastifyReply) {
  const { id } = parseParams(companyIdParamsSchema, request.params);
  return reply.send({ company: await companiesService.getCompany(id) });
}

export async function createCompany(request: FastifyRequest, reply: FastifyReply) {
  const input = parseBody(createCompanySchema, request.body);
  const company = await companiesService.createCompany(request.user.id, input);
  return reply.status(201).send({ company });
}

export async function updateCompany(request: FastifyRequest, reply: FastifyReply) {
  const { id } = parseParams(companyIdParamsSchema, request.params);
  const input = parseBody(updateCompanySchema, request.body);
  const company = await companiesService.updateCompany(id, request.user.id, request.user.role, input);
  return reply.send({ company });
}

export async function deleteCompany(request: FastifyRequest, reply: FastifyReply) {
  const { id } = parseParams(companyIdParamsSchema, request.params);
  await companiesService.deleteCompany(id, request.user.id, request.user.role);
  return reply.status(204).send();
}

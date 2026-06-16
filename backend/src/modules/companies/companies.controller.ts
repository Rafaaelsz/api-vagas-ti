import type { FastifyReply, FastifyRequest } from 'fastify';
import { parseParams, parseQuery } from '../../shared/utils/validate';
import {
  companyIdParamsSchema,
  listCompaniesQuerySchema,
} from './companies.schemas';
import * as companiesService from './companies.service';

export async function listCompanies(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const query = parseQuery(listCompaniesQuerySchema, request.query);
  return reply.send(await companiesService.listCompanies(query));
}

export async function getCompany(request: FastifyRequest, reply: FastifyReply) {
  const { id } = parseParams(companyIdParamsSchema, request.params);
  return reply.send({ company: await companiesService.getCompany(id) });
}

import type { FastifyError, FastifyReply, FastifyRequest } from 'fastify';
import { ZodError } from 'zod';
import { env } from '../config/env';
import { HttpError } from './http-error';

export function errorHandler(error: FastifyError, _request: FastifyRequest, reply: FastifyReply) {
  if (error instanceof ZodError) {
    return reply.status(400).send({
      error: 'ValidationError',
      message: 'Dados inválidos.',
      details: error.flatten(),
    });
  }

  if (error instanceof HttpError) {
    return reply.status(error.statusCode).send({
      error: 'HttpError',
      message: error.message,
    });
  }

  const statusCode = error.statusCode ?? 500;

  return reply.status(statusCode).send({
    error: statusCode >= 500 ? 'InternalServerError' : 'RequestError',
    message: statusCode >= 500 ? 'Erro interno do servidor.' : error.message,
    ...(env.NODE_ENV !== 'production' && statusCode >= 500 ? { stack: error.stack } : {}),
  });
}

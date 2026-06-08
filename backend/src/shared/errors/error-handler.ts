import type { FastifyError, FastifyReply, FastifyRequest } from 'fastify';
import { ZodError } from 'zod';
import { env } from '../config/env';
import { HttpError } from './http-error';

export function errorHandler(error: FastifyError, _request: FastifyRequest, reply: FastifyReply) {
  if (error instanceof ZodError) {
    return reply.status(400).send({
      error: {
        message: 'Parâmetros inválidos.',
        code: 'VALIDATION_ERROR',
        details: error.flatten(),
      },
    });
  }

  if (error instanceof HttpError) {
    return reply.status(error.statusCode).send({
      error: {
        message: error.message,
        code: error.code,
      },
    });
  }

  const statusCode = error.statusCode ?? 500;
  const isServerError = statusCode >= 500;

  return reply.status(statusCode).send({
    error: {
      message: isServerError ? 'Erro interno do servidor.' : error.message,
      code: isServerError ? 'INTERNAL_SERVER_ERROR' : 'REQUEST_ERROR',
      ...(env.NODE_ENV !== 'production' && isServerError ? { stack: error.stack } : {}),
    },
  });
}

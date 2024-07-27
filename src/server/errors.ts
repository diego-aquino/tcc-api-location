import { AxiosError } from 'axios';
import { FastifyError, FastifyRequest, FastifyReply } from 'fastify';
import { ZodError } from 'zod';

import app from '@/server/app';
import { LocationComponents } from '@/types/generated';

export class NotFoundError extends Error {}

export function handleServerError(error: FastifyError, _request: FastifyRequest, reply: FastifyReply) {
  if (error instanceof ZodError) {
    return reply.status(400).send({
      message: 'Validation error',
      issues: error.issues,
    } satisfies LocationComponents['schemas']['ValidationError']);
  }

  if (error instanceof NotFoundError) {
    return reply.status(404).send({
      message: error.message,
    } satisfies LocationComponents['schemas']['NotFoundError']);
  }

  if (error instanceof AxiosError) {
    const formattedError = {
      ...error.toJSON(),
      data: error.response?.data as unknown,
    };

    app.log.error({
      message: 'Request error',
      error: formattedError,
    });
  } else {
    app.log.error({
      message: 'Internal server error',
      error,
    });
  }

  return reply.status(500).send({
    message: 'Internal server error',
  } satisfies LocationComponents['schemas']['InternalServerError']);
}

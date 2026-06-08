import type { FastifyInstance } from 'fastify';
import { prisma } from '../../shared/database/prisma';
import { HttpError } from '../../shared/errors/http-error';
import { comparePassword, hashPassword } from '../../shared/utils/password';
import { sanitizeUser } from '../../shared/utils/sanitize';
import type { loginSchema, registerSchema } from './auth.schemas';
import type { z } from 'zod';

type RegisterInput = z.infer<typeof registerSchema>;
type LoginInput = z.infer<typeof loginSchema>;

export async function register(input: RegisterInput, app: FastifyInstance) {
  const existingUser = await prisma.user.findUnique({ where: { email: input.email } });

  if (existingUser) {
    throw new HttpError('E-mail já cadastrado.', 409);
  }

  const user = await prisma.user.create({
    data: {
      name: input.name,
      email: input.email,
      passwordHash: await hashPassword(input.password),
      role: input.role,
    },
  });

  const token = app.jwt.sign({ id: user.id, email: user.email, role: user.role });
  return { user: sanitizeUser(user), token };
}

export async function login(input: LoginInput, app: FastifyInstance) {
  const user = await prisma.user.findUnique({ where: { email: input.email } });

  if (!user || !(await comparePassword(input.password, user.passwordHash))) {
    throw new HttpError('Credenciais inválidas.', 401);
  }

  const token = app.jwt.sign({ id: user.id, email: user.email, role: user.role });
  return { user: sanitizeUser(user), token };
}

export async function me(userId: string) {
  const user = await prisma.user.findUniqueOrThrow({ where: { id: userId } });
  return sanitizeUser(user);
}

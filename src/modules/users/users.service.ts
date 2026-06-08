import type { z } from 'zod';
import { prisma } from '../../shared/database/prisma';
import { HttpError } from '../../shared/errors/http-error';
import { hashPassword } from '../../shared/utils/password';
import { sanitizeUser } from '../../shared/utils/sanitize';
import type { updateMeSchema } from './users.schemas';

type UpdateMeInput = z.infer<typeof updateMeSchema>;

export async function getMe(userId: string) {
  const user = await prisma.user.findUniqueOrThrow({ where: { id: userId } });
  return sanitizeUser(user);
}

export async function updateMe(userId: string, input: UpdateMeInput) {
  if (input.email) {
    const existingUser = await prisma.user.findUnique({ where: { email: input.email } });

    if (existingUser && existingUser.id !== userId) {
      throw new HttpError('E-mail já cadastrado por outro usuário.', 409);
    }
  }

  const user = await prisma.user.update({
    where: { id: userId },
    data: {
      name: input.name,
      email: input.email,
      passwordHash: input.password ? await hashPassword(input.password) : undefined,
    },
  });

  return sanitizeUser(user);
}

export async function deleteMe(userId: string) {
  await prisma.user.delete({ where: { id: userId } });
}

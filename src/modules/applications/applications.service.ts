import { ApplicationStatus, JobStatus, UserRole } from '@prisma/client';
import type { z } from 'zod';
import { prisma } from '../../shared/database/prisma';
import { HttpError } from '../../shared/errors/http-error';
import type { applyJobSchema, updateApplicationStatusSchema } from './applications.schemas';

type ApplyJobInput = z.infer<typeof applyJobSchema>;
type UpdateApplicationStatusInput = z.infer<typeof updateApplicationStatusSchema>;

const applicationInclude = {
  user: { select: { id: true, name: true, email: true, role: true } },
  job: {
    include: {
      company: true,
      technologies: { include: { technology: true } },
    },
  },
};

export function listApplications(userId: string, role: UserRole) {
  if (role === UserRole.ADMIN) {
    return prisma.application.findMany({
      orderBy: { createdAt: 'desc' },
      include: applicationInclude,
    });
  }

  if (role === UserRole.RECRUITER) {
    return prisma.application.findMany({
      where: { job: { company: { userId } } },
      orderBy: { createdAt: 'desc' },
      include: applicationInclude,
    });
  }

  return prisma.application.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    include: applicationInclude,
  });
}

export async function getApplication(id: string, userId: string, role: UserRole) {
  const application = await prisma.application.findUnique({
    where: { id },
    include: applicationInclude,
  });

  if (!application) {
    throw new HttpError('Candidatura não encontrada.', 404);
  }

  const canRead =
    role === UserRole.ADMIN ||
    application.userId === userId ||
    application.job.company.userId === userId;

  if (!canRead) {
    throw new HttpError('Você não tem permissão para acessar esta candidatura.', 403);
  }

  return application;
}

export async function applyToJob(jobId: string, userId: string, role: UserRole, input: ApplyJobInput) {
  if (role !== UserRole.CANDIDATE) {
    throw new HttpError('Apenas candidatos podem se candidatar a vagas.', 403);
  }

  const job = await prisma.job.findUnique({ where: { id: jobId } });

  if (!job) {
    throw new HttpError('Vaga não encontrada.', 404);
  }

  if (job.status !== JobStatus.PUBLISHED) {
    throw new HttpError('Apenas vagas publicadas aceitam candidaturas.', 422);
  }

  if (job.expiresAt && job.expiresAt < new Date()) {
    throw new HttpError('Esta vaga expirou e não aceita candidaturas.', 422);
  }

  const existingApplication = await prisma.application.findUnique({
    where: { jobId_userId: { jobId, userId } },
  });

  if (existingApplication) {
    throw new HttpError('Você já se candidatou a esta vaga.', 409);
  }

  return prisma.application.create({
    data: {
      jobId,
      userId,
      coverLetter: input.coverLetter,
    },
    include: applicationInclude,
  });
}

export async function updateApplicationStatus(id: string, userId: string, role: UserRole, input: UpdateApplicationStatusInput) {
  const application = await getApplication(id, userId, role);

  if (role !== UserRole.ADMIN && application.job.company.userId !== userId) {
    throw new HttpError('Apenas administradores ou recrutadores da empresa podem alterar o status.', 403);
  }

  if (input.status === ApplicationStatus.SENT && application.status !== ApplicationStatus.SENT) {
    throw new HttpError('Não é permitido voltar o status para SENT.', 422);
  }

  return prisma.application.update({
    where: { id },
    data: { status: input.status },
    include: applicationInclude,
  });
}

export async function deleteApplication(id: string, userId: string, role: UserRole) {
  const application = await getApplication(id, userId, role);

  const canDelete =
    role === UserRole.ADMIN ||
    application.userId === userId ||
    application.job.company.userId === userId;

  if (!canDelete) {
    throw new HttpError('Você não tem permissão para excluir esta candidatura.', 403);
  }

  await prisma.application.delete({ where: { id } });
}

import { Building2, CalendarDays, ExternalLink, MapPin, Wallet } from 'lucide-react';
import Link from 'next/link';
import { enumLabel, formatCurrencyRange, formatDate } from '@/lib/formatters';
import type { Job } from '@/types/api';
import { Badge } from '../ui/badge';
import { ButtonLink } from '../ui/button';
import { Card, CardContent } from '../ui/card';
import { JobStatusBadge } from './job-status-badge';

export function JobDetails({ job }: { job: Job }) {
  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
      <article className="rounded-lg border bg-card p-6 shadow-soft">
        <div className="flex flex-wrap gap-2">
          <JobStatusBadge status={job.status} />
          <Badge tone="blue">{enumLabel(job.workMode)}</Badge>
          <Badge tone="muted">{enumLabel(job.seniorityLevel)}</Badge>
        </div>

        <h1 className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">{job.title}</h1>
        <p className="mt-3 flex items-center gap-2 text-muted-foreground">
          <Building2 className="size-4 text-primary" aria-hidden />
          {job.company?.name ?? 'Empresa não informada'}
        </p>

        <div className="mt-6 grid gap-3 text-sm text-muted-foreground sm:grid-cols-2">
          <span className="flex items-center gap-2">
            <MapPin className="size-4 text-primary" aria-hidden />
            {job.location ?? 'Local não informado'}
          </span>
          <span className="flex items-center gap-2">
            <Wallet className="size-4 text-primary" aria-hidden />
            {formatCurrencyRange(job.salaryMin, job.salaryMax, job.currency)}
          </span>
          <span className="flex items-center gap-2">
            <CalendarDays className="size-4 text-primary" aria-hidden />
            Publicada em {formatDate(job.publishedAt ?? job.createdAt)}
          </span>
          <span className="flex items-center gap-2">
            <CalendarDays className="size-4 text-primary" aria-hidden />
            Expira em {formatDate(job.expiresAt)}
          </span>
        </div>

        {job.technologies?.length ? (
          <div className="mt-6 flex flex-wrap gap-2">
            {job.technologies.map(({ technology }) => (
              <Badge key={technology.id} tone="blue">
                {technology.name}
              </Badge>
            ))}
          </div>
        ) : null}

        <div className="mt-8 space-y-4">
          <h2 className="text-xl font-semibold">Descrição da vaga</h2>
          <p className="whitespace-pre-line leading-7 text-muted-foreground">{job.description}</p>
        </div>
      </article>

      <aside className="space-y-4">
        <Card>
          <CardContent className="space-y-4 p-5">
            <h2 className="text-lg font-semibold">Resumo</h2>
            <dl className="space-y-3 text-sm">
              <div className="flex justify-between gap-4">
                <dt className="text-muted-foreground">Contrato</dt>
                <dd className="font-medium">{enumLabel(job.contractType)}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-muted-foreground">Modalidade</dt>
                <dd className="font-medium">{enumLabel(job.workMode)}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-muted-foreground">Senioridade</dt>
                <dd className="font-medium">{enumLabel(job.seniorityLevel)}</dd>
              </div>
            </dl>
            {job.externalUrl ? (
              <ButtonLink href={job.externalUrl} variant="secondary" className="w-full" target="_blank">
                Acessar candidatura
                <ExternalLink className="size-4" aria-hidden />
              </ButtonLink>
            ) : (
              <ButtonLink href="/vagas" variant="secondary" className="w-full">
                Ver outras vagas
              </ButtonLink>
            )}
          </CardContent>
        </Card>

        {job.company ? (
          <Card>
            <CardContent className="space-y-3 p-5">
              <h2 className="text-lg font-semibold">Empresa</h2>
              <p className="text-sm text-muted-foreground">{job.company.description ?? 'Descrição não informada.'}</p>
              <Link className="text-sm font-medium text-primary hover:underline" href={`/empresas/${job.company.id}`}>
                Ver página da empresa
              </Link>
            </CardContent>
          </Card>
        ) : null}
      </aside>
    </div>
  );
}

import { Briefcase, CalendarDays, MapPin, Wallet } from 'lucide-react';
import { enumLabel, formatCurrencyRange, formatDate } from '@/lib/formatters';
import type { Job } from '@/types/api';
import { Badge } from '../ui/badge';
import { ButtonLink } from '../ui/button';
import { Card, CardContent } from '../ui/card';
import { JobStatusBadge } from './job-status-badge';

export function JobCard({ job }: { job: Job }) {
  const technologies = job.technologies?.map(({ technology }) => technology.name).slice(0, 5) ?? [];

  return (
    <Card className="transition hover:-translate-y-0.5 hover:border-primary/45">
      <CardContent className="p-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0 space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <JobStatusBadge status={job.status} />
              <span className="text-xs text-muted-foreground">
                <CalendarDays className="mr-1 inline size-3.5" aria-hidden />
                {formatDate(job.publishedAt ?? job.createdAt)}
              </span>
            </div>
            <h3 className="text-xl font-semibold leading-tight">{job.title}</h3>
            <p className="text-sm text-muted-foreground">{job.company?.name ?? 'Empresa não informada'}</p>
          </div>
          <ButtonLink href={`/vagas/${job.id}`} variant="outline" className="w-full sm:w-auto">
            Ver detalhes
          </ButtonLink>
        </div>

        <div className="mt-4 grid gap-2 text-sm text-muted-foreground sm:grid-cols-2 lg:grid-cols-4">
          <span className="flex items-center gap-2">
            <MapPin className="size-4 text-primary" aria-hidden />
            {job.location ?? 'Local não informado'}
          </span>
          <span className="flex items-center gap-2">
            <Briefcase className="size-4 text-primary" aria-hidden />
            {enumLabel(job.workMode)} · {enumLabel(job.contractType)}
          </span>
          <span className="flex items-center gap-2">
            <Briefcase className="size-4 text-primary" aria-hidden />
            {enumLabel(job.seniorityLevel)}
          </span>
          <span className="flex items-center gap-2">
            <Wallet className="size-4 text-primary" aria-hidden />
            {formatCurrencyRange(job.salaryMin, job.salaryMax, job.currency)}
          </span>
        </div>

        {technologies.length ? (
          <div className="mt-4 flex flex-wrap gap-2">
            {technologies.map((technology) => (
              <Badge key={technology} tone="blue">
                {technology}
              </Badge>
            ))}
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}

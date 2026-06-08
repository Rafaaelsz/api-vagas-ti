import { Building2, ExternalLink, MapPin } from 'lucide-react';
import Link from 'next/link';
import type { Company } from '@/types/api';
import { ButtonLink } from '../ui/button';
import { Card, CardContent } from '../ui/card';

export function CompanyCard({ company }: { company: Company }) {
  const totalJobs = company._count?.jobs ?? company.jobs?.filter((job) => job.status === 'PUBLISHED').length;

  return (
    <Card className="transition hover:-translate-y-0.5 hover:border-primary/45">
      <CardContent className="space-y-4 p-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <Building2 className="mb-3 size-7 text-primary" aria-hidden />
            <h3 className="text-xl font-semibold">{company.name}</h3>
          </div>
          {typeof totalJobs === 'number' ? (
            <span className="rounded-md bg-muted px-2.5 py-1 text-xs font-medium text-muted-foreground">
              {totalJobs} vagas
            </span>
          ) : null}
        </div>

        <p className="line-clamp-3 text-sm leading-6 text-muted-foreground">
          {company.description ?? 'Empresa cadastrada na plataforma de vagas de tecnologia.'}
        </p>

        <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
          <span className="inline-flex items-center gap-1.5">
            <MapPin className="size-4 text-primary" aria-hidden />
            {company.location ?? 'Local não informado'}
          </span>
          {company.website ? (
            <Link href={company.website} target="_blank" className="inline-flex items-center gap-1.5 text-primary hover:underline">
              Website
              <ExternalLink className="size-3.5" aria-hidden />
            </Link>
          ) : null}
        </div>

        <ButtonLink href={`/empresas/${company.id}`} variant="outline" className="w-full">
          Ver detalhes
        </ButtonLink>
      </CardContent>
    </Card>
  );
}

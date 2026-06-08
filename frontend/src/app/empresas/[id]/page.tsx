import type { Metadata } from 'next';
import { ExternalLink, MapPin } from 'lucide-react';
import Link from 'next/link';
import { JobList } from '@/components/jobs/job-list';
import { ErrorState } from '@/components/shared/error-state';
import { Card, CardContent } from '@/components/ui/card';
import { getCompanyById, getPublishedJobsByCompany } from '@/services/companies-service';

type PageProps = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;

  try {
    const company = await getCompanyById(id);
    return {
      title: company.name,
      description: `Detalhes da empresa ${company.name} e vagas de tecnologia vinculadas.`,
    };
  } catch {
    return {
      title: 'Empresa não encontrada',
    };
  }
}

export default async function CompanyDetailsPage({ params }: PageProps) {
  const { id } = await params;

  try {
    const [company, jobs] = await Promise.all([getCompanyById(id), getPublishedJobsByCompany(id)]);

    return (
      <section className="mx-auto grid max-w-7xl gap-6 px-4 py-10 sm:px-6 lg:px-8">
        <Card>
          <CardContent className="p-6">
            <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">{company.name}</h1>
            <p className="mt-4 max-w-3xl leading-7 text-muted-foreground">{company.description ?? 'Descrição não informada.'}</p>
            <div className="mt-5 flex flex-wrap gap-4 text-sm text-muted-foreground">
              <span className="inline-flex items-center gap-2">
                <MapPin className="size-4 text-primary" aria-hidden />
                {company.location ?? 'Local não informado'}
              </span>
              {company.website ? (
                <Link href={company.website} target="_blank" className="inline-flex items-center gap-2 text-primary hover:underline">
                  Website
                  <ExternalLink className="size-4" aria-hidden />
                </Link>
              ) : null}
            </div>
          </CardContent>
        </Card>

        <div>
          <h2 className="mb-4 text-2xl font-semibold">Vagas publicadas</h2>
          <JobList jobs={jobs} />
        </div>
      </section>
    );
  } catch (error) {
    return (
      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <ErrorState title="Não foi possível carregar a empresa." message={error instanceof Error ? error.message : undefined} />
      </section>
    );
  }
}

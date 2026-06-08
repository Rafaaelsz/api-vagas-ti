import type { Metadata } from 'next';
import { Search } from 'lucide-react';
import { CompanyList } from '@/components/companies/company-list';
import { ErrorState } from '@/components/shared/error-state';
import { ButtonLink } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { getCompanies } from '@/services/companies-service';

export const metadata: Metadata = {
  title: 'Empresas',
  description: 'Explore empresas com vagas de tecnologia cadastradas na plataforma.',
};

type PageProps = {
  searchParams: Promise<{ search?: string }>;
};

export default async function CompaniesPage({ searchParams }: PageProps) {
  const { search } = await searchParams;

  try {
    const companies = await getCompanies();
    const filteredCompanies = search
      ? companies.filter((company) => company.name.toLowerCase().includes(search.toLowerCase()))
      : companies;

    return (
      <section className="mx-auto grid max-w-7xl gap-6 px-4 py-10 sm:px-6 lg:px-8">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">Empresas</h1>
          <p className="mt-2 max-w-2xl text-muted-foreground">Explore empresas cadastradas e veja vagas vinculadas quando disponíveis.</p>
        </div>

        <form action="/empresas" className="flex flex-col gap-3 rounded-lg border bg-card p-4 sm:flex-row">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
            <Input name="search" defaultValue={search} placeholder="Buscar por nome da empresa" className="pl-9" />
          </div>
          <button className="inline-flex h-10 items-center justify-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground">
            Buscar
          </button>
          <ButtonLink href="/empresas" variant="outline">Limpar</ButtonLink>
        </form>

        <CompanyList companies={filteredCompanies} />
      </section>
    );
  } catch (error) {
    return (
      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <ErrorState message={error instanceof Error ? error.message : undefined} />
      </section>
    );
  }
}

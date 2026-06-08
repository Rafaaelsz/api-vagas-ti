import { ArrowRight, BarChart3, BriefcaseBusiness, Building2, Search, SlidersHorizontal } from 'lucide-react';
import Image from 'next/image';
import { JobCard } from '@/components/jobs/job-card';
import { EmptyState } from '@/components/shared/empty-state';
import { MetricCard } from '@/components/stats/metric-card';
import { Badge } from '@/components/ui/badge';
import { ButtonLink } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { getRecentJobs } from '@/services/jobs-service';
import { getStatsSummary } from '@/services/stats-service';

export default async function HomePage() {
  const [recentJobsResult, statsResult] = await Promise.allSettled([getRecentJobs(3), getStatsSummary()]);
  const recentJobs = recentJobsResult.status === 'fulfilled' ? recentJobsResult.value.data : [];
  const stats = statsResult.status === 'fulfilled' ? statsResult.value : null;

  return (
    <>
      <section className="relative min-h-[620px] overflow-hidden">
        <Image src="/images/jobs-hero.png" alt="" fill priority className="object-cover" sizes="100vw" />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(5,20,25,0.88),rgba(5,20,25,0.58),rgba(5,20,25,0.18))]" />
        <div className="relative mx-auto flex min-h-[620px] max-w-7xl items-center px-4 py-16 sm:px-6 lg:px-8">
          <div className="max-w-3xl text-white">
            <Badge className="bg-white/12 text-white ring-white/20">Busca pública de vagas de tecnologia</Badge>
            <h1 className="mt-5 max-w-2xl text-balance text-4xl font-semibold tracking-tight sm:text-6xl">
              Encontre vagas de tecnologia com filtros que poupam tempo.
            </h1>
            <p className="mt-5 max-w-2xl text-lg leading-8 text-white/82">
              Busque por cargo, tecnologia, empresa, modalidade, senioridade, contrato, localização e faixa salarial.
            </p>

            <form action="/vagas" className="mt-8 flex max-w-2xl flex-col gap-3 rounded-lg bg-white p-2 shadow-soft sm:flex-row">
              <div className="relative flex-1">
                <Search className="pointer-events-none absolute left-3 top-1/2 size-5 -translate-y-1/2 text-slate-500" aria-hidden />
                <Input name="search" placeholder="Ex.: Node.js, React, Backend..." className="h-12 border-0 pl-10 text-slate-950 focus:ring-0" />
              </div>
              <button className="inline-flex h-12 items-center justify-center gap-2 rounded-md bg-primary px-5 font-medium text-primary-foreground transition hover:bg-primary/90">
                Buscar vagas
                <ArrowRight className="size-4" aria-hidden />
              </button>
            </form>
          </div>
        </div>
      </section>

      <section className="mx-auto -mt-10 grid max-w-7xl gap-4 px-4 pb-14 sm:px-6 md:grid-cols-3 lg:px-8">
        <MetricCard label="Vagas publicadas" value={stats?.totalPublishedJobs ?? '—'} icon={<BriefcaseBusiness className="size-5" aria-hidden />} />
        <MetricCard label="Empresas" value={stats?.totalCompanies ?? '—'} icon={<Building2 className="size-5" aria-hidden />} />
        <MetricCard label="Tecnologias" value={stats?.totalTechnologies ?? stats?.topTechnologies.length ?? '—'} icon={<BarChart3 className="size-5" aria-hidden />} />
      </section>

      <section className="mx-auto grid max-w-7xl gap-6 px-4 pb-16 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-3xl font-semibold tracking-tight">Vagas recentes</h2>
            <p className="mt-2 text-muted-foreground">Oportunidades publicadas mais recentemente na API.</p>
          </div>
          <ButtonLink href="/vagas" variant="outline">
            Ver todas
            <ArrowRight className="size-4" aria-hidden />
          </ButtonLink>
        </div>

        {recentJobs.length ? (
          <div className="grid gap-4">
            {recentJobs.map((job) => (
              <JobCard key={job.id} job={job} />
            ))}
          </div>
        ) : (
          <EmptyState title="Nenhuma vaga publicada ainda." message="Quando o backend tiver vagas publicadas, elas aparecerão aqui." />
        )}
      </section>

      <section className="border-y bg-card">
        <div className="mx-auto grid max-w-7xl gap-4 px-4 py-14 sm:px-6 md:grid-cols-3 lg:px-8">
          {[
            ['Busca textual', 'Procure por título, descrição, empresa ou palavras-chave relacionadas à vaga.'],
            ['Filtros avançados', 'Combine tecnologia, modalidade, contrato, senioridade, localização e salário.'],
            ['Exploração pública', 'Veja empresas, estatísticas e detalhes sem login ou área administrativa.'],
          ].map(([title, description]) => (
            <Card key={title} className="shadow-none">
              <CardContent className="p-5">
                <SlidersHorizontal className="mb-4 size-7 text-primary" aria-hidden />
                <h3 className="text-lg font-semibold">{title}</h3>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">{description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    </>
  );
}

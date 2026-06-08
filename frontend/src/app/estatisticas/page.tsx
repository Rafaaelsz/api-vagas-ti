import type { Metadata } from 'next';
import { BarChart3, BriefcaseBusiness, Building2, Cpu } from 'lucide-react';
import { ErrorState } from '@/components/shared/error-state';
import { StatsCharts } from '@/components/stats/charts';
import { MetricCard } from '@/components/stats/metric-card';
import { Badge } from '@/components/ui/badge';
import { getStatsSummary } from '@/services/stats-service';

export const metadata: Metadata = {
  title: 'Estatísticas',
  description: 'Estatísticas públicas das vagas de tecnologia disponíveis na plataforma.',
};

export default async function StatsPage() {
  try {
    const summary = await getStatsSummary();

    return (
      <section className="mx-auto grid max-w-7xl gap-6 px-4 py-10 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">Estatísticas públicas</h1>
            <p className="mt-2 max-w-2xl text-muted-foreground">
              Visão geral das vagas disponíveis, tecnologias mais pedidas e distribuição por modalidade.
            </p>
          </div>
          <Badge tone={summary.source === 'dashboard' ? 'success' : 'muted'}>
            Fonte: {summary.source === 'dashboard' ? 'dashboard da API' : 'endpoints públicos'}
          </Badge>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <MetricCard label="Vagas publicadas" value={summary.totalPublishedJobs} icon={<BriefcaseBusiness className="size-5" aria-hidden />} />
          <MetricCard label="Total de empresas" value={summary.totalCompanies} icon={<Building2 className="size-5" aria-hidden />} />
          <MetricCard label="Tecnologias" value={summary.totalTechnologies ?? summary.topTechnologies.length} icon={<Cpu className="size-5" aria-hidden />} />
          <MetricCard label="Vagas analisadas" value={summary.totalJobs} icon={<BarChart3 className="size-5" aria-hidden />} />
        </div>

        <StatsCharts summary={summary} />
      </section>
    );
  } catch (error) {
    return (
      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <ErrorState title="Não foi possível carregar as estatísticas." message={error instanceof Error ? error.message : undefined} />
      </section>
    );
  }
}

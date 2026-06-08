import type { Metadata } from 'next';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';

export const metadata: Metadata = {
  title: 'Sobre',
  description: 'Conheça o projeto Vagas TI, uma aplicação full stack de portfólio para descoberta de vagas de tecnologia.',
};

export default function AboutPage() {
  return (
    <section className="mx-auto grid max-w-5xl gap-6 px-4 py-10 sm:px-6 lg:px-8">
      <div>
        <Badge>Projeto de portfólio full stack</Badge>
        <h1 className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">Uma vitrine pública para vagas de tecnologia.</h1>
        <p className="mt-4 max-w-3xl leading-7 text-muted-foreground">
          O Vagas TI conecta uma API REST de vagas a uma interface web pública, responsiva e focada em descoberta. A proposta é demonstrar domínio de backend, consumo de APIs, filtros, páginas dinâmicas e visualização de dados.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardContent className="p-5">
            <h2 className="text-xl font-semibold">Problema resolvido</h2>
            <p className="mt-3 leading-7 text-muted-foreground">
              Encontrar vagas úteis exige busca, filtros e contexto. A interface organiza cargos, empresas, tecnologias, modalidade, contrato e senioridade sem exigir autenticação.
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <h2 className="text-xl font-semibold">Stack usada</h2>
            <p className="mt-3 leading-7 text-muted-foreground">
              Next.js App Router, React, TypeScript, Tailwind CSS, componentes no estilo shadcn/ui, Lucide React, Recharts e integração REST centralizada.
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="p-5">
          <h2 className="text-xl font-semibold">Melhorias futuras</h2>
          <ul className="mt-3 grid gap-2 text-muted-foreground">
            <li>Busca full-text com ranking de relevância no backend.</li>
            <li>Endpoint público dedicado para estatísticas.</li>
            <li>Campo de URL externa de candidatura por vaga.</li>
            <li>Favoritos locais sem login e alertas por tecnologia.</li>
            <li>Testes end-to-end com Playwright.</li>
          </ul>
        </CardContent>
      </Card>
    </section>
  );
}

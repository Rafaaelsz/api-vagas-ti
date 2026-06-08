import { Github } from 'lucide-react';
import Link from 'next/link';

export function SiteFooter() {
  return (
    <footer className="border-t bg-card">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 sm:px-6 md:grid-cols-[1.4fr_1fr_1fr] lg:px-8">
        <div>
          <p className="font-semibold">Vagas TI</p>
          <p className="mt-2 max-w-md text-sm leading-6 text-muted-foreground">
            Interface pública para descobrir vagas de tecnologia consumindo uma API REST com Fastify, Prisma e PostgreSQL.
          </p>
        </div>
        <div>
          <p className="text-sm font-semibold">Navegação</p>
          <div className="mt-3 grid gap-2 text-sm text-muted-foreground">
            <Link href="/vagas" className="hover:text-foreground">Vagas</Link>
            <Link href="/empresas" className="hover:text-foreground">Empresas</Link>
            <Link href="/estatisticas" className="hover:text-foreground">Estatísticas</Link>
          </div>
        </div>
        <div>
          <p className="text-sm font-semibold">Portfólio</p>
          <p className="mt-3 text-sm text-muted-foreground">Projeto full stack para demonstrar backend, integração REST e UI pública responsiva.</p>
          <Link href="https://github.com/" target="_blank" className="mt-3 inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline">
            <Github className="size-4" aria-hidden />
            GitHub
          </Link>
        </div>
      </div>
    </footer>
  );
}

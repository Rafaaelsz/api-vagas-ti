import { ButtonLink } from '@/components/ui/button';

export default function NotFound() {
  return (
    <section className="mx-auto grid min-h-[60vh] max-w-3xl place-items-center px-4 py-16 text-center">
      <div>
        <p className="text-sm font-semibold text-primary">404</p>
        <h1 className="mt-3 text-3xl font-semibold">Página não encontrada</h1>
        <p className="mt-3 text-muted-foreground">A rota acessada não existe ou foi movida.</p>
        <ButtonLink href="/vagas" className="mt-6">
          Ver vagas disponíveis
        </ButtonLink>
      </div>
    </section>
  );
}

import { SearchX } from 'lucide-react';
import { ButtonLink } from '../ui/button';

export function EmptyState({
  title = 'Nenhum resultado encontrado.',
  message = 'Ajuste os filtros ou limpe a busca para ver mais vagas.',
  clearHref,
}: {
  title?: string;
  message?: string;
  clearHref?: string;
}) {
  return (
    <div className="rounded-lg border bg-card p-8 text-center">
      <SearchX className="mx-auto mb-3 size-9 text-primary" aria-hidden />
      <h2 className="text-lg font-semibold">{title}</h2>
      <p className="mx-auto mt-2 max-w-xl text-sm text-muted-foreground">{message}</p>
      {clearHref ? (
        <ButtonLink href={clearHref} variant="outline" className="mt-5">
          Limpar filtros
        </ButtonLink>
      ) : null}
    </div>
  );
}

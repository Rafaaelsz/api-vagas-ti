import { ChevronLeft, ChevronRight } from 'lucide-react';
import { ButtonLink } from '../ui/button';

export function Pagination({
  page,
  totalPages,
  buildHref,
}: {
  page: number;
  totalPages: number;
  buildHref: (page: number) => string;
}) {
  if (totalPages <= 1) return null;

  return (
    <nav className="flex items-center justify-between gap-3" aria-label="Paginação">
      <ButtonLink href={buildHref(Math.max(1, page - 1))} variant="outline" className={page <= 1 ? 'pointer-events-none opacity-50' : ''}>
        <ChevronLeft className="size-4" aria-hidden />
        Anterior
      </ButtonLink>
      <span className="text-sm text-muted-foreground">
        Página {page} de {totalPages}
      </span>
      <ButtonLink
        href={buildHref(Math.min(totalPages, page + 1))}
        variant="outline"
        className={page >= totalPages ? 'pointer-events-none opacity-50' : ''}
      >
        Próxima
        <ChevronRight className="size-4" aria-hidden />
      </ButtonLink>
    </nav>
  );
}

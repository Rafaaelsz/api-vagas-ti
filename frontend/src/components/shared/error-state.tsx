import { AlertCircle } from 'lucide-react';
import { ButtonLink } from '../ui/button';

export function ErrorState({ title = 'Não foi possível carregar os dados.', message }: { title?: string; message?: string }) {
  return (
    <div className="rounded-lg border bg-card p-6 text-center">
      <AlertCircle className="mx-auto mb-3 size-8 text-secondary" aria-hidden />
      <h2 className="text-lg font-semibold">{title}</h2>
      <p className="mx-auto mt-2 max-w-xl text-sm text-muted-foreground">
        {message ?? 'Verifique se a API está rodando e tente novamente.'}
      </p>
      <ButtonLink href="/" variant="outline" className="mt-5">
        Voltar ao início
      </ButtonLink>
    </div>
  );
}

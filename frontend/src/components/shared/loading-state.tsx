import { Loader2 } from 'lucide-react';

export function LoadingState({ label = 'Carregando dados...' }: { label?: string }) {
  return (
    <div className="flex min-h-64 items-center justify-center rounded-lg border bg-card p-8 text-muted-foreground">
      <Loader2 className="mr-2 size-5 animate-spin" aria-hidden />
      <span>{label}</span>
    </div>
  );
}

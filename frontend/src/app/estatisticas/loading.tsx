import { LoadingState } from '@/components/shared/loading-state';

export default function Loading() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <LoadingState label="Carregando estatísticas..." />
    </section>
  );
}

import type { Company } from '@/types/api';
import { EmptyState } from '../shared/empty-state';
import { CompanyCard } from './company-card';

export function CompanyList({ companies }: { companies: Company[] }) {
  if (!companies.length) {
    return <EmptyState title="Nenhuma empresa encontrada." message="Tente buscar por outro nome ou volte para a lista completa." clearHref="/empresas" />;
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {companies.map((company) => (
        <CompanyCard key={company.id} company={company} />
      ))}
    </div>
  );
}

import { Search, SlidersHorizontal, X } from 'lucide-react';
import { contractTypeOptions, seniorityOptions, sortOptions, workModeOptions } from '@/lib/constants';
import { ButtonLink } from '../ui/button';
import { Input } from '../ui/input';
import { Select } from '../ui/select';

export function JobFilters({ values }: { values: Record<string, string | undefined> }) {
  const [sortBy = 'createdAt', order = 'desc'] = (values.sort ?? 'createdAt:desc').split(':');

  return (
    <form action="/vagas" className="rounded-lg border bg-card p-4 shadow-soft">
      <div className="flex items-center gap-2 text-sm font-semibold">
        <SlidersHorizontal className="size-4 text-primary" aria-hidden />
        Buscar e filtrar
      </div>

      <input type="hidden" name="page" value="1" />
      <input type="hidden" name="sortBy" value={sortBy} />
      <input type="hidden" name="order" value={order} />

      <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        <label className="space-y-1.5 md:col-span-2">
          <span className="text-xs font-medium text-muted-foreground">Busca</span>
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
            <Input name="search" defaultValue={values.search} placeholder="Cargo, empresa, tecnologia..." className="pl-9" />
          </div>
        </label>

        <label className="space-y-1.5">
          <span className="text-xs font-medium text-muted-foreground">Tecnologia</span>
          <Input name="technology" defaultValue={values.technology} placeholder="React, Node, Java..." />
        </label>

        <label className="space-y-1.5">
          <span className="text-xs font-medium text-muted-foreground">Localização</span>
          <Input name="location" defaultValue={values.location} placeholder="Remoto, São Paulo..." />
        </label>

        <label className="space-y-1.5">
          <span className="text-xs font-medium text-muted-foreground">Modalidade</span>
          <Select name="workMode" defaultValue={values.workMode ?? ''}>
            <option value="">Todas</option>
            {workModeOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </Select>
        </label>

        <label className="space-y-1.5">
          <span className="text-xs font-medium text-muted-foreground">Senioridade</span>
          <Select name="seniorityLevel" defaultValue={values.seniorityLevel ?? ''}>
            <option value="">Todas</option>
            {seniorityOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </Select>
        </label>

        <label className="space-y-1.5">
          <span className="text-xs font-medium text-muted-foreground">Contrato</span>
          <Select name="contractType" defaultValue={values.contractType ?? ''}>
            <option value="">Todos</option>
            {contractTypeOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </Select>
        </label>

        <label className="space-y-1.5">
          <span className="text-xs font-medium text-muted-foreground">Ordenação</span>
          <Select name="sort" defaultValue={values.sort ?? 'createdAt:desc'}>
            {sortOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </Select>
        </label>

        <label className="space-y-1.5">
          <span className="text-xs font-medium text-muted-foreground">Salário mínimo</span>
          <Input type="number" min="0" name="salaryMin" defaultValue={values.salaryMin} placeholder="3000" />
        </label>

        <label className="space-y-1.5">
          <span className="text-xs font-medium text-muted-foreground">Salário máximo</span>
          <Input type="number" min="0" name="salaryMax" defaultValue={values.salaryMax} placeholder="12000" />
        </label>
      </div>

      <div className="mt-4 flex flex-col gap-2 sm:flex-row">
        <button className="inline-flex h-10 items-center justify-center gap-2 rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground transition hover:bg-primary/90">
          <Search className="size-4" aria-hidden />
          Aplicar filtros
        </button>
        <ButtonLink href="/vagas" variant="outline">
          <X className="size-4" aria-hidden />
          Limpar filtros
        </ButtonLink>
      </div>
    </form>
  );
}

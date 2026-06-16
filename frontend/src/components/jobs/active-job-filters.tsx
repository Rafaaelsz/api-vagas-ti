import { CheckCircle2, X } from 'lucide-react';
import Link from 'next/link';
import {
  contractTypeOptions,
  seniorityOptions,
  sortOptions,
  workModeOptions,
} from '@/lib/constants';
import type { JobsQuery } from '@/types/api';
import { ButtonLink } from '../ui/button';

type FilterKey =
  | 'search'
  | 'technology'
  | 'company'
  | 'location'
  | 'workMode'
  | 'contractType'
  | 'seniorityLevel'
  | 'salaryMin'
  | 'salaryMax'
  | 'sort';

type ActiveFilter = {
  key: FilterKey;
  label: string;
  value: string;
};

const optionLabels = {
  workMode: new Map(
    workModeOptions.map((option) => [option.value, option.label]),
  ),
  contractType: new Map(
    contractTypeOptions.map((option) => [option.value, option.label]),
  ),
  seniorityLevel: new Map(
    seniorityOptions.map((option) => [option.value, option.label]),
  ),
  sort: new Map(sortOptions.map((option) => [option.value, option.label])),
};

function hasValue(value: unknown) {
  return value !== undefined && value !== null && String(value).trim() !== '';
}

function getActiveFilters(
  query: JobsQuery & { sort?: string },
): ActiveFilter[] {
  const filters: ActiveFilter[] = [];

  if (hasValue(query.search))
    filters.push({
      key: 'search',
      label: 'Busca',
      value: String(query.search),
    });
  if (hasValue(query.technology))
    filters.push({
      key: 'technology',
      label: 'Tecnologia',
      value: String(query.technology),
    });
  if (hasValue(query.company))
    filters.push({
      key: 'company',
      label: 'Empresa',
      value: String(query.company),
    });
  if (hasValue(query.location))
    filters.push({
      key: 'location',
      label: 'Localização',
      value: String(query.location),
    });
  if (hasValue(query.workMode))
    filters.push({
      key: 'workMode',
      label: 'Modalidade',
      value:
        optionLabels.workMode.get(String(query.workMode)) ??
        String(query.workMode),
    });
  if (hasValue(query.contractType)) {
    filters.push({
      key: 'contractType',
      label: 'Contrato',
      value:
        optionLabels.contractType.get(String(query.contractType)) ??
        String(query.contractType),
    });
  }
  if (hasValue(query.seniorityLevel)) {
    filters.push({
      key: 'seniorityLevel',
      label: 'Senioridade',
      value:
        optionLabels.seniorityLevel.get(String(query.seniorityLevel)) ??
        String(query.seniorityLevel),
    });
  }
  if (hasValue(query.salaryMin))
    filters.push({
      key: 'salaryMin',
      label: 'Salário mínimo',
      value: `R$ ${Number(query.salaryMin).toLocaleString('pt-BR')}`,
    });
  if (hasValue(query.salaryMax))
    filters.push({
      key: 'salaryMax',
      label: 'Salário máximo',
      value: `R$ ${Number(query.salaryMax).toLocaleString('pt-BR')}`,
    });
  if (hasValue(query.sort) && query.sort !== 'recent') {
    filters.push({
      key: 'sort',
      label: 'Ordenação',
      value: optionLabels.sort.get(String(query.sort)) ?? String(query.sort),
    });
  }

  return filters;
}

function buildHrefWithoutFilter(
  query: JobsQuery & { sort?: string },
  keyToRemove: FilterKey,
) {
  const params = new URLSearchParams();

  Object.entries({ ...query, page: 1 }).forEach(([key, value]) => {
    if (key === keyToRemove) return;
    if (value !== undefined && String(value).trim() !== '')
      params.set(key, String(value));
  });

  return `/vagas?${params.toString()}`;
}

export function ActiveJobFilters({
  query,
  total,
}: {
  query: JobsQuery & { sort?: string };
  total: number;
}) {
  const filters = getActiveFilters(query);

  if (!filters.length) {
    return (
      <div className="flex flex-col gap-2 rounded-lg border bg-card px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <CheckCircle2 className="size-4 text-primary" aria-hidden />
          Nenhum filtro aplicado
        </div>
        <p className="text-sm text-muted-foreground">
          {total} vaga{total === 1 ? '' : 's'} encontrada
          {total === 1 ? '' : 's'}
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border bg-card px-4 py-3">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-sm font-medium">
            {filters.length} filtro{filters.length === 1 ? '' : 's'} aplicado
            {filters.length === 1 ? '' : 's'}
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            {total} vaga{total === 1 ? '' : 's'} encontrada
            {total === 1 ? '' : 's'} com estes critérios
          </p>
        </div>

        <ButtonLink href="/vagas" variant="outline" size="sm">
          <X className="size-4" aria-hidden />
          Limpar filtros
        </ButtonLink>
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        {filters.map((filter) => (
          <Link
            key={filter.key}
            href={buildHrefWithoutFilter(query, filter.key)}
            className="inline-flex min-h-8 items-center gap-2 rounded-md border bg-background px-2.5 text-sm transition hover:bg-muted"
            title={`Remover filtro ${filter.label}`}
          >
            <span className="text-muted-foreground">{filter.label}:</span>
            <span className="font-medium">{filter.value}</span>
            <X className="size-3.5 text-muted-foreground" aria-hidden />
          </Link>
        ))}
      </div>
    </div>
  );
}

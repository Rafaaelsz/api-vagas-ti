export function formatCurrencyRange(salaryMin?: number | null, salaryMax?: number | null, currency = 'BRL') {
  const formatter = new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  });

  if (salaryMin && salaryMax) return `${formatter.format(salaryMin)} - ${formatter.format(salaryMax)}`;
  if (salaryMin) return `A partir de ${formatter.format(salaryMin)}`;
  if (salaryMax) return `Até ${formatter.format(salaryMax)}`;
  return 'Salário não informado';
}

export function formatDate(date?: string | null) {
  if (!date) return 'Data não informada';

  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(new Date(date));
}

export function enumLabel(value?: string | null) {
  if (!value) return 'Não informado';

  const labels: Record<string, string> = {
    REMOTE: 'Remoto',
    HYBRID: 'Híbrido',
    ONSITE: 'Presencial',
    CLT: 'CLT',
    PJ: 'PJ',
    INTERNSHIP: 'Estágio',
    FREELANCE: 'Freelance',
    TEMPORARY: 'Temporário',
    INTERN: 'Estágio',
    JUNIOR: 'Júnior',
    MID_LEVEL: 'Pleno',
    SENIOR: 'Sênior',
    SPECIALIST: 'Especialista',
    LEAD: 'Lead',
    DRAFT: 'Rascunho',
    PUBLISHED: 'Publicada',
    CLOSED: 'Encerrada',
    EXPIRED: 'Expirada',
  };

  return labels[value] ?? value;
}

# Vagas TI Frontend

Interface pública para busca, filtro e exploração de vagas de tecnologia consumindo a API REST do projeto API de Vagas de TI.

## Objetivo

Criar uma experiência pública, sem autenticação, para que qualquer pessoa encontre vagas de tecnologia por cargo, empresa, tecnologia, modalidade, contrato, senioridade, localização e faixa salarial.

## Stack

- Next.js com App Router
- React e TypeScript
- Tailwind CSS
- Componentes locais inspirados em shadcn/ui
- Lucide React para ícones
- Recharts para gráficos
- Fetch API centralizada

## Configuração

Copie o arquivo de ambiente:

```bash
cp .env.example .env.local
```

Configure a URL da API:

```env
NEXT_PUBLIC_API_URL=http://localhost:3333
```

## Como Rodar

Na pasta `frontend`:

```bash
npm install
npm run dev
```

Acesse:

```txt
http://localhost:3000
```

## Rotas

- `/`: landing page pública com busca, métricas e vagas recentes
- `/vagas`: listagem com busca, filtros e paginação
- `/vagas/[id]`: detalhes da vaga
- `/empresas`: listagem e busca de empresas
- `/empresas/[id]`: detalhes da empresa e vagas vinculadas
- `/estatisticas`: gráficos e métricas públicas
- `/sobre`: explicação do projeto

## Integração com a API

Serviços criados:

- `src/services/jobs-service.ts`
- `src/services/companies-service.ts`
- `src/services/technologies-service.ts`
- `src/services/stats-service.ts`

Endpoints integrados:

- `GET /jobs`
- `GET /jobs/:id`
- `GET /companies`
- `GET /companies/:id`
- `GET /technologies`
- `GET /dashboard/summary`

Como o backend atual protege `/dashboard/summary`, a página `/estatisticas` tenta esse endpoint e, quando recebe `401`, `403` ou `404`, calcula estatísticas públicas a partir de `/jobs`, `/companies` e `/technologies`.

## Estrutura

```txt
src/
  app/
    vagas/
    empresas/
    estatisticas/
    sobre/
  components/
    companies/
    jobs/
    layout/
    shared/
    stats/
    ui/
  lib/
  services/
  types/
```

## Funcionalidades

- Busca textual de vagas
- Filtros por tecnologia, modalidade, contrato, senioridade, localização e salário
- Ordenação por data, salário ou título
- Paginação
- Cards responsivos de vagas e empresas
- Página de detalhes
- Estados de loading, erro e vazio
- Tema claro/escuro
- Gráficos responsivos com Recharts

## Validação

```bash
npm run lint
npm run build
```

## Melhorias Futuras

- Endpoint público dedicado para estatísticas
- Campo `applicationUrl` nas vagas
- Busca por empresa diretamente no endpoint `/jobs`
- Favoritos salvos localmente
- Testes end-to-end com Playwright

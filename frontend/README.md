# Vagas TI Frontend

Interface publica para busca, filtro e exploracao de vagas de tecnologia consumindo a API REST do projeto.

## Objetivo

Criar uma experiencia publica, sem autenticacao, para que qualquer pessoa encontre vagas de tecnologia por cargo, empresa, tecnologia, modalidade, contrato, senioridade, localizacao e faixa salarial.

## Stack

- Next.js com App Router
- React e TypeScript
- Tailwind CSS
- Componentes locais inspirados em shadcn/ui
- Lucide React
- Recharts
- Fetch API centralizada

## Configuracao

```bash
cp .env.example .env.local
```

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

- `/`: landing page publica com busca, metricas e vagas recentes
- `/vagas`: listagem com busca, filtros e paginacao
- `/vagas/[id]`: detalhes da vaga
- `/empresas`: listagem e busca de empresas
- `/empresas/[id]`: detalhes da empresa e vagas vinculadas
- `/estatisticas`: graficos e metricas publicas
- `/sobre`: explicacao do projeto

## Integracao Com A API

Servicos criados:

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
- `GET /stats`
- `GET /dashboard/summary`

A pagina `/estatisticas` consome estatisticas publicas da API. Caso algum endpoint de resumo esteja indisponivel em outro ambiente, o frontend mantem fallback calculado a partir de endpoints publicos.

## Estrutura

```txt
src/
  app/
  components/
  lib/
  services/
  types/
```

## Funcionalidades

- Busca textual de vagas
- Filtros por tecnologia, modalidade, contrato, senioridade, localizacao e salario
- Ordenacao por data, salario ou titulo
- Paginacao
- Cards responsivos de vagas e empresas
- Pagina de detalhes
- Estados de loading, erro e vazio
- Tema claro/escuro
- Graficos responsivos com Recharts

## Validacao

```bash
npm run lint
npm run build
```

## Melhorias Futuras

- Mais fontes reais de ingestao autorizada
- Campo `applicationUrl` nas vagas
- Busca por empresa diretamente no endpoint `/jobs`
- Favoritos salvos localmente
- Testes end-to-end com Playwright

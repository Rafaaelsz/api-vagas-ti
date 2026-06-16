# Finder de Vagas de TI

Projeto full stack para busca publica de vagas de tecnologia.

A arquitetura agora esta separada em duas aplicacoes:

```txt
api-vagas/
  backend/   API REST com Fastify, Prisma e PostgreSQL
  frontend/  Interface publica com Next.js, React e Tailwind CSS
```

Nao ha fluxo de autenticacao, dashboard privado, login, cadastro ou area administrativa. A aplicacao e publica e focada em descoberta de vagas.

## Funcionalidades

- Listagem publica de vagas com busca textual.
- Filtros por tecnologia, empresa, modalidade, senioridade, contrato, localizacao e salario.
- Paginacao em vagas e empresas.
- Detalhes de vagas com empresa, tecnologias e link externo de candidatura.
- Listagem e detalhes de empresas.
- Listagem de tecnologias.
- Estatisticas publicas para dashboard.
- Match score simples por tecnologias conhecidas pelo candidato.
- Seed/ingestao por fontes publicas oficiais como Greenhouse e Lever.
- Swagger em `/docs`.

## Stack

Backend:

- Node.js
- Fastify
- TypeScript
- Prisma
- PostgreSQL
- Zod
- Vitest

Frontend:

- Next.js App Router
- React
- TypeScript
- Tailwind CSS
- Recharts
- Lucide React

Infra:

- Docker Compose
- Postgres
- Adminer

## Estrutura

```txt
backend/
  src/
    modules/
    shared/
    app.ts
    server.ts
  prisma/
  scripts/
  config/
  data/
  tests/
  Dockerfile
  package.json

frontend/
  src/
    app/
    components/
    lib/
    services/
    types/
  public/
  package.json

docker-compose.yml
README.md
```

## Rodar Com Docker

Na raiz do projeto:

```bash
docker compose up -d --build
```

Servicos do Compose:

- API: `http://localhost:3333`
- Swagger: `http://localhost:3333/docs`
- Adminer: `http://localhost:8080`
- PostgreSQL: `localhost:5432`

O frontend nao esta no `docker-compose.yml` atual. Para usar a interface, rode o frontend localmente em outro terminal com os comandos da secao "Frontend Local".

Comandos uteis:

```bash
docker compose logs -f api
docker compose exec api npm run ingest:prod
docker compose exec api npx prisma migrate deploy
docker compose down
```

Se o comando falhar com erro de conexao ao Docker, verifique se o Docker Desktop esta aberto e se a engine esta em execucao.

## Backend Local

```bash
cd backend
npm install
cp .env.example .env
npm run prisma:migrate
npm run dev
```

Principais scripts:

```bash
npm run dev
npm run build
npm run start
npm run lint
npm run test
npm run prisma:generate
npm run prisma:migrate
npm run prisma:seed
npm run ingest
```

Variaveis principais em `backend/.env`:

```env
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/jobs_api?schema=public
TEST_DATABASE_URL=postgresql://postgres:postgres@localhost:5432/api_vagas_test?schema=public
PORT=3333
HOST=127.0.0.1
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
INGESTION_CONFIG_PATH=config/ingestion-sources.example.json
PRISMA_QUERY_LOG=false
```

## Frontend Local

```bash
cd frontend
npm install
cp .env.example .env.local
npm run dev
```

Variavel principal:

```env
NEXT_PUBLIC_API_URL=http://localhost:3333
```

## Rotas Publicas Da API

- `GET /health`
- `GET /jobs`
- `GET /jobs/:id`
- `POST /jobs/:id/match`
- `GET /companies`
- `GET /companies/:id`
- `GET /technologies`
- `GET /stats`
- `GET /dashboard/summary`

### Filtros De Vagas

`GET /jobs` aceita busca, filtros e paginacao:

```bash
GET /jobs?search=node
GET /jobs?technology=react
GET /jobs?company=Nubank
GET /jobs?workMode=REMOTE
GET /jobs?contractType=PJ
GET /jobs?seniorityLevel=SENIOR
GET /jobs?location=Brasil
GET /jobs?salaryMin=3000&salaryMax=12000
GET /jobs?page=1&limit=10&sort=recent
```

Resposta paginada:

```json
{
  "data": [],
  "meta": {
    "page": 1,
    "limit": 10,
    "total": 42,
    "totalPages": 5
  }
}
```

`GET /companies` tambem retorna `data` e `meta`, com `page`, `limit`, `total` e `totalPages`.

### Match Score

`POST /jobs/:id/match` calcula uma compatibilidade simples entre as tecnologias informadas pelo candidato e as tecnologias vinculadas a vaga.

Exemplo de request:

```bash
curl -X POST http://localhost:3333/jobs/JOB_ID/match \
  -H "Content-Type: application/json" \
  -d "{\"technologies\":[\"Python\",\"Django\",\"PostgreSQL\"]}"
```

Exemplo de response:

```json
{
  "match": {
    "jobId": "JOB_ID",
    "score": 75,
    "matchedTechnologies": ["Python", "Django", "PostgreSQL"],
    "missingTechnologies": ["Docker"],
    "candidateTechnologies": ["Python", "Django", "PostgreSQL"],
    "jobTechnologies": ["Python", "Django", "Docker", "PostgreSQL"],
    "totalCandidateTechnologies": 3,
    "totalJobTechnologies": 4
  }
}
```

A formula e intencionalmente simples: `tecnologias da vaga encontradas / total de tecnologias da vaga * 100`.

### Estatisticas

`GET /stats` retorna:

- total de vagas publicadas;
- total de empresas;
- total de tecnologias;
- vagas por modalidade;
- vagas por senioridade;
- vagas por contrato;
- tecnologias mais citadas;
- empresas com mais vagas;
- localizacoes com mais vagas;
- vagas recentes.

## Rotas Do Frontend

- `/`
- `/vagas`
- `/vagas/[id]`
- `/empresas`
- `/empresas/[id]`
- `/estatisticas`
- `/sobre`

## Ingestao De Vagas Reais

O backend possui pipeline de ingestao para fontes publicas oficiais:

- JSON local ou remoto;
- Greenhouse public job board API;
- Lever postings API.
- Remotive public remote jobs API;
- Arbeitnow public job board API.

O projeto nao usa empresas ficticias como base funcional. O seed limpa a base e popula vagas reais a partir das fontes configuradas:

```bash
cd backend
npm run prisma:seed
```

O arquivo `backend/config/ingestion-sources.example.json` ja vem configurado com fontes reais via Greenhouse e Lever:

- Nubank;
- Wellhub;
- Thoughtworks;
- QuintoAndar;
- Stone;
- EBANX;
- Stripe Brasil;
- CloudWalk.

As fontes de ingestao aceitam filtros opcionais de localizacao:

```json
{
  "includeLocations": ["Brazil", "Brasil", "Sao Paulo", "Remote - Brazil"],
  "excludeLocations": ["Canada", "United States"]
}
```

Use `includeLocations` para priorizar vagas do Brasil e evitar que vagas remotas globais dominem a listagem publica.

Cada fonte roda de forma isolada: se uma falhar por timeout, status HTTP ou formato inesperado, as demais continuam. O resumo final mostra `fetched`, `normalized`, `skipped`, `created`, `updated`, `unchanged`, `expired`, `failed`, `error` e `durationMs`.

Exemplo de logs:

```txt
[Ingestion] Starting source: remotive-software
[Ingestion] remotive-software returned 31 job(s).
[Ingestion] remotive-software kept 24 job(s) after filters; skipped 7.
[Ingestion] remotive-software saved 24 job(s), 0 unchanged, 0 expired in 2.6s.
```

Para depurar queries SQL do Prisma durante ingestao:

```bash
PRISMA_QUERY_LOG=true npm run ingest
```

Para customizar fontes locais:

```bash
cd backend
cp config/ingestion-sources.example.json config/ingestion-sources.json
npm run ingest
```

Com Docker, o compose roda migrations, executa a ingestao real e entao inicia a API:

```bash
docker compose up -d --build
```

Para atualizar as vagas depois que os containers estiverem no ar:

```bash
docker compose exec api npm run ingest:prod
```

Nao ha scraping direto de LinkedIn, Glassdoor ou Indeed. Essas plataformas devem ser usadas apenas via APIs oficiais, parcerias ou autorizacao explicita.

LinkedIn e Indeed nao sao boas fontes para scraping direto neste projeto: exigem cuidado com termos de uso, podem aplicar bloqueios contra automacao e frequentemente dependem de fluxos dinamicos/anti-bot. Para portfolio, priorize APIs abertas, RSS, boards oficiais como Greenhouse/Lever e fontes que documentem permissao de redistribuicao com link para a vaga original.

Veja tambem: [`docs/ingestion-diagnosis.md`](docs/ingestion-diagnosis.md).

## Validacao

Backend:

```bash
cd backend
npm run build
npm run lint
npm run test
```

Frontend:

```bash
cd frontend
npm run lint
npm run build
```

## Observacoes

- Arquivos `.env` reais nao sao versionados.
- `backend/config/ingestion-sources.json` e local e nao deve ser commitado.
- `node_modules`, `dist`, `.next` e caches sao artefatos gerados e devem ficar fora do Git.

## Proximos Passos Possiveis

- Cache de estatisticas com Redis.
- Mais fontes oficiais de vagas.
- Testes end-to-end do frontend.
- Deploy da API e do frontend em ambiente cloud.
- Autenticacao, painel administrativo e candidaturas internas apenas em uma versao futura, fora do escopo da V1 publica.

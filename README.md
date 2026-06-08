# API de Vagas de TI

Projeto full stack para busca publica de vagas de tecnologia.

A arquitetura agora esta separada em duas aplicacoes:

```txt
api-vagas/
  backend/   API REST com Fastify, Prisma e PostgreSQL
  frontend/  Interface publica com Next.js, React e Tailwind CSS
```

Nao ha fluxo de autenticacao, dashboard privado, login, cadastro ou area administrativa. A aplicacao e publica e focada em descoberta de vagas.

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

Servicos:

- API: `http://localhost:3333`
- Swagger: `http://localhost:3333/docs`
- Frontend: `http://localhost:3000`
- Adminer: `http://localhost:8080`
- PostgreSQL: `localhost:5432`

Comandos uteis:

```bash
docker compose logs -f api
docker compose exec api npm run ingest:prod
docker compose exec api npx prisma migrate deploy
docker compose down
```

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
INGESTION_CONFIG_PATH=config/ingestion-sources.json
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
- `GET /companies`
- `GET /companies/:id`
- `GET /technologies`
- `GET /stats`
- `GET /dashboard/summary`

## Rotas Do Frontend

- `/`
- `/vagas`
- `/vagas/[id]`
- `/empresas`
- `/empresas/[id]`
- `/estatisticas`
- `/sobre`

## Ingestao De Vagas

O backend possui pipeline de ingestao para fontes permitidas e estaveis:

- JSON local ou remoto;
- Greenhouse public job board API;
- Lever postings API.

O arquivo `backend/config/ingestion-sources.example.json` ja vem configurado com fontes publicas reais via Greenhouse:

- Stripe;
- Cloudflare;
- Discord.

Para configurar fontes locais:

```bash
cd backend
cp config/ingestion-sources.example.json config/ingestion-sources.json
npm run ingest
```

Com Docker, o compose usa `INGESTION_CONFIG_PATH=config/ingestion-sources.example.json` dentro do container:

```bash
docker compose exec api npm run ingest:prod
```

Nao ha scraping direto de LinkedIn, Glassdoor ou Indeed. Essas plataformas devem ser usadas apenas via APIs oficiais, parcerias ou autorizacao explicita.

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

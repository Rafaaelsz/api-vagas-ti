# API Pública de Vagas de TI

API REST pública para busca, filtro e exploração de vagas de tecnologia. A V1 foi simplificada para ser consumida por um frontend público, sem login, Bearer Token, usuários, candidaturas internas ou área administrativa.

## Objetivo da V1

- Listar vagas de TI publicadas.
- Buscar e filtrar vagas por tecnologia, modalidade, contrato, senioridade, localização e salário.
- Exibir detalhes de vagas com empresa, tecnologias e link externo de candidatura.
- Listar empresas e tecnologias.
- Exibir estatísticas públicas.
- Rodar localmente com PostgreSQL e Docker.
- Documentar endpoints públicos via Swagger.

## Stack

- Node.js
- TypeScript
- Fastify
- PostgreSQL
- Prisma ORM
- Zod
- Swagger/OpenAPI
- Docker e Docker Compose
- ESLint e Prettier
- Vitest

## O Que Foi Simplificado

A V1 removeu da API pública:

- autenticação;
- login, registro e logout;
- Bearer Token/JWT;
- usuários, roles e permissões;
- candidaturas internas;
- rotas administrativas de escrita;
- painel privado.

Esses recursos podem voltar em versões futuras, mas não fazem parte da API pública inicial.

## Entidades

### Company

- `id`
- `name`
- `description`
- `website`
- `location`
- `createdAt`
- `updatedAt`

### Job

- `id`
- `title`
- `description`
- `companyId`
- `location`
- `workMode`
- `contractType`
- `seniorityLevel`
- `salaryMin`
- `salaryMax`
- `currency`
- `externalUrl`
- `source`
- `status`
- `publishedAt`
- `expiresAt`
- `createdAt`
- `updatedAt`

### Technology

- `id`
- `name`
- `createdAt`
- `updatedAt`

### JobTechnology

- `jobId`
- `technologyId`

## Rotas Públicas

- `GET /health`
- `GET /jobs`
- `GET /jobs/:id`
- `GET /companies`
- `GET /companies/:id`
- `GET /technologies`
- `GET /stats`
- `GET /dashboard/summary` como alias de compatibilidade para o frontend

## Filtros de Vagas

`GET /jobs` aceita:

- `search`
- `technology`
- `workMode`
- `contractType`
- `seniorityLevel`
- `location`
- `salaryMin`
- `salaryMax`
- `page`
- `limit`
- `sort`

Exemplos:

```txt
GET /jobs?search=node
GET /jobs?technology=react
GET /jobs?workMode=REMOTE
GET /jobs?contractType=PJ
GET /jobs?seniorityLevel=JUNIOR
GET /jobs?location=São Paulo
GET /jobs?salaryMin=3000&salaryMax=8000
GET /jobs?page=1&limit=10
GET /jobs?sort=recent
GET /jobs?sort=salary_desc
```

Resposta paginada:

```json
{
  "data": [],
  "meta": {
    "page": 1,
    "limit": 10,
    "total": 100,
    "totalPages": 10
  }
}
```

## Estatísticas

`GET /stats` retorna:

- total de vagas publicadas;
- total de empresas;
- total de tecnologias;
- vagas por modalidade;
- vagas por senioridade;
- vagas por tipo de contrato;
- tecnologias mais pedidas;
- localizações com mais vagas;
- vagas recentes.

## Variáveis de Ambiente

Veja [.env.example](./.env.example).

```env
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/jobs_api?schema=public
TEST_DATABASE_URL=postgresql://postgres:postgres@localhost:5432/api_vagas_test?schema=public
PORT=3333
HOST=0.0.0.0
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
INGESTION_CONFIG_PATH=config/ingestion-sources.json
```

## Como Rodar Com Docker

```bash
docker compose up --build
```

Comandos úteis:

```bash
docker compose down
docker compose logs -f api
docker compose exec api npx prisma migrate dev
docker compose exec api npx prisma db seed
docker compose exec api npx prisma studio
```

Serviços:

- API: `http://localhost:3333`
- Swagger: `http://localhost:3333/docs`
- Adminer: `http://localhost:8080`
- PostgreSQL: `localhost:5432`

## Como Rodar Sem Docker

1. Instale dependências:

```bash
npm install
```

2. Configure `.env`:

```bash
cp .env.example .env
```

3. Rode migrations:

```bash
npm run prisma:migrate
```

4. Rode seed:

```bash
npm run prisma:seed
```

5. Inicie a API:

```bash
npm run dev
```

## Scripts

```bash
npm run dev
npm run build
npm run start
npm run lint
npm run format
npm run test
npm run prisma:generate
npm run prisma:migrate
npm run prisma:seed
npm run prisma:studio
npm run ingest
npm run ingest:prod
```

## Swagger

A documentação pública está em:

```txt
http://localhost:3333/docs
```

## Frontend Público

O frontend público foi criado em `frontend/` com Next.js, TypeScript, Tailwind CSS, Lucide React e Recharts.

Para rodar:

```bash
cd frontend
npm install
cp .env.example .env.local
npm run dev
```

Configure:

```env
NEXT_PUBLIC_API_URL=http://localhost:3333
```

## Ingestão de Vagas

A API possui um pipeline de ingestão para alimentar vagas a partir de fontes permitidas e estáveis. A V1 suporta:

- JSON local ou remoto;
- Greenhouse public job board API;
- Lever postings API.

O arquivo `config/ingestion-sources.example.json` ja vem configurado com fontes publicas reais via Greenhouse:

- Stripe;
- Cloudflare;
- Discord.

Essas fontes usam filtros de inclusao e exclusao para manter o recorte em vagas de tecnologia e evitar carregar vagas comerciais, marketing, juridico, recrutamento e similares.

Não há scraping direto de LinkedIn, Glassdoor ou Indeed. Essas plataformas possuem restrições de automação e devem ser usadas apenas via APIs oficiais, parcerias ou autorização explícita.

1. Copie a configuração de exemplo:

```bash
cp config/ingestion-sources.example.json config/ingestion-sources.json
```

2. Edite `config/ingestion-sources.json` com suas fontes.

3. Rode a ingestão:

```bash
npm run ingest
```

Com Docker:

```bash
docker compose exec api npm run ingest:prod
```

No `docker-compose.yml`, a API usa `INGESTION_CONFIG_PATH=config/ingestion-sources.example.json`, entao o comando Docker acima ja carrega as fontes reais do exemplo.

Campos de rastreio usados pela ingestão:

- `externalId`
- `source`
- `sourceUrl`
- `externalUrl`
- `rawPayload`
- `contentHash`
- `scrapedAt`
- `lastSeenAt`

Quando `expireMissing` estiver ativo em uma fonte, vagas publicadas daquela fonte que não aparecerem na nova coleta serão marcadas como `EXPIRED`.

O relatorio da ingestao mostra:

- `fetched`: vagas recebidas da fonte;
- `skipped`: vagas descartadas pelos filtros;
- `created`: vagas novas;
- `updated`: vagas alteradas;
- `unchanged`: vagas ja sincronizadas;
- `expired`: vagas marcadas como expiradas.

## Testes

Os testes cobrem os fluxos públicos principais:

- health check;
- listagem de vagas;
- filtros de vagas;
- paginação;
- detalhes da vaga;
- listagem de empresas;
- listagem de tecnologias;
- stats.

```bash
npm run test
```

## Melhorias Futuras

- Autenticação.
- Painel administrativo.
- Cadastro de vagas por recrutadores.
- Favoritos.
- Candidaturas.
- Scraping ou integração com fontes externas.
- Notificações.
- Cache com Redis.
- Endpoint público de busca full-text com ranking de relevância.

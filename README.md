# API de Vagas de TI

API REST para cadastro, busca, filtro e gerenciamento de vagas de tecnologia. O projeto foi estruturado como backend de portfólio, com autenticação, autorização por papéis, validação, PostgreSQL, Prisma, Docker, Swagger e testes básicos.

## Stack

- Node.js, TypeScript e Fastify
- PostgreSQL e Prisma ORM
- Zod para validação
- JWT e bcryptjs para autenticação
- Swagger/OpenAPI em `/docs`
- Docker Compose com API, PostgreSQL e Adminer
- Vitest para testes de fluxo
- ESLint e Prettier

## Funcionalidades

- Cadastro, login, perfil e exclusão de usuário
- Empresas vinculadas a recrutadores
- CRUD de vagas com publicação e encerramento
- Busca e filtros de vagas por texto, tecnologia, modalidade, contrato, senioridade, localização e salário
- Paginação com metadados
- Cadastro e manutenção de tecnologias
- Candidatura em vagas publicadas
- Bloqueio de candidatura duplicada
- Dashboard administrativo com métricas agregadas
- Tratamento padronizado de erros

## Como Rodar Localmente

1. Instale as dependências:

```bash
npm install
```

2. Copie as variáveis de ambiente:

```bash
cp .env.example .env
```

3. Suba um PostgreSQL local ou use o serviço do Compose:

```bash
docker compose up -d postgres
```

4. Rode migrations, gere o client e alimente o banco:

```bash
npm run prisma:migrate
npm run seed
```

5. Inicie a API:

```bash
npm run dev
```

A API roda em `http://localhost:3333`.

## Docker

```bash
docker compose up --build
```

Serviços:

- API: `http://localhost:3333`
- Swagger: `http://localhost:3333/docs`
- Adminer: `http://localhost:8080`
- PostgreSQL: `localhost:5432`

## Variáveis de Ambiente

Veja [.env.example](./.env.example).

Principais variáveis:

- `DATABASE_URL`: conexão PostgreSQL usada pelo Prisma
- `JWT_SECRET`: segredo para assinar tokens JWT
- `JWT_EXPIRES_IN`: expiração do token
- `CORS_ORIGIN`: origem permitida para frontend

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
npm run prisma:studio
npm run seed
```

## Rotas Principais

### Auth

- `POST /auth/register`
- `POST /auth/login`
- `GET /auth/me`
- `POST /auth/logout`

### Users

- `GET /users/me`
- `PUT /users/me`
- `DELETE /users/me`

### Companies

- `GET /companies`
- `GET /companies/:id`
- `POST /companies`
- `PUT /companies/:id`
- `DELETE /companies/:id`

### Jobs

- `GET /jobs`
- `GET /jobs/:id`
- `POST /jobs`
- `PUT /jobs/:id`
- `DELETE /jobs/:id`
- `PATCH /jobs/:id/publish`
- `PATCH /jobs/:id/close`
- `POST /jobs/:jobId/apply`

### Technologies

- `GET /technologies`
- `POST /technologies`
- `PUT /technologies/:id`
- `DELETE /technologies/:id`

### Applications

- `GET /applications`
- `GET /applications/:id`
- `PATCH /applications/:id/status`
- `DELETE /applications/:id`

### Dashboard

- `GET /dashboard/summary`

## Filtros de Vagas

```txt
GET /jobs?search=node
GET /jobs?technology=react
GET /jobs?workMode=REMOTE
GET /jobs?contractType=PJ
GET /jobs?seniorityLevel=JUNIOR
GET /jobs?location=São Paulo
GET /jobs?salaryMin=3000&salaryMax=8000
GET /jobs?page=1&limit=10&sortBy=createdAt&order=desc
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

## Exemplos de Payload

Registro:

```json
{
  "name": "Ana Silva",
  "email": "ana@example.com",
  "password": "Password123",
  "role": "CANDIDATE"
}
```

Criação de vaga:

```json
{
  "title": "Backend Developer Node.js",
  "description": "Desenvolvimento de APIs REST com Node.js, TypeScript e PostgreSQL.",
  "companyId": "company_id",
  "location": "Remoto",
  "workMode": "REMOTE",
  "contractType": "PJ",
  "seniorityLevel": "SENIOR",
  "salaryMin": 9000,
  "salaryMax": 14000,
  "technologyNames": ["Node.js", "TypeScript", "Prisma"]
}
```

Candidatura:

```json
{
  "coverLetter": "Tenho experiência com APIs Node.js e interesse na vaga."
}
```

## Estrutura

```txt
src/
  modules/
    applications/
    auth/
    companies/
    dashboard/
    jobs/
    technologies/
    users/
  shared/
    config/
    database/
    errors/
    middlewares/
    utils/
  app.ts
  server.ts
prisma/
  migrations/
  schema.prisma
  seed.ts
tests/
```

## Decisões Técnicas

- Fastify foi escolhido por performance, plugins maduros e boa ergonomia para APIs REST.
- Prisma centraliza modelagem, relacionamentos e migrations PostgreSQL.
- Zod valida body, params e query antes das regras de negócio.
- JWT carrega `id`, `email` e `role`; dados sensíveis como `passwordHash` nunca são retornados.
- Services concentram regras de negócio; controllers apenas validam entrada e formatam resposta.
- Dashboard é restrito a `ADMIN` por expor dados agregados administrativos.

## Testes

Os testes usam `app.inject` do Fastify e esperam um banco PostgreSQL de teste configurado em `DATABASE_URL`.

```bash
npm run test
```

Fluxos cobertos:

- registro de usuário
- login
- criação de empresa
- criação de vaga
- listagem e filtro de vagas
- candidatura em vaga publicada
- bloqueio de candidatura duplicada
- bloqueio de rota privada sem token

## Melhorias Futuras

- Refresh tokens e blacklist para logout stateful
- Observabilidade com logs estruturados e tracing
- CI com lint, build, tests e migrations
- Testcontainers para banco isolado nos testes
- Busca full-text PostgreSQL
- Upload de currículo e integração com frontend Next.js

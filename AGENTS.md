# AGENTS.md

## Projeto: API de Vagas de TI

Este arquivo define as instruções para agentes de IA que forem trabalhar neste projeto.

O objetivo é garantir que qualquer agente entenda rapidamente a proposta da aplicação, a stack utilizada, as decisões técnicas já tomadas e os limites do escopo atual.

---

## 1. Visão geral do projeto

A **API de Vagas de TI** é uma aplicação backend pública para busca, listagem, filtragem e visualização de vagas de tecnologia.

O projeto tem como objetivo principal servir como uma aplicação de portfólio full stack, demonstrando domínio de:

* Node.js
* TypeScript
* APIs REST
* PostgreSQL
* Prisma ORM
* Filtros e paginação
* Docker
* Documentação de API
* Organização de código
* Boas práticas de backend

A aplicação não é um SaaS completo nesta primeira versão.

Ela deve funcionar como uma API pública consumida por um frontend de busca de vagas.

---

## 2. Escopo da V1

A V1 deve focar em uma API pública, simples e bem estruturada.

### A V1 deve ter

* Listagem pública de vagas.
* Busca por texto.
* Filtros por tecnologia, modalidade, senioridade, contrato, localização e salário.
* Paginação.
* Visualização de detalhes da vaga.
* Listagem de empresas.
* Visualização de detalhes da empresa.
* Listagem de tecnologias.
* Estatísticas gerais.
* Seed com dados reais vindos de fontes públicas oficiais.
* Documentação Swagger/OpenAPI.
* Docker funcionando.
* Código organizado e tipado.

### A V1 não deve ter

* Login.
* Cadastro.
* Logout.
* Autenticação com Bearer Token.
* JWT.
* Refresh token.
* Usuários.
* Roles.
* Permissões.
* Área administrativa.
* Painel privado.
* Candidaturas internas.
* Favoritos.
* Notificações.
* Cadastro público de vagas.
* Edição pública de vagas.
* Exclusão pública de vagas.

Se algum desses recursos existir no projeto, o agente deve avaliar se deve remover, isolar ou ignorar, mantendo o foco da V1.

---

## 3. Stack esperada

A stack principal do backend deve ser:

```txt
Node.js
TypeScript
Fastify
PostgreSQL
Prisma ORM
Zod
Swagger/OpenAPI
Docker
Docker Compose
ESLint
Prettier
```

Caso o projeto já esteja em Express ou outra estrutura funcional, o agente deve avaliar o impacto antes de migrar para Fastify.

Priorize sempre entregar uma API funcional, simples e coerente antes de fazer grandes refatorações.

---

## 4. Decisões técnicas importantes

### 4.1 A API é pública

Todas as rotas principais da V1 devem ser públicas.

O frontend não deve precisar enviar token para consumir a API.

Não implementar middleware de autenticação.

Não exigir header:

```txt
Authorization: Bearer <token>
```

### 4.2 Docker deve ser mantido

Mesmo sendo um projeto pequeno, o Docker já faz parte do projeto e deve ser mantido.

O projeto deve subir com:

```bash
docker compose up --build
```

O Docker Compose deve conter, no mínimo:

```txt
api
postgres
```

Opcionalmente, pode conter:

```txt
adminer
pgadmin
```

desde que já exista e esteja funcionando corretamente.

### 4.3 Banco de dados

O banco principal deve ser PostgreSQL.

O acesso ao banco deve ser feito via Prisma ORM.

Não usar banco em memória para a aplicação principal.

### 4.4 Dados da aplicação

A V1 deve priorizar dados reais via seed/ingestão a partir de fontes públicas oficiais.

A aplicação não deve apresentar empresas ou vagas fictícias como se fossem dados funcionais.

Scraping direto de plataformas fechadas não deve ser usado. Integrações com APIs públicas oficiais, como Greenhouse e Lever, fazem parte do escopo funcional atual.

---

## 5. Models principais

A V1 deve trabalhar preferencialmente com estes models:

### Company

Representa uma empresa que possui vagas.

Campos esperados:

```txt
id
name
description
website
location
createdAt
updatedAt
```

### Job

Representa uma vaga de tecnologia.

Campos esperados:

```txt
id
title
description
companyId
location
workMode
contractType
seniorityLevel
salaryMin
salaryMax
currency
externalUrl
source
status
publishedAt
expiresAt
createdAt
updatedAt
```

### Technology

Representa uma tecnologia relacionada às vagas.

Campos esperados:

```txt
id
name
createdAt
updatedAt
```

### JobTechnology

Tabela de relação entre vagas e tecnologias.

Campos esperados:

```txt
jobId
technologyId
```

---

## 6. Enums recomendados

Usar enums no Prisma quando fizer sentido.

### WorkMode

```txt
REMOTE
HYBRID
ONSITE
```

### ContractType

```txt
CLT
PJ
INTERNSHIP
FREELANCE
TEMPORARY
```

### SeniorityLevel

```txt
INTERN
JUNIOR
MID_LEVEL
SENIOR
SPECIALIST
LEAD
```

### JobStatus

```txt
PUBLISHED
CLOSED
EXPIRED
```

A API pública deve retornar preferencialmente vagas com status `PUBLISHED`.

---

## 7. Rotas públicas da V1

As principais rotas públicas devem ser:

```txt
GET /health
GET /jobs
GET /jobs/:id
GET /companies
GET /companies/:id
GET /technologies
GET /stats
```

Também pode existir:

```txt
GET /dashboard/summary
```

desde que funcione como alias ou compatibilidade para o frontend, apontando para o mesmo tipo de dado de `/stats`.

---

## 8. Rotas que não devem fazer parte da V1

Evitar, remover ou não documentar como principais:

```txt
POST /auth/register
POST /auth/login
GET /auth/me
POST /auth/logout
GET /users/me
POST /jobs
PUT /jobs/:id
DELETE /jobs/:id
POST /companies
PUT /companies/:id
DELETE /companies/:id
POST /applications
GET /applications
PATCH /applications/:id/status
DELETE /applications/:id
```

Caso existam por razões técnicas ou testes internos, não devem ser usadas pelo frontend público e não devem ser apresentadas como funcionalidades principais da V1.

---

## 9. Filtros da rota GET /jobs

A rota `GET /jobs` é a rota mais importante da aplicação.

Ela deve suportar:

```txt
search
technology
workMode
contractType
seniorityLevel
location
salaryMin
salaryMax
page
limit
sort
```

Exemplos de uso:

```txt
GET /jobs?search=node
GET /jobs?technology=react
GET /jobs?workMode=REMOTE
GET /jobs?contractType=PJ
GET /jobs?seniorityLevel=JUNIOR
GET /jobs?location=São Paulo
GET /jobs?salaryMin=3000
GET /jobs?salaryMax=8000
GET /jobs?page=1&limit=10
GET /jobs?sort=recent
```

A busca deve considerar, quando possível:

* título da vaga;
* descrição da vaga;
* nome da empresa;
* tecnologias relacionadas;
* localização.

---

## 10. Paginação

Listagens devem usar paginação.

Formato recomendado:

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

Aplicar especialmente em:

```txt
GET /jobs
GET /companies
```

O parâmetro `limit` deve ter valor máximo seguro, por exemplo:

```txt
limit máximo: 100
```

---

## 11. Resposta esperada de vaga

A rota:

```txt
GET /jobs/:id
```

Deve retornar a vaga com:

* dados completos da vaga;
* empresa vinculada;
* tecnologias vinculadas;
* link externo de candidatura;
* status;
* datas relevantes.

A aplicação não deve implementar candidatura interna.

O campo `externalUrl` será usado pelo frontend para botões como:

```txt
Ver vaga original
Acessar candidatura
```

---

## 12. Estatísticas

A rota:

```txt
GET /stats
```

Deve retornar dados úteis para o frontend público.

Exemplos:

```txt
total de vagas publicadas
total de empresas
total de tecnologias
vagas por modalidade
vagas por senioridade
vagas por tipo de contrato
tecnologias mais pedidas
localizações com mais vagas
vagas recentes
```

Se o frontend consumir `/dashboard/summary`, manter compatibilidade ou criar um alias para `/stats`.

---

## 13. Validação

Usar Zod para validar:

* parâmetros de rota;
* query params;
* filtros;
* paginação;
* enums;
* valores numéricos.

Exemplos de regras:

```txt
page mínimo: 1
limit mínimo: 1
limit máximo: 100
salaryMin deve ser numérico
salaryMax deve ser numérico
workMode deve ser enum válido
contractType deve ser enum válido
seniorityLevel deve ser enum válido
```

Não confiar diretamente nos dados recebidos pela query string.

---

## 14. Tratamento de erros

A API deve ter tratamento global de erros.

Formato recomendado:

```json
{
  "error": {
    "message": "Mensagem clara do erro",
    "code": "ERROR_CODE"
  }
}
```

Não vazar stack trace em produção.

Erros de validação devem ser claros e úteis para o frontend.

---

## 15. CORS

Configurar CORS para permitir o frontend público.

Usar variável de ambiente:

```env
FRONTEND_URL=http://localhost:3000
```

Em desenvolvimento, permitir localhost.

Em produção, restringir para o domínio correto quando existir.

---

## 16. Variáveis de ambiente

O arquivo `.env.example` deve conter apenas variáveis realmente usadas.

Exemplo:

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/jobs_api?schema=public"
PORT=3333
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
```

Não incluir variáveis de JWT, refresh token ou secrets de autenticação se a autenticação foi removida.

---

## 17. Docker

Arquivos esperados:

```txt
Dockerfile
docker-compose.yml
.dockerignore
```

Comandos importantes:

```bash
docker compose up --build
docker compose down
docker compose logs -f api
docker compose exec api npx prisma migrate dev
docker compose exec api npx prisma db seed
docker compose exec api npx prisma studio
```

Ajustar os comandos conforme o nome real dos serviços no `docker-compose.yml`.

O agente deve validar se o container da API consegue se conectar ao PostgreSQL.

---

## 18. Prisma

Arquivos principais:

```txt
prisma/schema.prisma
prisma/migrations/
prisma/seed.ts
```

Comandos esperados:

```bash
npx prisma generate
npx prisma migrate dev
npx prisma db seed
npx prisma studio
```

O seed deve popular a base a partir de fontes reais oficiais para testar o frontend com dados funcionais.

---

## 19. Seed

O seed deve popular:

* empresas;
* tecnologias;
* vagas;
* relações entre vagas e tecnologias.

Incluir tecnologias como:

```txt
Node.js
React
Next.js
TypeScript
JavaScript
Python
Django
FastAPI
Java
Spring Boot
PostgreSQL
Docker
AWS
Git
```

Incluir modalidades variadas:

```txt
REMOTE
HYBRID
ONSITE
```

Incluir senioridades variadas:

```txt
INTERN
JUNIOR
MID_LEVEL
SENIOR
SPECIALIST
LEAD
```

Incluir contratos variados:

```txt
CLT
PJ
INTERNSHIP
FREELANCE
TEMPORARY
```

Incluir `externalUrl` em vagas para simular candidatura externa.

---

## 20. Swagger/OpenAPI

A documentação deve refletir a API pública.

Documentar:

```txt
GET /health
GET /jobs
GET /jobs/:id
GET /companies
GET /companies/:id
GET /technologies
GET /stats
```

Não documentar autenticação, usuários, candidaturas ou rotas administrativas como parte principal da V1.

A documentação deve estar disponível em:

```txt
/docs
```

ou rota equivalente já configurada no projeto.

---

## 21. Estrutura recomendada

Estrutura sugerida:

```txt
src/
  modules/
    jobs/
      jobs.routes.ts
      jobs.controller.ts
      jobs.service.ts
      jobs.schemas.ts
    companies/
      companies.routes.ts
      companies.controller.ts
      companies.service.ts
      companies.schemas.ts
    technologies/
      technologies.routes.ts
      technologies.controller.ts
      technologies.service.ts
      technologies.schemas.ts
    stats/
      stats.routes.ts
      stats.controller.ts
      stats.service.ts
  shared/
    database/
      prisma.ts
    errors/
      app-error.ts
      error-handler.ts
    config/
      env.ts
    utils/
  app.ts
  server.ts
prisma/
  schema.prisma
  seed.ts
Dockerfile
docker-compose.yml
.env.example
README.md
```

Se o projeto já usa outra estrutura funcional, manter a coerência e evitar refatorações desnecessárias.

---

## 22. Scripts recomendados

O `package.json` deve conter scripts úteis.

Exemplo:

```json
{
  "scripts": {
    "dev": "tsx watch src/server.ts",
    "build": "tsc",
    "start": "node dist/server.js",
    "lint": "eslint .",
    "format": "prettier --write .",
    "test": "vitest",
    "prisma:generate": "prisma generate",
    "prisma:migrate": "prisma migrate dev",
    "prisma:seed": "prisma db seed",
    "prisma:studio": "prisma studio"
  }
}
```

Ajustar conforme a estrutura real do projeto.

---

## 23. Testes

Criar ou manter testes básicos para os fluxos públicos.

Testes recomendados:

```txt
GET /health
GET /jobs
GET /jobs com filtros
GET /jobs com paginação
GET /jobs/:id
GET /companies
GET /companies/:id
GET /technologies
GET /stats
```

Se existirem testes de autenticação, usuários ou candidaturas, remover ou atualizar conforme o novo escopo da V1.

---

## 24. README

O README deve explicar claramente:

* o que é o projeto;
* objetivo da V1;
* stack utilizada;
* por que a API é pública;
* por que não há autenticação na V1;
* como rodar com Docker;
* como rodar sem Docker, se suportado;
* como configurar `.env`;
* como rodar migrations;
* como rodar seed;
* como acessar Swagger;
* rotas públicas;
* filtros disponíveis;
* exemplo de resposta paginada;
* estrutura de pastas;
* melhorias futuras.

Melhorias futuras possíveis:

```txt
autenticação
painel administrativo
cadastro de vagas por recrutadores
favoritos
candidaturas internas
notificações
scraping de vagas
integração com APIs externas
cache com Redis
deploy em cloud
```

---

## 25. Regras para agentes de IA

Ao trabalhar neste projeto, siga estas regras:

1. Primeiro leia o projeto atual antes de alterar arquivos.
2. Não implemente autenticação na V1.
3. Não exija Bearer Token.
4. Não transforme a aplicação em SaaS.
5. Não crie painel administrativo.
6. Não exponha rotas públicas de criação, edição ou exclusão sem necessidade.
7. Mantenha o Docker funcionando.
8. Mantenha a API simples e pública.
9. Priorize filtros, paginação e boa experiência para o frontend.
10. Use TypeScript corretamente.
11. Use Zod para validação.
12. Use Prisma para acesso ao banco.
13. Atualize o README quando alterar comportamento.
14. Atualize o Swagger quando alterar rotas.
15. Atualize o `.env.example` quando alterar variáveis.
16. Evite código duplicado.
17. Evite overengineering.
18. Não deixe imports quebrados.
19. Não deixe variáveis obrigatórias não documentadas.
20. Faça uma revisão final antes de concluir.

---

## 26. Fluxo recomendado para qualquer alteração

Antes de implementar:

```txt
1. Analisar estrutura atual
2. Identificar impacto da alteração
3. Criar ou usar branch apropriada
4. Implementar alteração pequena e coesa
5. Rodar TypeScript/build
6. Rodar migrations/seed se necessário
7. Testar rotas afetadas
8. Atualizar documentação
9. Entregar resumo do que foi feito
```

---

## 27. Branches recomendadas

Para novas features:

```bash
git checkout -b feature/nome-da-feature
```

Para refatorações:

```bash
git checkout -b refactor/nome-da-refatoracao
```

Para correções:

```bash
git checkout -b fix/nome-do-ajuste
```

Para documentação:

```bash
git checkout -b docs/nome-da-documentacao
```

---

## 28. Critérios de conclusão

Uma tarefa só deve ser considerada concluída quando:

* a API compilar;
* a aplicação subir localmente;
* a aplicação subir com Docker;
* o banco conectar;
* as migrations rodarem;
* o seed rodar;
* as rotas públicas funcionarem;
* o Swagger estiver atualizado;
* o README estiver atualizado;
* não houver imports quebrados;
* não houver dependência de autenticação;
* o frontend conseguir consumir a API sem token.

---

## 29. Resumo da proposta final

A proposta final da V1 é:

```txt
Uma API pública de busca de vagas de TI, feita com Node.js, TypeScript, PostgreSQL, Prisma e Docker.

A API permite listar, buscar, filtrar e visualizar vagas, empresas, tecnologias e estatísticas.

Não possui autenticação, usuários, candidaturas internas ou painel administrativo na primeira versão.

O foco é simplicidade, organização, documentação e integração com um frontend público de busca de vagas.
```

---

## 30. Observação final

Evite transformar este projeto em algo maior do que ele precisa ser.

O valor do projeto está em entregar bem o essencial:

```txt
busca
filtros
paginação
relacionamentos
documentação
Docker funcionando
código limpo
frontend consumindo sem dificuldade
```

Funcionalidades avançadas devem ser tratadas como evolução futura, não como requisito da V1.

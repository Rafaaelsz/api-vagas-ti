# Diagnostico da ingestao de vagas

## Como o fluxo atual funciona

O projeto nao faz scraping HTML de plataformas grandes. A ingestao atual e baseada em providers estruturados:

- `json`: le arquivos locais ou JSON remoto.
- `greenhouse`: consome `https://boards-api.greenhouse.io/v1/boards/{boardToken}/jobs?content=true`.
- `lever`: consome `https://api.lever.co/v0/postings/{companySlug}?mode=json`.
- `remotive`: consome `https://remotive.com/api/remote-jobs?category=software-dev`.
- `arbeitnow`: consome `https://www.arbeitnow.com/api/job-board-api`.

Fluxo:

1. `scripts/ingest.ts` carrega `config/ingestion-sources.example.json` ou o arquivo indicado por `INGESTION_CONFIG_PATH`.
2. `runIngestion` percorre as fontes habilitadas.
3. Cada provider busca dados JSON e converte para `NormalizedJob`.
4. `shouldImportJob` aplica filtros por keywords, localizacao e tecnologias.
5. `upsertJob` salva empresa, vaga e tecnologias no PostgreSQL via Prisma.
6. A deduplicacao principal usa a constraint `source + externalId`.
7. Quando `expireMissing` esta ativo, vagas publicadas que nao aparecem mais naquela fonte sao marcadas como `EXPIRED`.

## Problemas encontrados

- Nao havia providers para Indeed, LinkedIn, Glassdoor, Gupy, Remotar, Programathor, GeekHunter ou APInfo.
- As requisicoes HTTP nao tinham timeout, retry simples ou User-Agent identificavel.
- Uma falha em uma fonte quebrava a ingestao inteira.
- Os logs finais mostravam apenas a tabela de resultados, sem marcar claramente inicio/fim por fonte.
- Com `NODE_ENV=development`, o Prisma imprimia cada query SQL, poluindo a leitura dos logs de ingestao.
- Nao havia fontes abertas adicionais alem de Greenhouse/Lever/JSON.

## LinkedIn e Indeed

LinkedIn e Indeed nao sao recomendados para scraping direto neste projeto.

Motivos:

- Risco de violar termos de uso e politicas contra bots/crawlers.
- Possibilidade de bloqueios por anti-bot, captcha, rate limit ou login.
- HTML e dados de listagem podem mudar sem aviso.
- Conteudo pode depender de JavaScript e paginacao dinamica.
- O esforco de manter scrapers confiaveis e maior do que o valor para uma V1 de portfolio.

Estrategia recomendada: usar APIs oficiais, parcerias, feeds autorizados ou boards publicos de empresas.

## Fontes recomendadas

Prioridade alta:

- Greenhouse
- Lever
- Remotive
- Arbeitnow
- The Muse API
- Adzuna API, se houver chave
- Hacker News Who is Hiring via Algolia/HN, se houver parser dedicado

Prioridade com cautela:

- Remote OK, pois o endpoint existe, mas o payload pode conter vagas fora de tecnologia e dados com encoding irregular.
- Gupy, Remotar, Programathor, GeekHunter e APInfo apenas se houver permissao, API/documentacao publica ou HTML estavel com robots/termos compativeis.

Evitar na V1:

- LinkedIn
- Indeed
- Glassdoor
- Qualquer fonte que exija captcha, login, bypass, proxy rotation ou simulacao agressiva de usuario.

## Melhorias implementadas

- Helper HTTP com timeout, retry e User-Agent.
- Fallback por fonte: se uma falhar, as demais continuam.
- Resultados por fonte com `failed`, `error`, `durationMs` e `normalized`.
- Logs claros no `npm run ingest`.
- Providers novos para Remotive e Arbeitnow.
- Configuracao exemplo com fontes novas e filtros de tecnologia.
- `PRISMA_QUERY_LOG=true` para ativar SQL detalhado somente quando necessario.
- Teste cobrindo fallback quando uma fonte falha.

## Comandos uteis

```bash
cd backend
npm run ingest
npm run test
npm run build
```

Com Docker:

```bash
docker compose up -d --build
docker compose logs -f api
docker compose exec api npm run ingest:prod
```

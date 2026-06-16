import type { IngestionSourceConfig } from './ingestion.types';

const defaultTimeoutMs = 15000;
const defaultRetryAttempts = 1;

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : 'Erro desconhecido.';
}

export async function fetchJson<T>(
  url: string,
  source: IngestionSourceConfig,
): Promise<T> {
  const timeoutMs = source.requestTimeoutMs ?? defaultTimeoutMs;
  const retryAttempts = source.retryAttempts ?? defaultRetryAttempts;
  let lastError: unknown;

  for (let attempt = 0; attempt <= retryAttempts; attempt += 1) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const response = await fetch(url, {
        signal: controller.signal,
        headers: {
          Accept: 'application/json',
          'User-Agent':
            'finder-vagas-ti/1.0 (+https://github.com/) portfolio-project',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status} ao buscar ${url}.`);
      }

      return (await response.json()) as T;
    } catch (error) {
      lastError = error;

      if (attempt < retryAttempts) {
        await sleep(500 * (attempt + 1));
      }
    } finally {
      clearTimeout(timeout);
    }
  }

  throw new Error(getErrorMessage(lastError));
}

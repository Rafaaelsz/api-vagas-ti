import { compactParams } from './utils';

export class ApiError extends Error {
  constructor(
    message: string,
    public readonly statusCode?: number,
  ) {
    super(message);
  }
}

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3333';

export function getApiUrl() {
  return API_URL;
}

export async function apiFetch<T>(
  path: string,
  options: RequestInit & { params?: Record<string, string | number | undefined | null> } = {},
): Promise<T> {
  const url = new URL(path, API_URL);

  if (options.params) {
    const params = compactParams(options.params);
    params.forEach((value, key) => url.searchParams.set(key, value));
  }

  let response: Response;

  try {
    response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      cache: options.cache ?? 'no-store',
    });
  } catch {
    throw new ApiError('Não foi possível conectar com a API. Verifique se o backend está rodando.');
  }

  if (!response.ok) {
    throw new ApiError(`A API retornou status ${response.status}.`, response.status);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json() as Promise<T>;
}

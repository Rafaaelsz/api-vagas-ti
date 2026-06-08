import { apiFetch } from '@/lib/api';
import type { Technology } from '@/types/api';

type TechnologiesResponse = { data: Technology[] };

export async function getTechnologies() {
  const response = await apiFetch<TechnologiesResponse>('/technologies');
  return response.data;
}

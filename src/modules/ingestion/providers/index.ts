import type { IngestionProvider, IngestionSourceConfig } from '../ingestion.types';
import { createGreenhouseProvider } from './greenhouse.provider';
import { createJsonProvider } from './json.provider';
import { createLeverProvider } from './lever.provider';

export function createProvider(source: IngestionSourceConfig): IngestionProvider {
  const providers = {
    json: createJsonProvider,
    greenhouse: createGreenhouseProvider,
    lever: createLeverProvider,
  };

  return providers[source.type](source);
}

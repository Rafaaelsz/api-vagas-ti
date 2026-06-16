import type {
  IngestionProvider,
  IngestionSourceConfig,
} from '../ingestion.types';
import { createArbeitnowProvider } from './arbeitnow.provider';
import { createGreenhouseProvider } from './greenhouse.provider';
import { createJsonProvider } from './json.provider';
import { createLeverProvider } from './lever.provider';
import { createRemotiveProvider } from './remotive.provider';

export function createProvider(
  source: IngestionSourceConfig,
): IngestionProvider {
  const providers = {
    json: createJsonProvider,
    greenhouse: createGreenhouseProvider,
    lever: createLeverProvider,
    remotive: createRemotiveProvider,
    arbeitnow: createArbeitnowProvider,
  };

  return providers[source.type](source);
}

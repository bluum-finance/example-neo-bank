import { config } from '@/lib/config';

export type DataSourceMode = 'api' | 'demo';

function parseMode(value: string | undefined): DataSourceMode {
  return value === 'api' ? 'api' : 'demo';
}

export function isAssetDemo(): boolean {
  return parseMode(config.assetDataSource) === 'demo';
}

export function isTradingDemo(): boolean {
  return parseMode(config.tradingDataSource) === 'demo';
}

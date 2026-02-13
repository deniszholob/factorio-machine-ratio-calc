import { normalizeProduction } from 'src/app/components/production/production-chain-editor/production-editor/production.util';
import { Production } from '../../models/production-chain/production/production.model';
import { ProductionChain } from '../../models/production-chain/production-chain.model';

const SHARED_HASH_PREFIX = '#prc1:';

export interface SharedProductionChainPayload {
  display: string;
  iconUrl?: string;
  productions: Production[];
  icons?: SharedProductionIconsPayload;
}

export interface SharedProductionIconsPayload {
  itemByName: Record<string, string>;
  recipeByName: Record<string, string>;
  machineByName: Record<string, string>;
}

export function encodeProductionChainHash(
  chain: ProductionChain,
  icons?: SharedProductionIconsPayload,
): string {
  const payload: SharedProductionChainPayload = {
    display: normalizeSharedDisplayBaseName(chain.display),
    iconUrl: chain.iconUrl,
    productions: chain.productions.map((production) =>
      normalizeProduction(production),
    ),
    icons,
  };
  const json = JSON.stringify(payload);
  return `${SHARED_HASH_PREFIX}${encodeBase64Url(json)}`;
}

function normalizeSharedDisplayBaseName(displayName: string): string {
  const trimmed = displayName.trim();
  const normalized = trimmed.replace(/(\s+\(shared(?:\s+\d+)?\))+$/i, '');
  return normalized.trim() || 'Shared Production Chain';
}

export function decodeProductionChainHash(
  hash: string,
): SharedProductionChainPayload | undefined {
  if (!hash.startsWith(SHARED_HASH_PREFIX)) {
    return undefined;
  }

  const encodedPayload = hash.slice(SHARED_HASH_PREFIX.length);
  if (!encodedPayload) {
    return undefined;
  }

  try {
    const json = decodeBase64Url(encodedPayload);
    const parsed = JSON.parse(json) as Partial<SharedProductionChainPayload>;
    if (!Array.isArray(parsed.productions)) {
      return undefined;
    }

    return {
      display:
        typeof parsed.display === 'string' && parsed.display.trim().length > 0
          ? parsed.display.trim()
          : 'Shared Production Chain',
      iconUrl:
        typeof parsed.iconUrl === 'string' && parsed.iconUrl.trim().length > 0
          ? parsed.iconUrl.trim()
          : undefined,
      productions: parsed.productions.map((production) =>
        normalizeProduction(production),
      ),
      icons: normalizeSharedProductionIcons(parsed.icons),
    };
  } catch {
    return undefined;
  }
}

function normalizeSharedProductionIcons(
  payload: unknown,
): SharedProductionIconsPayload | undefined {
  if (!payload || typeof payload !== 'object') {
    return undefined;
  }

  const maybe = payload as {
    itemByName?: unknown;
    recipeByName?: unknown;
    machineByName?: unknown;
  };

  return {
    itemByName: normalizeIconRecord(maybe.itemByName),
    recipeByName: normalizeIconRecord(maybe.recipeByName),
    machineByName: normalizeIconRecord(maybe.machineByName),
  };
}

function normalizeIconRecord(payload: unknown): Record<string, string> {
  if (!payload || typeof payload !== 'object') {
    return {};
  }

  const next: Record<string, string> = {};
  for (const [name, iconUrl] of Object.entries(payload)) {
    const normalizedName = name.trim();
    if (!normalizedName || typeof iconUrl !== 'string') {
      continue;
    }
    const normalizedIconUrl = iconUrl.trim();
    if (!normalizedIconUrl) {
      continue;
    }
    next[normalizedName] = normalizedIconUrl;
  }
  return next;
}

function encodeBase64Url(value: string): string {
  const bytes = new TextEncoder().encode(value);
  let binary = '';
  for (const byte of bytes) {
    binary += String.fromCharCode(byte);
  }

  return btoa(binary)
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

function decodeBase64Url(value: string): string {
  const padded = value + '='.repeat((4 - (value.length % 4)) % 4);
  const base64 = padded.replace(/-/g, '+').replace(/_/g, '/');
  const binary = atob(base64);
  const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0));
  return new TextDecoder().decode(bytes);
}

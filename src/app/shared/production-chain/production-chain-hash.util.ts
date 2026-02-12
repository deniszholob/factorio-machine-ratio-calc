import { ProductionChain } from 'src/app/components/production-chain-group/production-chain-item/production-chain.model';
import {
  Production,
  normalizeProduction,
} from 'src/app/components/production-chain-editor/production-editor/production.model';

const SHARED_HASH_PREFIX = '#prc1:';

export interface SharedProductionChainPayload {
  display: string;
  iconUrl?: string;
  productions: Production[];
}

export function encodeProductionChainHash(chain: ProductionChain): string {
  const payload: SharedProductionChainPayload = {
    display: chain.display.trim() || 'Shared Production Chain',
    iconUrl: chain.iconUrl,
    productions: chain.productions.map((production) =>
      normalizeProduction(production),
    ),
  };
  const json = JSON.stringify(payload);
  return `${SHARED_HASH_PREFIX}${encodeBase64Url(json)}`;
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
    };
  } catch {
    return undefined;
  }
}

function encodeBase64Url(value: string): string {
  const bytes = new TextEncoder().encode(value);
  let binary = '';
  for (const byte of bytes) {
    binary += String.fromCharCode(byte);
  }

  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function decodeBase64Url(value: string): string {
  const padded = value + '='.repeat((4 - (value.length % 4)) % 4);
  const base64 = padded.replace(/-/g, '+').replace(/_/g, '/');
  const binary = atob(base64);
  const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0));
  return new TextDecoder().decode(bytes);
}

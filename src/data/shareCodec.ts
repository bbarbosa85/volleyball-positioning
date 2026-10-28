import type { Strategy } from '../types/volleyball';
import { createDefaultStrategy } from './defaultLayout';

export interface SharedCourtConfig {
  showZones?: boolean;
  showAllArrows?: boolean;
  showBlockShadow?: boolean;
  showCoverageRange?: boolean;
  is3DView?: boolean;
}

export const DEFAULT_SHARED_COURT_CONFIG: Required<SharedCourtConfig> = {
  showZones: false,
  showAllArrows: false,
  showBlockShadow: true,
  showCoverageRange: false,
  is3DView: false
};

export interface SharePayloadV2 {
  v: 2;
  title?: string;
  courtConfig?: SharedCourtConfig;
  strategies: Omit<Strategy, 'id'>[];
}

export function encodeSharePayload(payload: SharePayloadV2): string {
  try {
    const json = JSON.stringify(payload);
    const bytes = new TextEncoder().encode(json);
    let binString = '';
    for (let i = 0; i < bytes.length; i++) {
      binString += String.fromCharCode(bytes[i]);
    }
    return encodeURIComponent(btoa(binString));
  } catch (err) {
    console.error('Failed to encode share payload', err);
    return '';
  }
}

export function decodeSharePayload(encoded: string): SharePayloadV2 | null {
  try {
    const decoded = decodeURIComponent(encoded);
    const binString = atob(decoded);
    const bytes = new Uint8Array(binString.length);
    for (let i = 0; i < binString.length; i++) {
      bytes[i] = binString.charCodeAt(i);
    }
    const json = new TextDecoder().decode(bytes);
    const parsed = JSON.parse(json);
    if (parsed && Array.isArray(parsed.strategies)) {
      return parsed as SharePayloadV2;
    }
  } catch (err) {
    console.warn('Failed to decode share payload:', err);
  }
  return null;
}

/**
 * Builds full share URL using URL hash (#share=...)
 */
export function buildShareUrl(
  strategies: Strategy[],
  title?: string,
  courtConfig?: SharedCourtConfig
): string {
  const stripped: Omit<Strategy, 'id'>[] = strategies.map(s => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { id: _id, ...rest } = s;
    return rest;
  });

  const payload: SharePayloadV2 = {
    v: 2,
    title: title?.trim() || undefined,
    courtConfig: courtConfig ? { ...courtConfig } : { ...DEFAULT_SHARED_COURT_CONFIG },
    strategies: stripped
  };

  const hashData = encodeSharePayload(payload);
  const base = window.location.origin + window.location.pathname;
  return `${base}#share=${hashData}`;
}

/**
 * Parses current window URL for shared strategies:
 * Either hash #share=... or legacy searchParams (rot, base, attack)
 */
export function parseSharedUrl(): {
  strategies: Strategy[];
  title?: string;
  courtConfig: Required<SharedCourtConfig>;
} | null {
  // 1. Check hash #share=...
  if (window.location.hash.startsWith('#share=')) {
    const encoded = window.location.hash.replace('#share=', '');
    const payload = decodeSharePayload(encoded);
    if (payload && payload.strategies.length > 0) {
      const strategies: Strategy[] = payload.strategies.map((s, idx) => ({
        ...JSON.parse(JSON.stringify(s)),
        id: `shared_${idx + 1}_${Date.now()}`
      }));
      const courtConfig: Required<SharedCourtConfig> = {
        ...DEFAULT_SHARED_COURT_CONFIG,
        ...payload.courtConfig
      };
      return { strategies, title: payload.title, courtConfig };
    }
  }

  // 2. Fallback: Check legacy query params (?rot=...&base=...&attack=...)
  const params = new URLSearchParams(window.location.search);
  const rotParam = params.get('rot');
  if (rotParam || params.get('base') || params.get('attack')) {
    const rot = (rotParam === '2' ? 2 : 1) as (1 | 2);
    const strat = createDefaultStrategy(`legacy_${Date.now()}`, 'Shared Tactic', rot);
    return {
      strategies: [strat],
      title: 'Legacy Shared Link',
      courtConfig: { ...DEFAULT_SHARED_COURT_CONFIG }
    };
  }

  return null;
}

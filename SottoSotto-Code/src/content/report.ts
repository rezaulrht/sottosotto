/**
 * Mock guard (D45, ARCHITECTURE §11.2): every value in the raw data that must not
 * reach production. The list doubles as the client chase list.
 */

export type FlagReason =
  | 'mock'
  | 'toConfirm'
  | 'needsVerification'
  | 'addressMissing'
  | 'unconfirmed'
  | 'estimatedAllergens';

export interface FlaggedValue {
  file: string;
  /** JSON path of the object carrying the flag, e.g. `address` or `parking[2]`. */
  path: string;
  reasons: FlagReason[];
  /** A short human label for the object (its name, label, title or id), when it has one. */
  label?: string;
}

function reasonsFor(obj: Record<string, unknown>): FlagReason[] {
  const reasons: FlagReason[] = [];
  if (obj.mock === true) reasons.push('mock');
  if (obj.toConfirm === true) reasons.push('toConfirm');
  if (obj.needsVerification === true) reasons.push('needsVerification');
  if (obj.addressMissing === true) reasons.push('addressMissing');
  if (obj.confirmed === false) reasons.push('unconfirmed');
  if (obj.allergenSource === 'estimated') reasons.push('estimatedAllergens');
  return reasons;
}

function labelFor(obj: Record<string, unknown>): string | undefined {
  for (const key of ['name', 'label', 'title', 'id', 'alt', 'platform', 'mode']) {
    if (typeof obj[key] === 'string') return obj[key] as string;
  }
  return undefined;
}

/** Walks one raw JSON value. Keys starting with `_` are notes and are skipped. */
export function flagsInFile(file: string, value: unknown): FlaggedValue[] {
  const out: FlaggedValue[] = [];
  const walk = (node: unknown, path: string) => {
    if (Array.isArray(node)) {
      node.forEach((child, i) => walk(child, `${path}[${i}]`));
      return;
    }
    if (!node || typeof node !== 'object') return;
    const obj = node as Record<string, unknown>;
    const reasons = reasonsFor(obj);
    if (reasons.length) {
      const label = labelFor(obj);
      out.push({ file, path: path || '(root)', reasons, ...(label ? { label } : {}) });
    }
    for (const [key, child] of Object.entries(obj)) {
      if (!key.startsWith('_')) walk(child, path ? `${path}.${key}` : key);
    }
  };
  walk(value, '');
  return out;
}

export function flaggedValues(files: Record<string, unknown>): FlaggedValue[] {
  return Object.entries(files).flatMap(([file, value]) => flagsInFile(file, value));
}

export function countByReason(flags: FlaggedValue[]): Record<FlagReason, number> {
  const counts: Record<FlagReason, number> = {
    mock: 0,
    toConfirm: 0,
    needsVerification: 0,
    addressMissing: 0,
    unconfirmed: 0,
    estimatedAllergens: 0,
  };
  for (const f of flags) for (const r of f.reasons) counts[r]++;
  return counts;
}

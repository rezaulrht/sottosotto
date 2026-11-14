/** Colour tokens declared in tokens.css as `--name-123: #rrggbb;`, lower-cased. */
export function cssColors(source: string): Record<string, string> {
  const out: Record<string, string> = {};
  for (const m of source.matchAll(/--([a-z]+-\d{3}):\s*(#[0-9a-fA-F]{6})\s*;/g)) {
    out[m[1]!] = m[2]!.toLowerCase();
  }
  return out;
}

/** Durations declared in tokens.css as `--dur-name: 123ms;` (first declaration wins). */
export function cssDurations(source: string): Record<string, number> {
  const out: Record<string, number> = {};
  for (const m of source.matchAll(/--dur-([a-z]+):\s*(\d+)ms\s*;/g)) {
    if (!(m[1]! in out)) out[m[1]!] = Number(m[2]);
  }
  return out;
}

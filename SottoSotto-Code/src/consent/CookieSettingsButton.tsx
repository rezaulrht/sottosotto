'use client';

import { OPEN_EVENT } from './consent';

/** Footer "Cookie settings": reopens the consent banner (ARCHITECTURE §9.2). */
export function CookieSettingsButton({ label, className }: { label: string; className?: string }) {
  return (
    <button
      type="button"
      className={className}
      onClick={() => window.dispatchEvent(new Event(OPEN_EVENT))}
    >
      {label}
    </button>
  );
}

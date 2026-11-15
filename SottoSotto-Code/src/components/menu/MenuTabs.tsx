'use client';

import { useEffect, useState } from 'react';

interface Tab {
  id: string;
  label: string;
}

/**
 * Sticky Menu · Dessert · Wine bar (PAGES.md Menu). Plain hash links: they scroll to the
 * section and update the URL so it can be shared (`/menu/#dessert`), with or without JS.
 * With JS, the section in view is marked `aria-current="location"`.
 */
export function MenuTabs({ tabs, className }: { tabs: Tab[]; className?: string }) {
  const [active, setActive] = useState<string | null>(null);

  useEffect(() => {
    const sections = tabs
      .map((t) => document.getElementById(t.id))
      .filter((el): el is HTMLElement => el !== null);
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) if (entry.isIntersecting) setActive(entry.target.id);
      },
      // A thin band a third of the way down: the section crossing it is the current one.
      { rootMargin: '-33% 0px -66% 0px' },
    );
    sections.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [tabs]);

  return (
    <nav aria-label="Menu sections">
      <ul className={className}>
        {tabs.map((t) => (
          <li key={t.id}>
            <a href={`#${t.id}`} aria-current={active === t.id ? 'location' : undefined}>
              {t.label}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}

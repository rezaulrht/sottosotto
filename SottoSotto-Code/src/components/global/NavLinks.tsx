'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { isCurrent, NAV_LINKS } from '@/lib/nav';

interface Props {
  className?: string;
  linkClassName?: string;
  onNavigate?: () => void;
}

/** Main nav links with `aria-current="page"` on the current route. */
export function NavLinks({ className, linkClassName, onNavigate }: Props) {
  const pathname = usePathname();
  return (
    <ul className={className}>
      {NAV_LINKS.map((link) => (
        <li key={link.href}>
          <Link
            href={link.href}
            className={linkClassName}
            aria-current={isCurrent(link.href, pathname) ? 'page' : undefined}
            onClick={onNavigate}
          >
            {link.label}
          </Link>
        </li>
      ))}
    </ul>
  );
}

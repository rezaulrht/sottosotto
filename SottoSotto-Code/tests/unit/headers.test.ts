import { describe, expect, it } from 'vitest';
import { contentSecurityPolicy, REDIRECTS, securityHeaders } from '@config/headers';

const names = (env: Parameters<typeof securityHeaders>[0]) =>
  securityHeaders(env).map(([name]) => name);

describe('security headers', () => {
  it('production enforces the CSP and is indexable', () => {
    expect(names('production')).toContain('Content-Security-Policy');
    expect(names('production')).not.toContain('X-Robots-Tag');
  });

  it('staging uses CSP report-only and noindex', () => {
    expect(names('staging')).toContain('Content-Security-Policy-Report-Only');
    expect(names('staging')).not.toContain('Content-Security-Policy');
    expect(securityHeaders('staging')).toContainEqual(['X-Robots-Tag', 'noindex, nofollow']);
  });

  it('CSP keeps the strict directives and allows only Hospres in frames', () => {
    const csp = contentSecurityPolicy();
    expect(csp).toContain("frame-ancestors 'none'");
    expect(csp).toContain("object-src 'none'");
    expect(csp).toContain("base-uri 'self'");
    expect(csp).toContain('frame-src https://app.hospres.com;');
    expect(csp).not.toContain('unsafe-eval');
  });

  it('old PDF links redirect to the menu tabs', () => {
    expect(REDIRECTS.map((r) => r.to)).toEqual(['/menu/#menu', '/menu/#dessert', '/menu/#wine']);
  });
});

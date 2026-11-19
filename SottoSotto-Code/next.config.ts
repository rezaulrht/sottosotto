import type { NextConfig } from 'next';

// Static export: the build output in `out/` is plain files for any host (D30, D47).
// Headers and redirects are not set here (static export ignores them);
// scripts/emit-headers.ts writes them for each host after the build.
const nextConfig: NextConfig = {
  output: 'export',
  trailingSlash: true,
  images: { unoptimized: true },
  reactStrictMode: true,
  env: {
    SITE_ENV: process.env.SITE_ENV ?? 'development',
    SITE_URL: process.env.SITE_URL ?? '',
  },
};

export default nextConfig;

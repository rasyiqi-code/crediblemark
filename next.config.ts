import type { NextConfig } from "next";
import createNextIntlPlugin from 'next-intl/plugin';
import withBundleAnalyzer from '@next/bundle-analyzer';

const withNextIntl = createNextIntlPlugin();

const nextConfig: NextConfig = {
  output: 'standalone',
  // Nonaktifkan kompresi bawaan Next.js karena Vercel/Cloudflare
  // sudah melakukan Gzip/Brotli di edge — menghindari beban CPU ganda
  compress: false,
  serverExternalPackages: ['@prisma/client', 'prisma'],
  productionBrowserSourceMaps: false,
  experimental: {
    webpackMemoryOptimizations: true,
    serverSourceMaps: false,
    staleTimes: {
      dynamic: 30,
      static: 180,
    },
    optimizePackageImports: [
      'lucide-react',
      'date-fns',
      'framer-motion',
      'clsx',
      'tailwind-merge',
      '@hexclave/next',
    ],
  },
  images: {
    // OPTIMASI CPU: Hanya gunakan format WebP dan nonaktifkan AVIF guna menghemat CPU time Vercel Functions secara drastis
    formats: ['image/webp'],
    minimumCacheTTL: 86400,
    dangerouslyAllowSVG: true,
    contentDispositionType: 'attachment',
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'media.crediblemark.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'crediblemark.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: '*.r2.dev',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'avatars.githubusercontent.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'i.pravatar.cc',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: '*.midtrans.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: '*.public.blob.vercel-storage.com',
        pathname: '/**',
      }
    ],
  },
  async headers() {
    const isDev = process.env.NODE_ENV === 'development';
    
    const defaultCSP = isDev ? "default-src * 'unsafe-inline' 'unsafe-eval' data: blob:;" : `
      default-src 'self';
      script-src 'self' 'unsafe-eval' 'unsafe-inline' https://*.midtrans.com https://*.sandbox.midtrans.com https://snap-popup-app.midtrans.com https://snap-popup-app.sandbox.midtrans.com https://www.googletagmanager.com https://static.cloudflareinsights.com https://cdn.jsdelivr.net https://cdn.tailwindcss.com https://unpkg.com;
      style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://*.midtrans.com https://cdn.tailwindcss.com;
      img-src 'self' blob: data: https://media.crediblemark.com https://*.r2.dev https://avatars.githubusercontent.com https://lh3.googleusercontent.com https://i.pravatar.cc https://*.midtrans.com https://*.public.blob.vercel-storage.com;
      font-src 'self' https://fonts.gstatic.com https://fonts.googleapis.com;
      connect-src 'self' https://*.midtrans.com https://*.sandbox.midtrans.com https://snap-popup-app.midtrans.com https://snap-popup-app.sandbox.midtrans.com https://*.google-analytics.com https://api.stack-auth.com https://app.stack-auth.com https://api.hexclave.com https://app.hexclave.com https://r.hexclave.com https://*.hexclave.com https://1.1.1.1 https://static.cloudflareinsights.com https://cloudflare.com https://*.cloudflare.com https://unpkg.com https://cdn.jsdelivr.net;
      frame-src 'self' * https://*.midtrans.com https://*.sandbox.midtrans.com https://snap-popup-app.midtrans.com https://snap-popup-app.sandbox.midtrans.com;
      worker-src 'self' blob:;
    `.replace(/\s{2,}/g, ' ').trim();

    return [
      {
        source: '/((?!sitemap\\.xml|sitemap\\.xsl|robots\\.txt|manifest\\.webmanifest|.*\\.png|.*\\.ico).*)',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: defaultCSP
          }
        ],
      },
      {
        source: '/:locale?/(view-design|portfolio)/:slug*',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: `
              default-src * 'unsafe-inline' 'unsafe-eval' data: blob:;
              script-src * 'unsafe-inline' 'unsafe-eval' data: blob:;
              style-src * 'unsafe-inline' data:;
              img-src * data: blob:;
              media-src * data: blob:;
              font-src * data:;
              frame-src *;
              connect-src *;
            `.replace(/\s{2,}/g, ' ').trim()
          }
        ],
      },
      {
        source: '/api/:path*',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: `
              default-src * 'unsafe-inline' 'unsafe-eval' data: blob:;
              script-src * 'unsafe-inline' 'unsafe-eval' data: blob:;
              style-src * 'unsafe-inline' data:;
              img-src * data: blob:;
              media-src * data: blob:;
              font-src * data:;
              frame-src *;
              connect-src *;
            `.replace(/\s{2,}/g, ' ').trim()
          }
        ],
      },
      {
        source: '/sw.js',
        headers: [
          {
            key: 'Cache-Control',
            value: 'no-cache, no-store, must-revalidate',
          },
          {
            key: 'Service-Worker-Allowed',
            value: '/',
          },
        ],
      },
    ];
  },
};

const bundleAnalyzer = withBundleAnalyzer({
  enabled: process.env.ANALYZE === 'true',
});

export default bundleAnalyzer(withNextIntl(nextConfig));

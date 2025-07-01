// eslint-disable-next-line @typescript-eslint/no-require-imports
const runtimeCaching = require('next-pwa/cache');

// eslint-disable-next-line @typescript-eslint/no-require-imports
const withPWA = require('next-pwa')({
   dest: 'public',
   disable: process.env.NODE_ENV === 'development',
   register: true,
   skipWaiting: true,
});

// eslint-disable-next-line @typescript-eslint/no-require-imports
const withBundleAnalyzer = require('@next/bundle-analyzer')({
   enabled: process.env.ANALYZE === 'true',
   openAnalyzer: true,
});

/** @type {import('next').NextConfig} */
const nextConfig = {
   reactStrictMode: true,
   poweredByHeader: false,
   images: {
      minimumCacheTTL: 60,
      disableStaticImages: true,
      domains: ['media.graphassets.com', 'sa-east-1.graphassets.com'],
      remotePatterns: [
         {
            protocol: 'https',
            hostname: 'media.graphassets.com',
            port: '',
         },
         {
            protocol: 'https',
            hostname: 'sa-east-1.graphassets.com',
            port: '',
         },
         {
            protocol: 'https',
            hostname: 'picsum.photos',
            port: '',
         },
      ],
   },
   pwa: {
      dest: 'public',
      runtimeCaching,
   },
};

module.exports = withBundleAnalyzer(withPWA(nextConfig));

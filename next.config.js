// eslint-disable-next-line @typescript-eslint/no-require-imports
const withPWA = require('next-pwa')({
   dest: 'public',
   disable: process.env.NODE_ENV === 'development',
   register: true,
   skipWaiting: true,
});

/** @type {import('next').NextConfig} */
const nextConfig = {
   images: {
      minimumCacheTTL: 60,
      disableStaticImages: true,
      remotePatterns: [
         {
            protocol: 'https',
            hostname: 'media.graphassets.com',
            port: '',
         },
         {
            protocol: 'https',
            hostname: 'picsum.photos',
            port: '',
         },
      ],
   },
   // withPWA,
   // pwa: {
   //    disabled: process.env.NODE_ENV !== 'production',
   //    dest: 'public',
   //    register: true,
   //    sw: 'sw.js',
   // },
};

module.exports = withPWA(nextConfig);

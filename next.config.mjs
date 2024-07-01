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
};

export default nextConfig;

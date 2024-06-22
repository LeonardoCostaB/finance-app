/** @type {import('next').NextConfig} */
const nextConfig = {
   images: {
      minimumCacheTTL: 60,
      disableStaticImages: true,
      remotePatterns: [
        {
          protocol: 'https',
          hostname: 'instagram.fgig14-2.fna.fbcdn.net',
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

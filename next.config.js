/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  output: 'standalone',
  poweredByHeader: false,
  experimental: {
    serverComponentsExternalPackages: ['bangla-date-converter'],
  },
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'app.shottyodharaprotidin.com' },
      { protocol: 'https', hostname: 'shottyodharaprotidin.com' },
    ],
    formats: ['image/avif', 'image/webp'],
    minimumCacheTTL: 3600,
  },
  
};

  

module.exports = nextConfig;

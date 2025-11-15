/** @type {import('next').NextConfig} */
const nextConfig = {
  allowedDevOrigins: [
    '*.replit.dev',
    '*.repl.co',
    '127.0.0.1',
    'localhost'
  ],
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
    unoptimized: false,
    formats: ['image/avif', 'image/webp'],
  },
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://localhost:4000/api/:path*',
      },
    ];
  },
}

module.exports = nextConfig


import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'crm.h-mitsu.com',
        pathname: '/storage/**',
      },
      {
        protocol: 'https',
        hostname: 'crm.st-online.jp',
        pathname: '/storage/**',
      },
    ],
  },
}

export default nextConfig

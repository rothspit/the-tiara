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
      {
        protocol: 'https',
        hostname: 'crm.h-mitsu.com',
        pathname: '/cast-media/**',
      },
      {
        protocol: 'https',
        hostname: 'crm.st-online.jp',
        pathname: '/cast-media/**',
      },
    ],
  },
}

export default nextConfig

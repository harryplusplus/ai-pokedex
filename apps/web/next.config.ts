import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  reactCompiler: true,
  images: {
    remotePatterns: [new URL('https://*.googleusercontent.com/**')],
  },
  serverExternalPackages: ['@repo/server'],
}

export default nextConfig

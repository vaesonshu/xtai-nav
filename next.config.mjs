import bundleAnalyzer from '@next/bundle-analyzer'

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'img.clerk.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'github.com',
        port: '',
        pathname: '/**',
      },
    ],
  },
  output: 'standalone',
}

// 仅在 ANALYZE=true 时挂载 analyzer，避免向默认 Turbopack 构建注入 webpack 配置
const withBundleAnalyzer = bundleAnalyzer({
  enabled: process.env.ANALYZE === 'true',
})

export default process.env.ANALYZE === 'true'
  ? withBundleAnalyzer(nextConfig)
  : nextConfig

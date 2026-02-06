/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable Vercel Analytics and Speed Insights
  experimental: {
    serverActions: {
      allowedOrigins: ['qosmos.one', 'www.qosmos.one']
    }
  }
}

module.exports = nextConfig

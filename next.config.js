/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  env: {
    // Make env variables accessible at runtime
  },
  // Ensure environment variables from .env.local are properly loaded
  publicRuntimeConfig: {
    // Will be available on both client and server
    NEXT_PUBLIC_ORGANIZATION: process.env.NEXT_PUBLIC_ORGANIZATION,
    NEXT_PUBLIC_TEAMS: process.env.NEXT_PUBLIC_TEAMS,
    NEXT_PUBLIC_TEAM: process.env.NEXT_PUBLIC_TEAM,
    NEXT_PUBLIC_DEFAULT_ORG: process.env.NEXT_PUBLIC_DEFAULT_ORG,
    NEXT_PUBLIC_DEFAULT_TEAM: process.env.NEXT_PUBLIC_DEFAULT_TEAM,
  },
}

module.exports = nextConfig

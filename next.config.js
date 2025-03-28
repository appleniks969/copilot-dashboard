/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  
  // Next.js automatically loads .env.local, but we can provide defaults here
  env: {
    // These will be available at build time and runtime as process.env.NEXT_PUBLIC_*
    NEXT_PUBLIC_ORGANIZATION: process.env.NEXT_PUBLIC_ORGANIZATION,
    NEXT_PUBLIC_TEAMS: process.env.NEXT_PUBLIC_TEAMS
  }
}

module.exports = nextConfig
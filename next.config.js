/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  
  // Next.js automatically loads .env.local - no need to duplicate in env section
  // The env section below was causing circular references
}

module.exports = nextConfig
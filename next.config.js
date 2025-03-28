/** @type {import('next').NextConfig} */
require('dotenv').config({ path: '.env.local' });

const nextConfig = {
  reactStrictMode: true,
  // NEXT_PUBLIC_ variables are automatically made available
  // by Next.js when defined in .env.local (or other .env files)
  // and do not need to be explicitly passed here.
  // The require('dotenv').config() line above ensures they are loaded
  // during the build process.
}

module.exports = nextConfig

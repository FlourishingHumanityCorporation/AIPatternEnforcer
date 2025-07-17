/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable React strict mode for better development experience
  reactStrictMode: true,

  // Experimental features
  experimental: {
    // Enable server actions for AI interactions
    serverActions: {
      bodySizeLimit: "2mb",
    },
  },

  // Image optimization
  images: {
    domains: ["localhost"],
  },

  // Environment variables that should be available in the browser
  env: {
    NEXT_PUBLIC_APP_URL:
      process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
  },
};

module.exports = nextConfig;

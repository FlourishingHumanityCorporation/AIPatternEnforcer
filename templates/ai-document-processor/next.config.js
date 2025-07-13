/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: [
      'pdf-parse',
      'tesseract.js',
      '@xenova/transformers'
    ]
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
  webpack: (config, { isServer }) => {
    // Handle native dependencies
    if (isServer) {
      config.externals.push('canvas', 'sharp');
    }
    
    // Handle PDF and image processing
    config.resolve.alias = {
      ...config.resolve.alias,
      canvas: false,
    };

    return config;
  },
  // Enable standalone output for better deployment
  output: 'standalone',
}

module.exports = nextConfig;
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'firebasestorage.googleapis.com',
      },
    ],
  },
  transpilePackages: ['undici', 'firebase', '@firebase/auth', '@firebase/storage', '@firebase/app'],
  webpack: (config, { isServer }) => {
    // Exclure le dossier firebase/functions du build
    config.watchOptions = {
      ...config.watchOptions,
      ignored: ['**/node_modules', '**/firebase/functions/**'],
    }
    return config
  },
}

module.exports = nextConfig

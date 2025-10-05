import withSerwistInit from "@serwist/next";

const withSerwist = withSerwistInit({
  swSrc: "src/utils/sw.ts",
  swDest: "public/sw.js",
  disable: process.env.NODE_ENV === 'development',
});

export default withSerwist({
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'img.youtube.com',
      },
      {
        protocol: 'https',
        hostname: '**.fint.app',
      },
      {
        protocol: 'https',
        hostname: 'api.fint.app',
      },
    ],
  },
  eslint: {
    ignoreDuringBuilds: false,
  },
  typescript: {
    ignoreBuildErrors: false,
  },
  experimental: {
    optimizePackageImports: ['lucide-react', 'remixicon'],
  },
});
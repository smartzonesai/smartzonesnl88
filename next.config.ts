import type { NextConfig } from 'next';
import { resolve } from 'path';

const nextConfig: NextConfig = {
  // Vercel Pro: extend function timeout for AI analysis (needs 300s)
  // Set in vercel.json or via Vercel dashboard for individual functions
  outputFileTracingRoot: resolve(__dirname),
  images: {
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048],
  },
  experimental: {
    serverActions: {
      bodySizeLimit: '500mb',
    },
  },
  serverExternalPackages: ['@anthropic-ai/sdk', 'sharp', 'fluent-ffmpeg', '@ffmpeg-installer/ffmpeg'],
};

export default nextConfig;

import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
    // Removed output: 'export' to allow for server-side rendering
    // Removed basePath and assetPrefix for standard web deployment
    images: {
        // Removed unoptimized: true since we're not doing static export
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'placehold.co',
                port: '',
                pathname: '/**',
            },
            {
                protocol: 'https',
                hostname: 'images.unsplash.com',
                port: '',
                pathname: '/**',
            },
            {
                protocol: 'https',
                hostname: 'picsum.photos',
                port: '',
                pathname: '/**',
            },
        ],
    },

    /* config options here */
    typescript: {
        ignoreBuildErrors: true,
    },
    eslint: {
        ignoreDuringBuilds: true,
    },
};

export default nextConfig;
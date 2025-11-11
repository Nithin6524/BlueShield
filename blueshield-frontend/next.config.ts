import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  

  // Ensure proper static generation
  output: 'standalone',
  
  // Image optimization
  images: {
    unoptimized: true,
  },
  
  // Disable strict mode for better compatibility
  reactStrictMode: false,
  
  // Ensure proper transpilation of node_modules
  transpilePackages: ['leaflet', 'react-leaflet'],
};

export default nextConfig;

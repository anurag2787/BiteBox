/** @type {import('next').NextConfig} */
const nextConfig = {

    // next.config.js
    images: {
      domains: ['images.unsplash.com','ih0.redbubble.net'],
      
    },
    trailingSlash: true,
    reactStrictMode: false,
    images: {
      unoptimized: true,
    },
  
};

export default nextConfig;

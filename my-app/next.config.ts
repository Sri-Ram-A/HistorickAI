import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  // added by me below 2 lines
  images: {
    domains: ['assets.aceternity.com', 'upload.wikimedia.org', "images.unsplash.com"], // Add wikimedia.org to the list
  },
};

export default nextConfig;

import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    qualities: [74, 75, 100],

    remotePatterns: [
    {
        protocol: "https",
        hostname: "static.cdnlogo.com",
      },
      {
        protocol: "https",
        hostname: "example.com",
      },

      {
        protocol: "https",
        hostname: "res.cloudinary.com",
      },

      {
        protocol: "https",
        hostname: "img.icons8.com",
      },

      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
        port: "",
        pathname: "/**",
      },

      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },

      {
        protocol: "https",
        hostname: "cdn.pixabay.com",
      },
    ],
  },
};

export default nextConfig;
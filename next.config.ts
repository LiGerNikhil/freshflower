import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "api.floraindia.com" },
      { protocol: "https", hostname: "encrypted-tbn0.gstatic.com" },
      { protocol: "https", hostname: "www.gardendesign.com" },
      { protocol: "https", hostname: "m.media-amazon.com" },
      { protocol: "https", hostname: "cdn.giftlaya.com" },
      { protocol: "https", hostname: "suluzorchids.com" },
      { protocol: "https", hostname: "static.vecteezy.com" },
      { protocol: "https", hostname: "plus.unsplash.com" },
      { protocol: "https", hostname: "content.jdmagicbox.com" },
      { protocol: "https", hostname: "png.pngtree.com" },
      { protocol: "https", hostname: "fiorellaindia.com" },
      { protocol: "https", hostname: "assets.simpleviewinc.com" },
    ],
  },
};

export default nextConfig;

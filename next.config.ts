import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // pdf-parse pulls in pdfjs-dist (with its own worker); keep it out of the
  // bundle so it runs as a normal Node dependency in the API route.
  serverExternalPackages: ["pdf-parse"],
};

export default nextConfig;

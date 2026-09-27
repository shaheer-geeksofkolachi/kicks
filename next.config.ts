import type { NextConfig } from "next";
import { buildS3PublicUrlBase } from "./lib/s3-config";

const nextConfig: NextConfig = {
  env: {
    /** Derived at build from AWS_S3_BUCKET + AWS_REGION (no NEXT_PUBLIC_AWS_REGION needed). */
    NEXT_PUBLIC_S3_PUBLIC_URL_BASE: buildS3PublicUrlBase(),
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.amazonaws.com",
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;

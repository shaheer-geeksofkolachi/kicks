/** Server-side S3 settings (use AWS_REGION + AWS_S3_BUCKET on Vercel). */

export function readAwsRegion(): string {
  return (process.env.AWS_REGION || process.env.AWS_S3_REGION || "").trim();
}

export function readAwsBucket(): string {
  return (process.env.AWS_S3_BUCKET || "").trim();
}

/**
 * Base URL for public object URLs (no trailing slash).
 * Built from AWS_S3_BUCKET + AWS_REGION unless overridden.
 */
export function buildS3PublicUrlBase(): string {
  const custom =
    process.env.NEXT_PUBLIC_S3_PUBLIC_URL_BASE?.trim() ||
    process.env.AWS_S3_PUBLIC_URL_BASE?.trim();
  if (custom) return custom.replace(/\/$/, "");

  const bucket = readAwsBucket();
  const region = readAwsRegion();
  if (bucket && region) {
    if (region === "us-east-1") {
      return `https://${bucket}.s3.amazonaws.com`;
    }
    return `https://${bucket}.s3.${region}.amazonaws.com`;
  }

  // Deprecated — prefer AWS_REGION + AWS_S3_BUCKET
  const legacyBucket = process.env.NEXT_PUBLIC_AWS_S3_BUCKET?.trim();
  const legacyRegion = process.env.NEXT_PUBLIC_AWS_REGION?.trim();
  if (legacyBucket && legacyRegion) {
    if (legacyRegion === "us-east-1") {
      return `https://${legacyBucket}.s3.amazonaws.com`;
    }
    return `https://${legacyBucket}.s3.${legacyRegion}.amazonaws.com`;
  }

  return "";
}

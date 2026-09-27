import {
  DeleteObjectsCommand,
  PutObjectCommand,
  S3Client,
  type S3ClientConfig,
} from "@aws-sdk/client-s3";
import { readAwsRegion } from "@/lib/s3-config";

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing environment variable: ${name}`);
  }
  return value;
}

/** Region for S3 API calls — must match the bucket's actual AWS region. */
export function getConfiguredS3Region(): string {
  const region = readAwsRegion();
  if (!region) {
    throw new Error(
      "Missing AWS_REGION. Set it on Vercel to your bucket region (AWS Console → S3 → bucket → Properties).",
    );
  }
  return region;
}

export function getS3BucketName(): string {
  return requireEnv("AWS_S3_BUCKET");
}

let cachedS3Region: string | null = null;

function getS3Credentials() {
  return {
    accessKeyId: requireEnv("AWS_ACCESS_KEY_ID"),
    secretAccessKey: requireEnv("AWS_SECRET_ACCESS_KEY"),
  };
}

function buildS3ClientConfig(region: string): S3ClientConfig {
  const config: S3ClientConfig = {
    region,
    credentials: getS3Credentials(),
  };

  const endpoint = process.env.AWS_S3_ENDPOINT?.trim();
  if (endpoint) {
    config.endpoint = endpoint;
    if (process.env.AWS_S3_FORCE_PATH_STYLE === "true") {
      config.forcePathStyle = true;
    }
  }

  return config;
}

export function getS3Client(region?: string): S3Client {
  const resolved = region ?? cachedS3Region ?? getConfiguredS3Region();
  return new S3Client(buildS3ClientConfig(resolved));
}

/** AWS returns this when the SDK region does not match the bucket region. */
function parseBucketRegionFromS3Error(error: unknown): string | null {
  if (!error || typeof error !== "object") return null;

  const record = error as Record<string, unknown>;
  const endpoint =
    (typeof record.Endpoint === "string" ? record.Endpoint : "") ||
    (typeof record.endpoint === "string" ? record.endpoint : "");
  const message = error instanceof Error ? error.message : String(record.message ?? "");
  const haystack = `${endpoint} ${message}`;

  const regional = haystack.match(/\.s3[.-]([a-z0-9-]+)\.amazonaws\.com/i);
  if (regional?.[1] && regional[1] !== "amazonaws") return regional[1];

  if (/\.s3\.amazonaws\.com/i.test(haystack) && !/\.s3\.[a-z]{2}-/.test(haystack)) {
    return "us-east-1";
  }

  return null;
}

function enrichS3EndpointError(error: unknown): Error {
  if (error instanceof Error && error.message.includes("specified endpoint")) {
    const configured = getConfiguredS3Region();
    return new Error(
      `${error.message} Your AWS_REGION is "${configured}". Set AWS_REGION on Vercel to the bucket region (AWS Console → S3 → bucket → Properties), then redeploy.`,
    );
  }
  return error instanceof Error ? error : new Error(String(error));
}

async function withS3RegionRetry<T>(run: (client: S3Client) => Promise<T>): Promise<T> {
  const initial = cachedS3Region ?? getConfiguredS3Region();

  try {
    return await run(getS3Client(initial));
  } catch (error) {
    const corrected = parseBucketRegionFromS3Error(error);
    if (corrected && corrected !== initial) {
      cachedS3Region = corrected;
      try {
        return await run(getS3Client(corrected));
      } catch (retryError) {
        throw enrichS3EndpointError(retryError);
      }
    }
    throw enrichS3EndpointError(error);
  }
}

export async function uploadToS3(key: string, body: Buffer, contentType?: string) {
  await withS3RegionRetry((client) =>
    client.send(
      new PutObjectCommand({
        Bucket: getS3BucketName(),
        Key: key,
        Body: body,
        ContentType: contentType || "application/octet-stream",
      }),
    ),
  );
}

export async function deleteFromS3(keys: string[]) {
  if (!keys.length) return;
  await withS3RegionRetry((client) =>
    client.send(
      new DeleteObjectsCommand({
        Bucket: getS3BucketName(),
        Delete: {
          Objects: keys.map((Key) => ({ Key })),
          Quiet: true,
        },
      }),
    ),
  );
}

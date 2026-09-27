import {
  DeleteObjectsCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing environment variable: ${name}`);
  }
  return value;
}

export function getS3BucketName(): string {
  return requireEnv("AWS_S3_BUCKET");
}

export function getS3Client(): S3Client {
  return new S3Client({
    region: requireEnv("AWS_REGION"),
    credentials: {
      accessKeyId: requireEnv("AWS_ACCESS_KEY_ID"),
      secretAccessKey: requireEnv("AWS_SECRET_ACCESS_KEY"),
    },
  });
}

export async function uploadToS3(key: string, body: Buffer, contentType?: string) {
  const client = getS3Client();
  await client.send(
    new PutObjectCommand({
      Bucket: getS3BucketName(),
      Key: key,
      Body: body,
      ContentType: contentType || "application/octet-stream",
    }),
  );
}

export async function deleteFromS3(keys: string[]) {
  if (!keys.length) return;
  const client = getS3Client();
  await client.send(
    new DeleteObjectsCommand({
      Bucket: getS3BucketName(),
      Delete: {
        Objects: keys.map((Key) => ({ Key })),
        Quiet: true,
      },
    }),
  );
}

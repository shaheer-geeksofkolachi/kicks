import { PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { getS3BucketName, getS3Client } from "@/lib/s3";

const PRESIGN_EXPIRES_SECONDS = 600;

export async function createPresignedProductUploadUrl(
  storagePath: string,
  contentType: string,
): Promise<string> {
  const command = new PutObjectCommand({
    Bucket: getS3BucketName(),
    Key: storagePath,
    ContentType: contentType || "application/octet-stream",
  });
  return getSignedUrl(getS3Client(), command, { expiresIn: PRESIGN_EXPIRES_SECONDS });
}

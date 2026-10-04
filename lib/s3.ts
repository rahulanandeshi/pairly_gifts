import "server-only";
import { S3Client, PutObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const BUCKET = process.env.AWS_S3_BUCKET!;

const s3 = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

// The bucket blocks all public access, so objects are stored by key only —
// nothing is ever readable via a direct https://<bucket>.s3... URL. Callers
// persist the key (not a URL) and call getPlaybackUrl() fresh at render time.
export async function uploadObject(key: string, body: Buffer, contentType: string) {
  await s3.send(new PutObjectCommand({ Bucket: BUCKET, Key: key, Body: body, ContentType: contentType }));
  return key;
}

export async function getPlaybackUrl(key: string, expiresIn = 3600) {
  return getSignedUrl(s3, new GetObjectCommand({ Bucket: BUCKET, Key: key }), { expiresIn });
}

export function buildKey(folder: string, userId: string, filename: string) {
  const safeName = filename.replace(/[^a-zA-Z0-9._-]/g, "_");
  return `${folder}/${userId}/${Date.now()}-${safeName}`;
}

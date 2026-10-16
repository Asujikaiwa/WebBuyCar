import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { randomUUID } from "crypto";

// S3 client — ใช้ได้ทั้ง AWS S3 และ Cloudflare R2 (R2 รองรับ S3 API)
const s3 = new S3Client({
  region: process.env.S3_REGION ?? "auto",
  endpoint: process.env.S3_ENDPOINT || undefined, // R2 ต้องระบุ endpoint
  credentials: {
    accessKeyId: process.env.S3_ACCESS_KEY ?? "",
    secretAccessKey: process.env.S3_SECRET_KEY ?? "",
  },
  forcePathStyle: true,
});

const BUCKET = process.env.S3_BUCKET ?? "usedcars-media";
const PUBLIC_BASE = process.env.S3_PUBLIC_BASE_URL ?? "";

/**
 * สร้าง presigned URL สำหรับให้ client อัปโหลดรูปตรงไป storage
 * (ไม่ผ่าน server → ประหยัด bandwidth และ scale ได้ดี)
 */
export async function createPresignedUpload(contentType: string) {
  const ext = contentType.split("/")[1] ?? "jpg";
  const key = `listings/${new Date().getFullYear()}/${randomUUID()}.${ext}`;

  const command = new PutObjectCommand({ Bucket: BUCKET, Key: key, ContentType: contentType });
  const uploadUrl = await getSignedUrl(s3, command, { expiresIn: 60 }); // หมดอายุใน 60 วินาที
  const publicUrl = `${PUBLIC_BASE}/${key}`;

  return { uploadUrl, publicUrl, key };
}

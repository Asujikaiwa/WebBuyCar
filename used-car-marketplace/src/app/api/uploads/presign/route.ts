import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createPresignedUpload } from "@/lib/storage";
import { getSession } from "@/lib/session";

// POST /api/uploads/presign — ขอ URL สำหรับอัปโหลดรูป (ต้อง login)
const schema = z.object({
  contentType: z.string().regex(/^image\/(jpeg|png|webp|avif)$/),
});

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const parsed = schema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "ชนิดไฟล์ไม่รองรับ" }, { status: 400 });
  }

  const result = await createPresignedUpload(parsed.data.contentType);
  return NextResponse.json(result);
}

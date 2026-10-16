import createNextIntlPlugin from "next-intl/plugin";

// ชี้ไปไฟล์ config ของ next-intl
const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // สร้าง output แบบ standalone → Docker image เล็ก รันด้วย node server.js ได้เลย
  output: "standalone",
  images: {
    // อนุญาตโหลดรูปจาก object storage / image CDN (ปรับ host ตามจริง)
    remotePatterns: [
      { protocol: "https", hostname: "**.r2.cloudflarestorage.com" },
      { protocol: "https", hostname: "**.amazonaws.com" },
      { protocol: "https", hostname: "images.unsplash.com" },
    ],
    formats: ["image/avif", "image/webp"],
  },
};

export default withNextIntl(nextConfig);

import { prisma } from "@/lib/prisma";

// ล้างทุกตาราง (ใช้ก่อนแต่ละ test) — CASCADE จัดการ FK ให้
// ⚠️ รันกับ TEST database เท่านั้น (ดู guard RUN_DB_TESTS ในไฟล์ test)
export async function resetDb() {
  await prisma.$executeRawUnsafe(`
    TRUNCATE TABLE
      "Message","Conversation","ListingImage","Favorite",
      "FinancingRequest","Report","Order","Listing",
      "DealerProfile","User","Package","ValuationRule"
    RESTART IDENTITY CASCADE
  `);
}

// สร้างผู้ใช้สำหรับ test
export function createUser(overrides: Partial<{ email: string; role: "BUYER" | "SELLER" | "DEALER" | "ADMIN" }> = {}) {
  const email = overrides.email ?? `user_${Math.random().toString(36).slice(2)}@test.local`;
  return prisma.user.create({
    data: { email, name: "Test User", role: overrides.role ?? "BUYER", passwordHash: "x" },
  });
}

// สร้างประกาศที่เผยแพร่แล้ว
export function createPublishedListing(sellerId: string, overrides: Partial<{ make: string; priceCents: number }> = {}) {
  return prisma.listing.create({
    data: {
      sellerId,
      make: overrides.make ?? "Toyota",
      model: "Vios",
      year: 2020,
      mileage: 30000,
      transmission: "AUTO",
      fuelType: "GASOLINE",
      priceCents: overrides.priceCents ?? 50000000,
      province: "กรุงเทพมหานคร",
      title: `${overrides.make ?? "Toyota"} Vios 2020`,
      description: "สภาพดี",
      status: "PUBLISHED",
    },
  });
}

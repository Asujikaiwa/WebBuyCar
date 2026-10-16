import { prisma } from "@/lib/prisma";

// รวม quota ประกาศจากแพ็กเกจที่ยังไม่หมดอายุของผู้ใช้
export async function getListingQuota(userId: string): Promise<number> {
  const now = new Date();
  const activeOrders = await prisma.order.findMany({
    where: { userId, status: "PAID", expiresAt: { gt: now } },
    include: { package: true },
  });
  return activeOrders.reduce((sum, o) => sum + o.package.listingQuota, 0);
}

// นับประกาศที่ยัง active อยู่ (ไม่นับที่ขายแล้ว/ถูกปฏิเสธ)
export async function countActiveListings(userId: string): Promise<number> {
  return prisma.listing.count({
    where: { sellerId: userId, status: { in: ["PENDING", "PUBLISHED", "PAUSED"] } },
  });
}

// เช็คว่าผู้ใช้ลงประกาศเพิ่มได้ไหม
// BUYER/SELLER ทั่วไป: ฟรี 1 ประกาศ; DEALER: ตาม quota ที่ซื้อ
export async function canCreateListing(userId: string, role: string): Promise<boolean> {
  const used = await countActiveListings(userId);
  if (role === "DEALER") {
    const quota = await getListingQuota(userId);
    return used < quota;
  }
  const FREE_QUOTA = 1;
  return used < FREE_QUOTA;
}

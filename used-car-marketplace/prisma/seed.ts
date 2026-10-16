import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

// ข้อมูลตัวอย่างสำหรับ dev/demo
async function main() {
  const passwordHash = await bcrypt.hash("password123", 10);

  const dealer = await prisma.user.upsert({
    where: { email: "dealer@example.com" },
    update: {},
    create: {
      email: "dealer@example.com",
      passwordHash,
      name: "เต็นท์รถคุณภาพ",
      phone: "081-234-5678",
      role: "DEALER",
      dealerProfile: { create: { shopName: "Quality Cars", province: "กรุงเทพมหานคร", verified: true } },
    },
  });

  await prisma.package.createMany({
    data: [
      { name: "Starter", priceCents: 99000, listingQuota: 10, durationDays: 30, promotes: false },
      { name: "Pro", priceCents: 299000, listingQuota: 50, durationDays: 30, promotes: true },
    ],
    skipDuplicates: true,
  });

  const cars = [
    { make: "Toyota", model: "Vios", year: 2019, mileage: 45000, price: 459000, fuelType: "GASOLINE" as const, transmission: "AUTO" as const, province: "กรุงเทพมหานคร", img: "https://images.unsplash.com/photo-1549317661-bd32c8ce0db2" },
    { make: "Honda", model: "Civic", year: 2020, mileage: 32000, price: 789000, fuelType: "GASOLINE" as const, transmission: "AUTO" as const, province: "นนทบุรี", img: "https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6" },
    { make: "Mazda", model: "CX-5", year: 2018, mileage: 68000, price: 729000, fuelType: "DIESEL" as const, transmission: "AUTO" as const, province: "ชลบุรี", img: "https://images.unsplash.com/photo-1503376780353-7e6692767b70" },
    { make: "Tesla", model: "Model 3", year: 2022, mileage: 21000, price: 1590000, fuelType: "EV" as const, transmission: "AUTO" as const, province: "กรุงเทพมหานคร", img: "https://images.unsplash.com/photo-1560958089-b8a1929cea89" },
  ];

  for (const c of cars) {
    await prisma.listing.create({
      data: {
        sellerId: dealer.id,
        make: c.make,
        model: c.model,
        year: c.year,
        mileage: c.mileage,
        transmission: c.transmission,
        fuelType: c.fuelType,
        priceCents: c.price * 100,
        province: c.province,
        title: `${c.make} ${c.model} ${c.year}`,
        description: `${c.make} ${c.model} ปี ${c.year} สภาพดี เลขไมล์ ${c.mileage.toLocaleString()} กม. ตรวจเช็คศูนย์ พร้อมโอน`,
        status: "PUBLISHED",
        images: { create: [{ url: `${c.img}?w=800`, order: 0 }] },
      },
    });
  }

  console.log("✅ Seed completed");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());

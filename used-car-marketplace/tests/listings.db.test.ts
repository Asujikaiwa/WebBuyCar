import { describe, it, expect, beforeAll, afterAll, beforeEach, vi } from "vitest";

// Mock เฉพาะ session (NextAuth) — ส่วน prisma/packages ใช้ DB จริง
const sessionMock = vi.hoisted(() => ({ getSession: vi.fn(), getAdminSession: vi.fn() }));
vi.mock("@/lib/session", () => sessionMock);

import { prisma } from "@/lib/prisma";
import { GET, POST } from "@/app/api/listings/route";
import { resetDb, createUser, createPublishedListing } from "./helpers/db";

function postReq(body: unknown) {
  return new Request("http://localhost/api/listings", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  }) as any;
}
function getReq(qs = "") {
  return new Request(`http://localhost/api/listings${qs}`) as any;
}

const validListing = {
  make: "Honda", model: "Civic", year: 2021, mileage: 20000,
  transmission: "AUTO", fuelType: "GASOLINE", price: 700000,
  province: "นนทบุรี", title: "Honda Civic 2021", description: "สวยมาก", imageUrls: [],
};

// รันเฉพาะเมื่อมี TEST database จริง (กันลบข้อมูล prod โดยไม่ตั้งใจ)
// รัน: RUN_DB_TESTS=1 DATABASE_URL=postgres://.../usedcars_test npm run test:db
describe.runIf(process.env.RUN_DB_TESTS === "1")("listings API (DB integration)", () => {
  beforeAll(async () => {
    await prisma.$connect();
  });
  afterAll(async () => {
    await prisma.$disconnect();
  });
  beforeEach(async () => {
    await resetDb();
    sessionMock.getSession.mockReset();
  });

  it("GET คืนเฉพาะประกาศที่ PUBLISHED", async () => {
    const seller = await createUser({ role: "DEALER" });
    await createPublishedListing(seller.id, { make: "Toyota" });
    // ประกาศที่ยัง PENDING ต้องไม่ถูกแสดง
    await prisma.listing.create({
      data: {
        sellerId: seller.id, make: "Mazda", model: "2", year: 2019, mileage: 40000,
        transmission: "AUTO", fuelType: "GASOLINE", priceCents: 40000000,
        province: "ชลบุรี", title: "Mazda 2", description: "x", status: "PENDING",
      },
    });

    const res = await GET(getReq());
    const data = await res.json();
    expect(data.total).toBe(1);
    expect(data.items[0].make).toBe("Toyota");
  });

  it("GET กรองตามช่วงราคาได้", async () => {
    const seller = await createUser({ role: "DEALER" });
    await createPublishedListing(seller.id, { priceCents: 30000000 }); // 300k
    await createPublishedListing(seller.id, { priceCents: 90000000 }); // 900k

    const res = await GET(getReq("?minPrice=500000"));
    const data = await res.json();
    expect(data.total).toBe(1);
    expect(data.items[0].priceCents).toBe(90000000);
  });

  it("POST สร้างประกาศได้เมื่อ login และอยู่ในโควต้า", async () => {
    const seller = await createUser({ role: "SELLER" });
    sessionMock.getSession.mockResolvedValue({ user: { id: seller.id, role: "SELLER" } });

    const res = await POST(postReq(validListing));
    expect(res.status).toBe(201);
    const created = await res.json();
    expect(created.status).toBe("PENDING"); // ต้องรออนุมัติ
    expect(await prisma.listing.count()).toBe(1);
  });

  it("POST คืน 402 เมื่อเกินโควต้าฟรีของผู้ใช้ทั่วไป", async () => {
    const seller = await createUser({ role: "SELLER" });
    sessionMock.getSession.mockResolvedValue({ user: { id: seller.id, role: "SELLER" } });

    const first = await POST(postReq(validListing));
    expect(first.status).toBe(201);
    // ประกาศที่ 2 ต้องโดนบล็อก (ฟรี 1 ประกาศ)
    const second = await POST(postReq(validListing));
    expect(second.status).toBe(402);
    const body = await second.json();
    expect(body.code).toBe("QUOTA_EXCEEDED");
  });

  it("POST คืน 401 เมื่อไม่ได้ login", async () => {
    sessionMock.getSession.mockResolvedValue(null);
    const res = await POST(postReq(validListing));
    expect(res.status).toBe(401);
  });
});

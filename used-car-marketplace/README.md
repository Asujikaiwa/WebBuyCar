# CarMarket — แพลตฟอร์มซื้อขายรถมือสอง (Used Car Marketplace)

โครงเริ่มต้น (starter scaffold) ของเว็บไซต์ marketplace รถมือสอง สร้างตาม prompt
ออกแบบให้ **scale ได้ระดับหลักหมื่น–หลักแสนผู้ใช้** และ **ต่อยอดเป็นแอปมือถือ** ในอนาคต

---

## 1. สถาปัตยกรรม & Tech Stack

| ชั้น | เทคโนโลยี | เหตุผล |
|------|-----------|--------|
| Frontend | **Next.js 14 (App Router) + TypeScript + Tailwind** | SSR/ISR ดีต่อ SEO (สำคัญมากกับ marketplace), component reuse กับ React Native ได้ |
| API | **Next.js Route Handlers** (เริ่ม) → แยกเป็น NestJS เมื่อโต | API-first → web + mobile ใช้ชุดเดียวกัน |
| Database | **PostgreSQL + Prisma ORM** | relational เหมาะกับข้อมูลรถ/ผู้ใช้/ออเดอร์, migration ชัดเจน |
| Search | PostgreSQL filter (เริ่ม) → **Meilisearch/Elasticsearch** | เริ่มเล็ก ต่อยอดเมื่อข้อมูลโต |
| Cache/Queue | **Redis + BullMQ** | cache, session, rate limit, งาน background |
| Media | **S3 / Cloudflare R2 + image CDN** (WebP/AVIF) | โหลดเร็ว, แยก storage ออกจาก server |
| Auth | **NextAuth (JWT + OAuth)** | รองรับ Google/Facebook/Line |
| Payments | **Stripe** (สากล) / **Omise · 2C2P** (ไทย) | แพ็กเกจดีลเลอร์ + โปรโมตประกาศ |

**หลักการ scale:** API แบบ stateless → ขยายแนวนอนได้, cache ด้วย Redis, รูปผ่าน CDN, index ฐานข้อมูลครบ (ดูใน `schema.prisma`)

---

## 2. Database Schema (สรุป)

ดูเต็มได้ที่ `prisma/schema.prisma` — โมเดลหลัก:

- **User / DealerProfile** — ผู้ใช้ 4 บทบาท (BUYER, SELLER, DEALER, ADMIN)
- **Listing / ListingImage** — ประกาศขายรถ + รูปหลายรูป + สถานะ + index สำหรับค้นหา
- **Favorite** — รายการโปรด
- **Conversation / Message** — ระบบแชตผู้ซื้อ-ผู้ขาย
- **Package / Order** — แพ็กเกจดีลเลอร์ + การชำระเงิน
- **FinancingRequest / ValuationRule** — ขอสินเชื่อ + ประเมินราคา
- **Report** — แจ้งประกาศผิดกฎ (สำหรับแอดมิน)

---

## 3. โครงสร้างโฟลเดอร์

```
used-car-marketplace/
├── prisma/
│   ├── schema.prisma        # นิยาม database ทั้งหมด
│   └── seed.ts              # ข้อมูลตัวอย่าง
├── src/
│   ├── app/
│   │   ├── layout.tsx       # โครง layout + เมนู
│   │   ├── page.tsx         # หน้าแรก + ค้นหา + ฟิลเตอร์
│   │   ├── listings/[id]/   # หน้ารายละเอียดรถ
│   │   ├── finance/         # หน้าคำนวณค่างวด
│   │   └── api/
│   │       ├── listings/        # GET (ค้นหา) / POST (ลงประกาศ) / [id]
│   │       └── finance/calculate/  # คำนวณค่างวด
│   ├── components/
│   │   └── ListingCard.tsx
│   └── lib/
│       ├── prisma.ts        # Prisma client singleton
│       └── finance.ts       # ฟังก์ชันคำนวณค่างวด + ประเมินราคา
└── (config: package.json, tsconfig, next.config, tailwind, .env.example)
```

---

## 4. เริ่มใช้งาน (Setup)

```bash
# 1. ติดตั้ง dependencies
npm install

# 2. ตั้งค่า env (คัดลอกแล้วแก้ค่า)
cp .env.example .env

# 3. เตรียม PostgreSQL (เช่น docker run -e POSTGRES_PASSWORD=postgres -p 5432:5432 -d postgres)
#    แล้ว push schema + ใส่ข้อมูลตัวอย่าง
npm run db:push
npm run db:seed

# 4. รัน dev server
npm run dev
# เปิด http://localhost:3000
```

> **ฟีเจอร์ที่ทำงานได้แล้วใน scaffold นี้:**
> - หน้าแรก + ค้นหา/กรอง, หน้ารายละเอียดรถ + รถที่คล้ายกัน
> - เครื่องคำนวณค่างวด (แบบโต้ตอบทันที)
> - **ระบบ Auth จริง** (NextAuth: email/password + Google OAuth, JWT, RBAC)
> - **ลงประกาศ + อัปโหลดรูปขึ้น S3/R2** ผ่าน presigned URL (อัปโหลดตรงไป storage)
> - **แชต real-time** ผู้ซื้อ-ผู้ขาย ด้วย Pusher (private channel + auth)
> - **Admin dashboard**: ภาพรวมสถิติ, อนุมัติ/ปฏิเสธประกาศ, จัดการผู้ใช้
> - **ระบบจ่ายเงิน** (provider abstraction + Stripe): ซื้อแพ็กเกจดีลเลอร์, checkout, webhook,
>   จำกัดจำนวนประกาศตาม quota — เพิ่ม Omise/2C2P ได้โดย implement interface เดียวกัน
> - **i18n ไทย/อังกฤษ/จีน** (next-intl): แยก URL ตามภาษา `/th`, `/en`, `/zh` เพื่อ SEO,
>   prerender ทุกภาษา, สลับภาษาที่แถบเมนู (เปลี่ยน locale prefix ของ URL)
> - **ชุดทดสอบ** (Vitest): unit test สูตรไฟแนนซ์ + ตรวจ i18n key parity + integration test API
>
> หมายเหตุ: ต้องตั้งค่า env ของ S3/R2, Pusher และ Stripe จริงก่อนฟีเจอร์เหล่านั้นจะทำงาน

### หน้าสำคัญ
| เส้นทาง | คำอธิบาย |
|---------|----------|
| `/` | หน้าแรก + ค้นหา |
| `/listings/[id]` | รายละเอียดรถ + ปุ่มแชต/คำนวณค่างวด |
| `/sell` | ลงประกาศ + อัปโหลดรูป (ต้อง login) |
| `/finance` | คำนวณค่างวด |
| `/messages`, `/messages/[id]` | กล่องข้อความ + ห้องแชต real-time |
| `/packages` | แพ็กเกจดีลเลอร์ + ปุ่มซื้อ (ไป Stripe Checkout) |
| `/login`, `/register` | เข้าสู่ระบบ / สมัคร |
| `/admin`, `/admin/listings`, `/admin/users` | หลังบ้าน (เฉพาะ role ADMIN) |

> ตั้งผู้ใช้เป็นแอดมิน: `UPDATE "User" SET role = 'ADMIN' WHERE email = 'you@example.com';`

### Stripe webhook (ทดสอบ local)
```bash
# ติดตั้ง Stripe CLI แล้ว forward event มาที่เครื่อง
stripe listen --forward-to localhost:3000/api/webhooks/payment
# คัดลอก whsec_... ที่ได้ ไปใส่ STRIPE_WEBHOOK_SECRET ใน .env
```
ระบบจ่ายเงินออกแบบเป็น provider abstraction (`src/lib/payments/`) — เพิ่ม Omise/2C2P
ได้โดยสร้างไฟล์ใหม่ที่ implement interface `PaymentProvider` แล้วลงทะเบียนใน `index.ts`

---

## 5. แผนต่อยอด & การ Scale

**ทำเสร็จแล้ว:** auth จริง (NextAuth) · อัปโหลดรูป S3/R2 · แชต real-time (Pusher) · admin dashboard
**สิ่งที่ต้องทำต่อ (เฟส 1 ให้ครบ):** payment webhook (Stripe/Omise) เชื่อมแพ็กเกจดีลเลอร์ ·
ส่งคำขอสินเชื่อไป partner API จริง · ระบบแจ้งเตือน · i18n (next-intl) ไทย/อังกฤษ/จีน

**เมื่อผู้ใช้เพิ่มเป็นหลักหมื่น–หลักแสน:**
1. เปิด Redis cache สำหรับหน้า listing ยอดนิยม + rate limiting
2. ย้าย search ไป Meilisearch/Elasticsearch
3. แยก media ทั้งหมดไป object storage + CDN
4. รัน API หลาย instance หลัง load balancer (stateless อยู่แล้ว)
5. ใช้ read replica ของ PostgreSQL สำหรับงานอ่านหนัก
6. ติดตั้ง observability: Sentry (error), Prometheus/Grafana (metrics)

**เฟส 2 (เริ่มแล้ว):** แอปมือถือ (Expo + React Native) — โฟลเดอร์ [`../mobile/`](../mobile/README.md)
  - มี `/api/auth/mobile/login` (JWT) + `/api/users/push-token` + Bearer auth ใน `getSession()` ฝั่งเว็บแล้ว
  - มีหน้าจอ browse / detail / login / register / profile + push notification เด้งเมื่อมีข้อความใหม่
**เฟส 3:** ระบบแนะนำรถ, ML ประเมินราคา, ตรวจประวัติรถ, รีวิวดีลเลอร์

---

## 6. Deploy

### ตัวเลือก A — Vercel (เร็วสุด เหมาะกับเริ่มต้น)
1. push โค้ดขึ้น GitHub แล้ว import repo เข้า Vercel
2. ตั้ง Environment Variables ทั้งหมดจาก `.env.example` ใน Vercel dashboard
3. ใช้ **managed database** เช่น Neon / Supabase / Vercel Postgres (ใส่ `DATABASE_URL`)
4. Deploy — `prisma generate` รันอัตโนมัติผ่าน `postinstall`
5. รัน migration ครั้งแรก: `npx prisma migrate deploy` (ผ่านเครื่อง local ที่ชี้ DATABASE_URL ของ prod)
6. ตั้ง Stripe webhook ชี้มาที่ `https://<your-domain>/api/webhooks/payment`

> ไฟล์ `vercel.json` ตั้ง region เป็น `sin1` (สิงคโปร์ ใกล้ไทย) และ maxDuration ของ API = 30s

### ตัวเลือก B — Docker (self-host / AWS / GCP)
```bash
# รันครบชุด app + postgres + redis
docker compose up -d --build

# รัน migration ครั้งแรก
docker compose exec app npx prisma migrate deploy

# ใส่ข้อมูลตัวอย่าง (ถ้าต้องการ)
docker compose exec app npx tsx prisma/seed.ts
```
- `Dockerfile` เป็น multi-stage + Next.js standalone → image เล็ก รันด้วย non-root user
- ตรวจสถานะระบบที่ `GET /api/health` (ใช้กับ load balancer / uptime monitor)
- production จริงควรแยก Postgres/Redis ไปใช้ managed service และวาง app หลาย instance หลัง load balancer

### CI
`.github/workflows/ci.yml` รัน install → prisma generate → lint → build ทุก push/PR เข้า main

---

## 7. Test

```bash
npm test          # รันทั้งหมด (Vitest)
npm run test:watch
```
- `tests/finance.test.ts` — unit test สูตรคำนวณค่างวด + ประเมินราคา (ครอบเคส 0%, ดาวน์เต็ม, งวด 0)
- `tests/i18n.test.ts` — ตรวจว่า message 3 ภาษามี key ครบเท่ากันและไม่มีค่าว่าง
- `tests/finance-api.test.ts` — integration test เรียก route handler `/api/finance/calculate` จริง
- `tests/listings.db.test.ts` — **integration test แตะ DB จริง** (mock เฉพาะ session, ใช้ prisma จริง):
  ทดสอบ GET กรองสถานะ/ราคา, POST สร้างประกาศ, quota 402, และ 401 เมื่อไม่ login

รัน DB integration test (ต้องมี test database แยกต่างหาก — กันลบข้อมูลจริง):
```bash
# สร้าง schema ใน test DB ก่อน
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/usedcars_test npx prisma db push
# รัน test (RUN_DB_TESTS=1 เพื่อปลดล็อก, ชี้ DATABASE_URL ไป test DB)
RUN_DB_TESTS=1 DATABASE_URL=postgresql://postgres:postgres@localhost:5432/usedcars_test npm run test:db
```
> `npm test` จะข้ามไฟล์ `*.db.test.ts` โดยอัตโนมัติ (รันเฉพาะ unit/integration ที่ไม่ต้องใช้ DB)

---

## 8. i18n (next-intl)
- โครง routing อยู่ที่ `src/i18n/` (`routing.ts`, `request.ts`, `navigation.ts`) + `src/middleware.ts`
- ทุกหน้าอยู่ใต้ `src/app/[locale]/...` — URL จึงเป็น `/th/...`, `/en/...`, `/zh/...` (ดีต่อ SEO แยกภาษา)
- คลังคำแปล: `messages/{th,en,zh}.json` — เพิ่ม key ใหม่ต้องใส่ครบทั้ง 3 ไฟล์ (มี test คอยตรวจ)
- ใช้ `Link` / `useRouter` จาก `@/i18n/navigation` แทน `next/link` เพื่อให้คง locale ปัจจุบัน

# Prompt สั่ง AI สร้างเว็บไซต์ขายรถมือสอง (Used Car Marketplace)

> เอกสารนี้มี 3 ฉบับ: **ไทย** (ฉบับเต็ม) · **English** (Full) · **中文** (完整版)
> นำ prompt ไปวางใน AI coding tool ได้เลย เช่น Claude, Cursor, v0, Lovable, Bolt, GitHub Copilot Workspace ฯลฯ
> เริ่มที่ "เว็บก่อน" และออกแบบให้ "ต่อยอดเป็นแอปและรองรับผู้ใช้หลักหมื่น–หลักแสน" ได้

---

## 🇹🇭 ฉบับภาษาไทย (Prompt หลัก)

```text
บทบาทของคุณ (Role)
คุณคือ Senior Full-Stack Architect และทีมพัฒนา ที่จะช่วยฉันออกแบบและสร้าง
แพลตฟอร์มซื้อ-ขายรถยนต์มือสองออนไลน์ (Used Car Marketplace) ตั้งแต่ต้นจนใช้งานจริง
เป้าหมายเฟสแรกคือ "เว็บไซต์" ที่สมบูรณ์ ใช้งานได้จริง และวางสถาปัตยกรรมให้
ต่อยอดเป็น Mobile App (iOS/Android) ได้ในอนาคต โดยไม่ต้องเขียนใหม่ทั้งหมด

เป้าหมายหลัก (Goals)
1. สร้างเว็บไซต์ marketplace สำหรับลงประกาศและค้นหารถมือสอง
2. รองรับผู้ใช้พร้อมกันได้ระดับหลักหมื่นถึงหลักแสน (scalable)
3. โครงสร้างต้องต่อยอดเป็นแอปมือถือและฟีเจอร์ใหม่ได้ง่าย (modular)
4. ปลอดภัย ทันสมัย ดูแลรักษาง่าย และมีต้นทุนเริ่มต้นที่สมเหตุสมผล

กลุ่มผู้ใช้ (User Roles)
- ผู้ซื้อ (Buyer): ค้นหา/ดูรถ, บันทึกรายการโปรด, แชต/ติดต่อผู้ขาย, ขอสินเชื่อ
- ผู้ขายทั่วไป (Private Seller): ลงประกาศขายรถของตัวเอง
- ดีลเลอร์/เต็นท์รถ (Dealer): ลงประกาศจำนวนมาก, มีหน้าร้าน, ซื้อแพ็กเกจ
- แอดมิน (Admin): ดูแลระบบ, อนุมัติประกาศ, จัดการผู้ใช้, ดูรายงาน

เทคโนโลยีที่แนะนำ (Recommended Tech Stack)
- Frontend: Next.js (App Router) + TypeScript + Tailwind CSS + shadcn/ui
  - รองรับ SSR/ISR เพื่อ SEO ที่ดี (สำคัญมากสำหรับ marketplace)
  - ออกแบบ component ให้ reuse กับ React Native ในอนาคตได้
- Backend/API: Node.js (NestJS หรือ Next.js Route Handlers) แบบ REST + tRPC/GraphQL ตามเหมาะสม
- Database: PostgreSQL (หลัก) + Prisma ORM
- Search: เริ่มด้วย PostgreSQL full-text/filter; เตรียมเชื่อม Meilisearch/Elasticsearch เมื่อข้อมูลโต
- Cache/Queue: Redis (cache, session, rate limit) + BullMQ สำหรับงาน background
- File/Media: เก็บรูปบน object storage (S3/Cloudflare R2) + image CDN + แปลงเป็น WebP/AVIF
- Auth: JWT + refresh token หรือ Auth.js/Clerk; รองรับ OAuth (Google, Facebook, Line)
- Payments: Stripe (สากล) หรือ Omise/2C2P (ไทย) สำหรับแพ็กเกจ/ค่าโปรโมต
- Infra/Deploy: Docker + containerized; deploy บน Vercel/AWS/GCP; ใช้ CDN, load balancer
- Observability: logging (pino), error tracking (Sentry), metrics (Prometheus/Grafana)

สถาปัตยกรรม (Architecture Principles)
- แยกชั้นชัดเจน: presentation / business logic / data access
- ออกแบบ API-first เพื่อให้ web และ mobile app ใช้ API ชุดเดียวกัน
- ใช้ environment config, ไม่ hardcode secret
- เขียน migration ทุกครั้งที่เปลี่ยน schema
- ออกแบบให้ stateless ที่ฝั่ง API เพื่อ scale แนวนอน (horizontal scaling) ได้
- เผื่อ multi-language (i18n): ไทย / อังกฤษ / จีน ตั้งแต่แรก

ฟีเจอร์เฟส 1 — เว็บไซต์ (MVP ที่ครบชุดมาตรฐาน)
A. ระบบประกาศขายรถ
   - ฟอร์มลงประกาศ: ยี่ห้อ, รุ่น, ปี, เลขไมล์, เกียร์, เชื้อเพลิง, สี, ราคา, จังหวัด,
     ทะเบียน (ซ่อนบางส่วน), รายละเอียด, อัปโหลดรูปหลายรูป (drag & drop)
   - แก้ไข/ลบ/พักประกาศ, สถานะ: รออนุมัติ/เผยแพร่/ขายแล้ว
B. ค้นหาและกรอง (Search & Filter)
   - ค้นด้วยคีย์เวิร์ด + กรองตาม ยี่ห้อ/รุ่น/ช่วงราคา/ปี/ระยะไมล์/เกียร์/เชื้อเพลิง/จังหวัด
   - เรียงลำดับ (ราคา/ใหม่ล่าสุด/ยอดนิยม), แบ่งหน้า (pagination), URL ที่ SEO-friendly
C. หน้ารายละเอียดรถ (Listing Detail)
   - แกลเลอรีรูป, สเปกครบ, แผนที่ตำแหน่ง, ข้อมูลผู้ขาย, รถที่คล้ายกัน
   - ปุ่ม "ติดต่อผู้ขาย" / "แชต" / "โทร" / "ขอสินเชื่อ"
D. บัญชีผู้ใช้ (Account)
   - สมัคร/เข้าสู่ระบบ (อีเมล + OAuth), โปรไฟล์, ประกาศของฉัน, รายการโปรด, ประวัติ
E. แชต/ติดต่อ (Messaging)
   - ระบบข้อความระหว่างผู้ซื้อ-ผู้ขาย (เริ่มแบบ async; เผื่อ real-time ด้วย WebSocket)
F. ระบบจ่ายเงิน / แพ็กเกจ (Payments & Packages)
   - แพ็กเกจสำหรับดีลเลอร์ (จำนวนประกาศ/เดือน), ฟีเจอร์โปรโมตประกาศ (ดันขึ้นบน/ไฮไลต์)
   - หน้าชำระเงิน, เก็บประวัติการชำระ, ใบเสร็จ/ใบกำกับ, ระบบ subscription
G. ระบบหลังบ้าน (Admin Dashboard)
   - อนุมัติ/ปฏิเสธประกาศ, จัดการผู้ใช้และดีลเลอร์, จัดการแพ็กเกจ/ราคา
   - ดูสถิติ: จำนวนประกาศ, ผู้ใช้, รายได้, ประกาศยอดนิยม
   - จัดการเนื้อหา (banner, หน้าคงที่), ระบบรายงาน/แจ้งประกาศผิดกฎ
H. เชื่อมต่อไฟแนนซ์ / ประเมินราคา (Finance & Valuation)
   - เครื่องคำนวณค่างวด (เงินดาวน์, ดอกเบี้ย, จำนวนงวด → ค่างวด/เดือน)
   - ฟอร์มขอสินเชื่อ ส่งต่อให้พาร์ตเนอร์ไฟแนนซ์ (เตรียม API integration แบบ pluggable)
   - เครื่องประเมินราคารถเบื้องต้นจากยี่ห้อ/รุ่น/ปี/ไมล์ (เริ่มด้วยกฎ/ตาราง, เผื่อ ML ภายหลัง)

สิ่งที่ต้องมีเสมอ (Non-Functional Requirements)
- Responsive ทุกขนาดหน้าจอ (mobile-first), เข้าถึงได้ (a11y), โหลดเร็ว (Core Web Vitals)
- SEO: meta tags, sitemap, structured data (schema.org/Vehicle), URL อ่านง่าย
- ความปลอดภัย: validation ทุก input, ป้องกัน SQL injection/XSS/CSRF, rate limiting,
  เข้ารหัสข้อมูลสำคัญ, จัดการ permission ตาม role (RBAC)
- ทดสอบ: unit test ส่วนสำคัญ + integration test ของ API หลัก
- รองรับ i18n: ไทย / อังกฤษ / จีน

แผนการพัฒนา (Roadmap)
- เฟส 1 (ตอนนี้): เว็บไซต์ + ฟีเจอร์ A–H ข้างบน
- เฟส 2: แอปมือถือ (React Native/Flutter) ใช้ API เดิม + push notification
- เฟส 3: ปรับปรุงด้วยข้อมูล—ระบบแนะนำรถ (recommendation), ML ประเมินราคา,
  ตรวจสอบประวัติรถ, ระบบรีวิวดีลเลอร์, การรับประกัน/ตรวจสภาพ

สิ่งที่ฉันอยากให้คุณทำ (Deliverables / How to respond)
1. สรุปสถาปัตยกรรมและ tech stack สั้น ๆ พร้อมเหตุผล
2. ออกแบบ Database schema (ตารางหลัก + ความสัมพันธ์ + ฟิลด์สำคัญ)
3. กำหนดโครงสร้างโฟลเดอร์ของโปรเจกต์
4. สร้างโค้ดเริ่มต้นทีละส่วน (เริ่มจาก setup → auth → ลงประกาศ → ค้นหา → รายละเอียด
   → แชต → payment → admin → finance) พร้อมอธิบายแต่ละขั้น
5. แนะนำขั้นตอน deploy และวิธี scale เมื่อผู้ใช้เพิ่มขึ้น
6. ถามฉันก่อนถ้ามีจุดที่ต้องตัดสินใจสำคัญ (เช่น เลือกผู้ให้บริการ payment ของไทย)

เริ่มจากข้อ 1–3 ก่อน แล้วรอให้ฉันยืนยันก่อนลงมือเขียนโค้ดจริง
ใช้ภาษาไทยในการอธิบาย และใส่คอมเมนต์ในโค้ดเป็นภาษาอังกฤษ
```

---

## 🇬🇧 English Version (Main Prompt)

```text
Role
You are a Senior Full-Stack Architect and engineering team helping me design and build
an online used-car marketplace from scratch to production. Phase 1 is a complete,
production-ready WEBSITE, architected so it can later expand into mobile apps (iOS/Android)
without a full rewrite.

Goals
1. Build a marketplace website to list and search used cars.
2. Support tens of thousands to hundreds of thousands of concurrent users (scalable).
3. Keep the architecture modular so new features and a mobile app are easy to add.
4. Secure, modern, maintainable, with a reasonable starting cost.

User Roles
- Buyer: search/browse cars, save favorites, chat/contact sellers, request financing.
- Private Seller: list their own car.
- Dealer: bulk listings, storefront page, buy packages.
- Admin: manage the platform, approve listings, manage users, view reports.

Recommended Tech Stack
- Frontend: Next.js (App Router) + TypeScript + Tailwind CSS + shadcn/ui (SSR/ISR for SEO;
  components designed for future React Native reuse).
- Backend/API: Node.js (NestJS or Next.js Route Handlers), REST + tRPC/GraphQL as appropriate.
- Database: PostgreSQL + Prisma ORM.
- Search: start with PostgreSQL full-text/filters; ready to add Meilisearch/Elasticsearch at scale.
- Cache/Queue: Redis (cache, session, rate limit) + BullMQ for background jobs.
- Media: object storage (S3/Cloudflare R2) + image CDN, convert to WebP/AVIF.
- Auth: JWT + refresh tokens or Auth.js/Clerk; OAuth (Google, Facebook, Line).
- Payments: Stripe (global) or Omise/2C2P (Thailand) for packages/promotions.
- Infra: Docker, deploy on Vercel/AWS/GCP, CDN + load balancer.
- Observability: pino logging, Sentry, Prometheus/Grafana.

Architecture Principles
- Clean separation: presentation / business logic / data access.
- API-first so web and mobile share one API.
- Env-based config, no hardcoded secrets, migrations for every schema change.
- Stateless API for horizontal scaling.
- i18n from day one: Thai / English / Chinese.

Phase 1 Features (Standard MVP set)
A. Listings: create/edit/delete/pause, multi-image upload, status (pending/published/sold).
B. Search & Filter: keyword + make/model/price/year/mileage/transmission/fuel/province,
   sorting, pagination, SEO-friendly URLs.
C. Listing Detail: gallery, full specs, location map, seller info, similar cars, contact/chat/finance CTAs.
D. Accounts: signup/login (email + OAuth), profile, my listings, favorites, history.
E. Messaging: buyer–seller chat (async first; WebSocket-ready for real-time).
F. Payments & Packages: dealer packages, promoted listings, checkout, payment history,
   invoices/receipts, subscriptions.
G. Admin Dashboard: approve/reject listings, manage users/dealers, manage packages/pricing,
   stats (listings/users/revenue/popular), content management, abuse reports.
H. Finance & Valuation: loan/installment calculator, financing request form (pluggable partner API),
   basic price-estimation tool (rule/table first, ML later).

Non-Functional Requirements
- Mobile-first responsive, accessible (a11y), fast (Core Web Vitals).
- SEO: meta tags, sitemap, schema.org/Vehicle structured data, clean URLs.
- Security: input validation, prevent SQLi/XSS/CSRF, rate limiting, encryption, RBAC.
- Testing: unit tests for core logic + integration tests for key APIs.
- i18n: Thai / English / Chinese.

Roadmap
- Phase 1 (now): website + features A–H.
- Phase 2: mobile app (React Native/Flutter) reusing the API + push notifications.
- Phase 3: recommendations, ML valuation, vehicle history checks, dealer reviews, inspection/warranty.

Deliverables / How to respond
1. Summarize architecture and tech stack with rationale.
2. Design the database schema (core tables, relations, key fields).
3. Define the project folder structure.
4. Generate starter code step by step (setup → auth → listings → search → detail → chat →
   payments → admin → finance), explaining each step.
5. Recommend deployment and scaling steps as usage grows.
6. Ask me before any major decision (e.g., choosing a Thai payment provider).

Start with steps 1–3 and wait for my confirmation before writing real code.
Explain in English; keep code comments in English.
```

---

## 🇨🇳 中文版本（主要提示词 / Main Prompt）

```text
角色
你是一名资深全栈架构师和工程团队，帮助我从零开始构建一个可上线的
二手车在线交易平台（Used Car Marketplace）。第一阶段先做一个完整、
可投入生产的「网站」，并且架构上要能在未来扩展为移动应用（iOS/Android），
而无需推倒重写。

目标
1. 构建一个发布和搜索二手车的交易平台网站。
2. 支持数万到数十万并发用户（可扩展）。
3. 架构模块化，便于新增功能和开发移动端。
4. 安全、现代、易维护，初期成本合理。

用户角色
- 买家：搜索/浏览车辆、收藏、与卖家聊天/联系、申请贷款。
- 个人卖家：发布自己的车辆。
- 车商/经销商：批量发布、店铺主页、购买套餐。
- 管理员：管理平台、审核发布、管理用户、查看报表。

推荐技术栈
- 前端：Next.js（App Router）+ TypeScript + Tailwind CSS + shadcn/ui（SSR/ISR 利于 SEO；
  组件设计便于未来 React Native 复用）。
- 后端/API：Node.js（NestJS 或 Next.js Route Handlers），按需 REST + tRPC/GraphQL。
- 数据库：PostgreSQL + Prisma ORM。
- 搜索：先用 PostgreSQL 全文/过滤；数据增长后接入 Meilisearch/Elasticsearch。
- 缓存/队列：Redis（缓存、会话、限流）+ BullMQ 处理后台任务。
- 媒体：对象存储（S3/Cloudflare R2）+ 图片 CDN，转换为 WebP/AVIF。
- 认证：JWT + 刷新令牌 或 Auth.js/Clerk；支持 OAuth（Google、Facebook、Line）。
- 支付：Stripe（国际）或 Omise/2C2P（泰国）用于套餐/推广。
- 基础设施：Docker，部署于 Vercel/AWS/GCP，CDN + 负载均衡。
- 可观测性：pino 日志、Sentry、Prometheus/Grafana。

架构原则
- 清晰分层：表现层 / 业务逻辑 / 数据访问。
- API 优先，网页与移动端共用同一套 API。
- 基于环境的配置，不硬编码密钥，每次改 schema 都写迁移。
- API 无状态以支持横向扩展。
- 从一开始支持多语言（i18n）：泰语 / 英语 / 中文。

第一阶段功能（标准 MVP）
A. 车辆发布：创建/编辑/删除/暂停，多图上传，状态（待审/已发布/已售）。
B. 搜索与筛选：关键词 + 品牌/车型/价格/年份/里程/变速箱/燃料/地区，排序、分页、SEO 友好 URL。
C. 详情页：图库、完整规格、位置地图、卖家信息、相似车辆、联系/聊天/贷款入口。
D. 账户：注册/登录（邮箱 + OAuth）、个人资料、我的发布、收藏、历史。
E. 消息：买卖双方聊天（先异步；为实时预留 WebSocket）。
F. 支付与套餐：车商套餐、推广置顶、结算、支付记录、发票/收据、订阅。
G. 管理后台：审核发布、管理用户/车商、管理套餐/定价、统计数据、内容管理、违规举报。
H. 金融与估价：贷款/分期计算器、贷款申请表（可插拔的合作伙伴 API）、
   基础估价工具（先用规则/表格，后续接入 ML）。

非功能性需求
- 移动优先响应式、无障碍（a11y）、加载快（Core Web Vitals）。
- SEO：meta 标签、站点地图、schema.org/Vehicle 结构化数据、整洁 URL。
- 安全：输入校验、防 SQL 注入/XSS/CSRF、限流、加密、基于角色的权限（RBAC）。
- 测试：核心逻辑单元测试 + 关键 API 集成测试。
- 多语言：泰语 / 英语 / 中文。

路线图
- 第一阶段（现在）：网站 + A–H 功能。
- 第二阶段：移动应用（React Native/Flutter）复用 API + 推送通知。
- 第三阶段：推荐系统、ML 估价、车辆历史查询、车商评价、检测/质保。

交付要求 / 回复方式
1. 简要说明架构与技术栈及理由。
2. 设计数据库 schema（核心表、关系、关键字段）。
3. 定义项目目录结构。
4. 分步生成初始代码（搭建 → 认证 → 发布 → 搜索 → 详情 → 聊天 → 支付 → 后台 → 金融），
   并解释每一步。
5. 给出部署方案以及随用户增长的扩展步骤。
6. 遇到重大决策（如选择泰国支付服务商）前先询问我。

请先完成第 1–3 步，等我确认后再开始写真正的代码。
用中文解释，代码注释用英文。
```

---

## 💡 เคล็ดลับการใช้งาน (Tips)

- เริ่มแบบ "เว็บก่อน" ตามที่ต้องการ แล้วค่อยทำเฟส 2 (แอป) โดยใช้ API ชุดเดิม — จุดสำคัญคือออกแบบ **API-first** ตั้งแต่ต้น
- ถ้าใช้ AI tool ที่สร้างโค้ดได้ทันที (เช่น v0, Lovable, Bolt) ให้วาง prompt แล้วสั่งทำทีละเฟส A→H จะได้ผลดีกว่าสั่งรวดเดียว
- เรื่องผู้ให้บริการชำระเงินในไทย แนะนำพิจารณา Omise หรือ 2C2P; ถ้าเน้นต่างประเทศใช้ Stripe
- รองรับผู้ใช้หลักหมื่น–หลักแสน: หัวใจอยู่ที่ caching (Redis), CDN สำหรับรูป, ฐานข้อมูลที่ index ดี และ API ที่ stateless เพื่อ scale แนวนอน


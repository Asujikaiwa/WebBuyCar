# CarMarket Mobile (Expo + React Native)

แอปมือถือ (iOS / Android) ที่ใช้ API ของเว็บ `used-car-marketplace` ตัวเดียวกัน — สิ่งที่ทำใน
เว็บ (auth, browse, listing detail, push notification) ใช้งานบนมือถือได้ทันที โดยมีการเพิ่ม
endpoint `/api/auth/mobile/login` (คืน JWT) และ `/api/users/push-token` ฝั่งเว็บไว้ให้แล้ว

## Tech stack
- **Expo SDK 51** + **React Native 0.74** + **TypeScript** — สร้างได้ทั้ง iOS/Android/web
- **expo-router 3** — file-based routing แบบเดียวกับ Next.js App Router (คุ้นมือ)
- **TanStack Query** — data fetching + cache
- **expo-secure-store** — เก็บ JWT ใน Keychain/Keystore
- **expo-notifications** — push notification ผ่าน Expo Push Service

## โครงสร้าง
```
mobile/
├── app/
│   ├── _layout.tsx          # Root layout (QueryClient + Stack navigator)
│   ├── index.tsx            # หน้าแรก: ค้นหา + รายการรถ
│   ├── listing/[id].tsx     # รายละเอียดรถ
│   ├── profile.tsx          # โปรไฟล์ + ออกจากระบบ
│   └── (auth)/
│       ├── login.tsx
│       └── register.tsx
├── lib/
│   ├── api.ts               # fetch wrapper (base URL + Bearer auth)
│   ├── storage.ts           # SecureStore wrapper สำหรับ JWT
│   └── push.ts              # ลงทะเบียน Expo push token + ส่งไป backend
└── (config: package.json, app.json, tsconfig.json, babel.config.js, .env.example)
```

## เริ่มใช้งาน
```bash
# ติดตั้ง dependencies
cd mobile
npm install

# ตั้งค่า API URL (เปลี่ยนเป็น LAN IP ถ้ารันบนมือถือจริง เช่น http://192.168.1.10:3000)
cp .env.example .env

# รัน
npm start              # เปิด Expo Dev Tools
# หรือ
npm run android        # รันบน Android emulator
npm run ios            # รันบน iOS simulator (macOS only)
```

> สแกน QR กับ Expo Go บนมือถือก็ได้ทันที (พร้อมเข้าใช้ทุกหน้าและรับ push notification จริง)

## Push notification — flow
1. ผู้ใช้ login สำเร็จ → แอปขอ permission → ดึง Expo push token →
   POST ไปที่ `/api/users/push-token` เก็บไว้กับ user
2. เมื่อมีข้อความใหม่ใน `/api/conversations/:id/messages` (เว็บฝั่ง backend) →
   ฝั่ง server เรียก `sendPushNotification()` → Expo Push API → มือถือเด้ง notification
3. ตอน logout → DELETE `/api/users/push-token` เพื่อหยุดรับ

## Auth — flow
- มือถือไม่ใช้ NextAuth cookie session แต่ใช้ JWT แทน
- POST `/api/auth/mobile/login` → คืน `{ token, user }`
- `token` ถูกเก็บใน SecureStore → `api()` แนบเป็น `Authorization: Bearer ...` อัตโนมัติ
- ฝั่ง server: `getSession()` รองรับทั้ง cookie (เว็บ) และ Bearer JWT (มือถือ) → API route เดียวกันใช้ได้ทั้งคู่

## ทำต่อ
- แชต real-time (subscribe Pusher channel)
- ลงประกาศ + อัปโหลดรูป (presigned URL flow เดียวกับเว็บ)
- รายการโปรด + ประวัติ
- รองรับหลายภาษา (ใช้ expo-localization + คลังคำแปลเดียวกับเว็บ)
- EAS Build สำหรับขึ้น App Store / Play Store

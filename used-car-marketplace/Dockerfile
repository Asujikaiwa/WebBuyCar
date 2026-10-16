# ---------- Stage 1: deps ----------
FROM node:20-alpine AS deps
# libc6-compat จำเป็นสำหรับ Prisma engine บน Alpine
RUN apk add --no-cache libc6-compat
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm ci

# ---------- Stage 2: builder ----------
FROM node:20-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
# สร้าง Prisma client + build Next (standalone)
RUN npx prisma generate
RUN npm run build

# ---------- Stage 3: runner ----------
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# รันด้วย user ที่ไม่ใช่ root เพื่อความปลอดภัย
RUN addgroup --system --gid 1001 nodejs \
  && adduser --system --uid 1001 nextjs

# คัดลอกเฉพาะไฟล์ที่ standalone ต้องใช้
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
# คัดลอก Prisma schema + engine สำหรับ migrate ตอน start
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma

USER nextjs
EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

CMD ["node", "server.js"]

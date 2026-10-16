import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

// คอนฟิก NextAuth — รองรับ login ด้วย email/password และ Google OAuth
// ใช้ JWT strategy เพื่อให้ API เป็น stateless (scale แนวนอนได้)
export const authOptions: NextAuthOptions = {
  session: { strategy: "jwt" },
  pages: { signIn: "/login" },
  providers: [
    CredentialsProvider({
      name: "Email",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;
        const user = await prisma.user.findUnique({ where: { email: credentials.email } });
        if (!user?.passwordHash) return null;
        const ok = await bcrypt.compare(credentials.password, user.passwordHash);
        if (!ok) return null;
        return { id: user.id, email: user.email, name: user.name ?? undefined, role: user.role };
      },
    }),
    // เปิดใช้เมื่อใส่ค่า env ครบ
    ...(process.env.GOOGLE_CLIENT_ID
      ? [
          GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID!,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
          }),
        ]
      : []),
  ],
  callbacks: {
    // ฝัง id + role ลงใน token เพื่อใช้ตรวจสิทธิ์ฝั่ง server
    async jwt({ token, user }) {
      if (user) {
        token.uid = (user as any).id;
        token.role = (user as any).role ?? "BUYER";
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.uid;
        (session.user as any).role = token.role;
      }
      return session;
    },
  },
};

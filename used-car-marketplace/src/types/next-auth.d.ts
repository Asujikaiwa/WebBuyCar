import "next-auth";
import "next-auth/jwt";
import type { UserRole } from "@prisma/client";

// เพิ่ม field id + role เข้าไปใน type ของ session/jwt
declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: UserRole;
      name?: string | null;
      email?: string | null;
      image?: string | null;
    };
  }
  interface User {
    role?: UserRole;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    uid: string;
    role: UserRole;
  }
}

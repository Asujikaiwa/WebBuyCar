"use client";

import { SessionProvider } from "next-auth/react";

// ห่อแอปด้วย SessionProvider เพื่อให้ useSession() ใช้ได้ทุกที่
export default function Providers({ children }: { children: React.ReactNode }) {
  return <SessionProvider>{children}</SessionProvider>;
}

"use client";

import PusherClient from "pusher-js";

// Pusher client (browser) — ใช้ค่า public key (NEXT_PUBLIC_*)
// authEndpoint ใช้ตรวจสิทธิ์ก่อนเข้า private channel
export const pusherClient = new PusherClient(process.env.NEXT_PUBLIC_PUSHER_KEY ?? "", {
  cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER ?? "ap1",
  authEndpoint: "/api/pusher/auth",
});

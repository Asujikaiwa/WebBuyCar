import Pusher from "pusher";

// Pusher server instance — ใช้ trigger event ฝั่ง server (managed service, ทำงานบน Vercel ได้)
export const pusherServer = new Pusher({
  appId: process.env.PUSHER_APP_ID ?? "",
  key: process.env.PUSHER_KEY ?? "",
  secret: process.env.PUSHER_SECRET ?? "",
  cluster: process.env.PUSHER_CLUSTER ?? "ap1", // ap1 = Singapore (ใกล้ไทยสุด)
  useTLS: true,
});

// ชื่อ channel ของแต่ละห้องแชต (private channel ต้องผ่าน auth)
export function conversationChannel(conversationId: string) {
  return `private-conversation-${conversationId}`;
}

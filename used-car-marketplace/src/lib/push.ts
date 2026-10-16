// ส่ง push notification ผ่าน Expo Push API (ไม่ต้องตั้งค่าฝั่ง server มาก)
// docs: https://docs.expo.dev/push-notifications/sending-notifications/

interface ExpoMessage {
  to: string; // ExponentPushToken[...]
  title: string;
  body: string;
  data?: Record<string, any>;
  sound?: "default";
}

export async function sendPushNotification(message: ExpoMessage): Promise<void> {
  try {
    await fetch("https://exp.host/--/api/v2/push/send", {
      method: "POST",
      headers: { Accept: "application/json", "Content-Type": "application/json" },
      body: JSON.stringify({ sound: "default", ...message }),
    });
  } catch (err) {
    // อย่าทำให้ flow ของผู้ใช้พัง ถ้า push ส่งไม่สำเร็จ
    console.error("push notification failed", err);
  }
}

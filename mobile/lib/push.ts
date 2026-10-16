import * as Notifications from "expo-notifications";
import * as Device from "expo-device";
import { Platform } from "react-native";
import { api } from "./api";

// ตั้งค่าให้ notification แสดงตอนเปิดแอปอยู่
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

/**
 * ขอ permission, ดึง Expo push token, แล้วส่งไป backend
 * เรียกหลัง login สำเร็จ
 */
export async function registerForPushNotifications() {
  if (!Device.isDevice) return null; // emulator ไม่รองรับ

  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync("default", {
      name: "default",
      importance: Notifications.AndroidImportance.DEFAULT,
    });
  }

  const { status: existing } = await Notifications.getPermissionsAsync();
  let final = existing;
  if (existing !== "granted") {
    const { status } = await Notifications.requestPermissionsAsync();
    final = status;
  }
  if (final !== "granted") return null;

  const { data: pushToken } = await Notifications.getExpoPushTokenAsync();
  try {
    await api("/api/users/push-token", {
      method: "POST",
      body: JSON.stringify({ pushToken }),
    });
  } catch {
    // ignore — กลับมา register ใหม่คราวหน้าได้
  }
  return pushToken;
}

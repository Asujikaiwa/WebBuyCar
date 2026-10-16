import { useEffect, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { Link, useRouter } from "expo-router";
import { api } from "@/lib/api";
import { clearToken, getToken } from "@/lib/storage";

export default function ProfileScreen() {
  const router = useRouter();
  const [loggedIn, setLoggedIn] = useState<boolean | null>(null);

  useEffect(() => {
    getToken().then((t) => setLoggedIn(!!t));
  }, []);

  async function logout() {
    // เลิกรับ push ฝั่ง server
    try { await api("/api/users/push-token", { method: "DELETE" }); } catch {}
    await clearToken();
    router.replace("/(auth)/login");
  }

  if (loggedIn === null) return null;

  if (!loggedIn) {
    return (
      <View style={styles.container}>
        <Text style={styles.text}>คุณยังไม่ได้เข้าสู่ระบบ</Text>
        <Link href="/(auth)/login" asChild>
          <Pressable style={styles.button}><Text style={styles.buttonText}>เข้าสู่ระบบ</Text></Pressable>
        </Link>
        <Link href="/(auth)/register" asChild>
          <Pressable style={[styles.button, { backgroundColor: "#fff", borderWidth: 1, borderColor: "#1e40af" }]}>
            <Text style={[styles.buttonText, { color: "#1e40af" }]}>สมัครสมาชิก</Text>
          </Pressable>
        </Link>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.text}>เข้าสู่ระบบแล้ว</Text>
      <Pressable onPress={logout} style={[styles.button, { backgroundColor: "#dc2626" }]}>
        <Text style={styles.buttonText}>ออกจากระบบ</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#f8fafc", gap: 12 },
  text: { textAlign: "center", marginVertical: 16 },
  button: { backgroundColor: "#1e40af", padding: 14, borderRadius: 8, alignItems: "center" },
  buttonText: { color: "#fff", fontWeight: "600" },
});

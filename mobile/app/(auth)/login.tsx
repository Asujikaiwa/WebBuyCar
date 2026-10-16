import { useState } from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { Link, useRouter } from "expo-router";
import { api } from "@/lib/api";
import { saveToken } from "@/lib/storage";
import { registerForPushNotifications } from "@/lib/push";

export default function LoginScreen() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);

  async function onSubmit() {
    setBusy(true); setErr("");
    try {
      const res = await api<{ token: string }>("/api/auth/mobile/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
        auth: false,
      });
      await saveToken(res.token);
      // ลงทะเบียน push token หลัง login สำเร็จ
      registerForPushNotifications().catch(() => {});
      router.replace("/");
    } catch (e: any) {
      setErr("อีเมลหรือรหัสผ่านไม่ถูกต้อง");
    } finally {
      setBusy(false);
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>เข้าสู่ระบบ</Text>
      <TextInput placeholder="อีเมล" autoCapitalize="none" keyboardType="email-address"
        value={email} onChangeText={setEmail} style={styles.input} />
      <TextInput placeholder="รหัสผ่าน" secureTextEntry
        value={password} onChangeText={setPassword} style={styles.input} />
      {err ? <Text style={styles.error}>{err}</Text> : null}
      <Pressable onPress={onSubmit} disabled={busy} style={[styles.button, busy && { opacity: 0.6 }]}>
        <Text style={styles.buttonText}>{busy ? "กำลังเข้าสู่ระบบ..." : "เข้าสู่ระบบ"}</Text>
      </Pressable>
      <Link href="/(auth)/register" style={styles.link}>ยังไม่มีบัญชี? สมัครสมาชิก</Link>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#f8fafc", gap: 12 },
  title: { fontSize: 24, fontWeight: "bold", marginVertical: 16, textAlign: "center" },
  input: { backgroundColor: "#fff", borderRadius: 8, padding: 12, borderWidth: 1, borderColor: "#e2e8f0" },
  button: { backgroundColor: "#1e40af", padding: 14, borderRadius: 8, alignItems: "center", marginTop: 8 },
  buttonText: { color: "#fff", fontWeight: "600" },
  link: { textAlign: "center", color: "#1e40af", marginTop: 8 },
  error: { color: "#dc2626", textAlign: "center" },
});

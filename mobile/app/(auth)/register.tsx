import { useState } from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { useRouter } from "expo-router";
import { api } from "@/lib/api";
import { saveToken } from "@/lib/storage";

export default function RegisterScreen() {
  const router = useRouter();
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);

  function set(k: string, v: string) { setForm((f) => ({ ...f, [k]: v })); }

  async function onSubmit() {
    setBusy(true); setErr("");
    try {
      await api("/api/auth/register", {
        method: "POST",
        body: JSON.stringify({ ...form, role: "BUYER" }),
        auth: false,
      });
      // login ทันทีหลังสมัคร (ใช้ mobile login endpoint เพื่อ JWT)
      const res = await api<{ token: string }>("/api/auth/mobile/login", {
        method: "POST",
        body: JSON.stringify({ email: form.email, password: form.password }),
        auth: false,
      });
      await saveToken(res.token);
      router.replace("/");
    } catch (e: any) {
      setErr("สมัครไม่สำเร็จ");
    } finally {
      setBusy(false);
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>สมัครสมาชิก</Text>
      <TextInput placeholder="ชื่อ" value={form.name} onChangeText={(v) => set("name", v)} style={styles.input} />
      <TextInput placeholder="อีเมล" autoCapitalize="none" keyboardType="email-address"
        value={form.email} onChangeText={(v) => set("email", v)} style={styles.input} />
      <TextInput placeholder="รหัสผ่าน (อย่างน้อย 8 ตัว)" secureTextEntry
        value={form.password} onChangeText={(v) => set("password", v)} style={styles.input} />
      {err ? <Text style={styles.error}>{err}</Text> : null}
      <Pressable onPress={onSubmit} disabled={busy} style={[styles.button, busy && { opacity: 0.6 }]}>
        <Text style={styles.buttonText}>{busy ? "กำลังสมัคร..." : "สมัครสมาชิก"}</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#f8fafc", gap: 12 },
  title: { fontSize: 24, fontWeight: "bold", marginVertical: 16, textAlign: "center" },
  input: { backgroundColor: "#fff", borderRadius: 8, padding: 12, borderWidth: 1, borderColor: "#e2e8f0" },
  button: { backgroundColor: "#1e40af", padding: 14, borderRadius: 8, alignItems: "center", marginTop: 8 },
  buttonText: { color: "#fff", fontWeight: "600" },
  error: { color: "#dc2626", textAlign: "center" },
});

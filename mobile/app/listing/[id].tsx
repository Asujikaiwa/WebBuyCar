import { ActivityIndicator, Image, ScrollView, StyleSheet, Text, View } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";

interface Detail {
  listing: {
    id: string; title: string; description: string; priceCents: number;
    year: number; mileage: number; province: string;
    make: string; model: string; transmission: string; fuelType: string;
    images: { id: string; url: string }[];
    seller: { name: string | null; phone: string | null };
  };
}

export default function ListingDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data, isLoading } = useQuery({
    queryKey: ["listing", id],
    queryFn: () => api<Detail>(`/api/listings/${id}`, { auth: false }),
    enabled: !!id,
  });

  if (isLoading) return <View style={styles.center}><ActivityIndicator /></View>;
  if (!data) return <View style={styles.center}><Text>ไม่พบประกาศ</Text></View>;

  const l = data.listing;
  return (
    <ScrollView style={{ flex: 1, backgroundColor: "#f8fafc" }}>
      {l.images[0] && <Image source={{ uri: l.images[0].url }} style={styles.cover} />}
      <View style={{ padding: 16 }}>
        <Text style={styles.title}>{l.title}</Text>
        <Text style={styles.price}>{(l.priceCents / 100).toLocaleString()} บาท</Text>

        <View style={styles.specs}>
          <Spec label="ยี่ห้อ" value={l.make} />
          <Spec label="รุ่น" value={l.model} />
          <Spec label="ปี" value={String(l.year)} />
          <Spec label="เลขไมล์" value={`${l.mileage.toLocaleString()} กม.`} />
          <Spec label="เกียร์" value={l.transmission === "AUTO" ? "อัตโนมัติ" : "ธรรมดา"} />
          <Spec label="จังหวัด" value={l.province} />
        </View>

        <Text style={styles.section}>รายละเอียด</Text>
        <Text style={styles.description}>{l.description}</Text>

        <Text style={styles.section}>ผู้ขาย</Text>
        <Text>{l.seller.name ?? "-"} · {l.seller.phone ?? "-"}</Text>
      </View>
    </ScrollView>
  );
}

function Spec({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.spec}>
      <Text style={styles.specLabel}>{label}</Text>
      <Text style={styles.specValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  cover: { width: "100%", height: 240 },
  title: { fontSize: 22, fontWeight: "bold" },
  price: { fontSize: 28, fontWeight: "bold", color: "#1e40af", marginTop: 4 },
  specs: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 16 },
  spec: { backgroundColor: "#fff", borderRadius: 8, padding: 10, width: "48%" },
  specLabel: { color: "#64748b", fontSize: 12 },
  specValue: { fontWeight: "600", marginTop: 2 },
  section: { fontSize: 16, fontWeight: "600", marginTop: 20, marginBottom: 4 },
  description: { color: "#334155", lineHeight: 20 },
});

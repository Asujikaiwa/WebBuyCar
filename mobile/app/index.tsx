import { useState } from "react";
import { FlatList, Image, Pressable, RefreshControl, StyleSheet, Text, TextInput, View } from "react-native";
import { Link, useRouter } from "expo-router";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";

interface Listing {
  id: string;
  title: string;
  priceCents: number;
  year: number;
  mileage: number;
  province: string;
  isPromoted?: boolean;
  images?: { url: string }[];
}

export default function HomeScreen() {
  const router = useRouter();
  const [q, setQ] = useState("");

  const { data, isLoading, refetch, isRefetching } = useQuery({
    queryKey: ["listings", q],
    queryFn: () => api<{ items: Listing[] }>(`/api/listings?q=${encodeURIComponent(q)}&pageSize=20`, { auth: false }),
  });

  return (
    <View style={styles.container}>
      <View style={styles.searchRow}>
        <TextInput
          value={q}
          onChangeText={setQ}
          placeholder="ค้นหา ยี่ห้อ / รุ่น"
          placeholderTextColor="#94a3b8"
          style={styles.search}
          returnKeyType="search"
          onSubmitEditing={() => refetch()}
        />
        <Pressable onPress={() => router.push("/profile")} style={styles.profileBtn}>
          <Text style={styles.profileBtnText}>👤</Text>
        </Pressable>
      </View>

      <FlatList
        data={data?.items ?? []}
        keyExtractor={(l) => l.id}
        contentContainerStyle={{ padding: 12, gap: 12 }}
        refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={() => refetch()} />}
        ListEmptyComponent={
          <Text style={{ textAlign: "center", color: "#64748b", marginTop: 40 }}>
            {isLoading ? "กำลังโหลด..." : "ยังไม่มีประกาศ"}
          </Text>
        }
        renderItem={({ item }) => (
          <Link href={`/listing/${item.id}`} asChild>
            <Pressable style={styles.card}>
              {item.images?.[0] ? (
                <Image source={{ uri: item.images[0].url }} style={styles.cardImage} />
              ) : (
                <View style={[styles.cardImage, styles.noImage]}>
                  <Text style={{ color: "#94a3b8" }}>ไม่มีรูป</Text>
                </View>
              )}
              <View style={{ padding: 12 }}>
                {item.isPromoted && <Text style={styles.promoBadge}>แนะนำ</Text>}
                <Text style={styles.cardTitle}>{item.title}</Text>
                <Text style={styles.cardMeta}>
                  {item.year} · {item.mileage.toLocaleString()} กม. · {item.province}
                </Text>
                <Text style={styles.cardPrice}>
                  {(item.priceCents / 100).toLocaleString()} บาท
                </Text>
              </View>
            </Pressable>
          </Link>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f8fafc" },
  searchRow: { flexDirection: "row", gap: 8, padding: 12, backgroundColor: "#1e40af" },
  search: { flex: 1, backgroundColor: "#fff", borderRadius: 8, paddingHorizontal: 12, paddingVertical: 8 },
  profileBtn: { backgroundColor: "rgba(255,255,255,0.2)", borderRadius: 8, paddingHorizontal: 12, justifyContent: "center" },
  profileBtnText: { color: "#fff", fontSize: 18 },
  card: { backgroundColor: "#fff", borderRadius: 12, overflow: "hidden", elevation: 1 },
  cardImage: { width: "100%", height: 200 },
  noImage: { backgroundColor: "#e2e8f0", alignItems: "center", justifyContent: "center" },
  promoBadge: { color: "#fff", backgroundColor: "#f59e0b", alignSelf: "flex-start", paddingHorizontal: 8, paddingVertical: 2, borderRadius: 4, fontSize: 12, marginBottom: 4 },
  cardTitle: { fontSize: 16, fontWeight: "600" },
  cardMeta: { color: "#64748b", marginTop: 2, fontSize: 13 },
  cardPrice: { color: "#1e40af", fontWeight: "bold", fontSize: 18, marginTop: 4 },
});

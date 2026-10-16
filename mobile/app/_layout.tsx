import { Stack } from "expo-router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { StatusBar } from "expo-status-bar";

const queryClient = new QueryClient({
  defaultOptions: { queries: { staleTime: 30_000, retry: 1 } },
});

export default function RootLayout() {
  return (
    <QueryClientProvider client={queryClient}>
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: "#1e40af" },
          headerTintColor: "#fff",
          headerTitleStyle: { fontWeight: "bold" },
        }}
      >
        <Stack.Screen name="index" options={{ title: "CarMarket" }} />
        <Stack.Screen name="listing/[id]" options={{ title: "รายละเอียดรถ" }} />
        <Stack.Screen name="(auth)/login" options={{ title: "เข้าสู่ระบบ" }} />
        <Stack.Screen name="(auth)/register" options={{ title: "สมัครสมาชิก" }} />
        <Stack.Screen name="profile" options={{ title: "โปรไฟล์" }} />
      </Stack>
    </QueryClientProvider>
  );
}

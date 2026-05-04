import { Stack } from "expo-router";
import "react-native-reanimated";

import { AuthProvider } from "@/features/auth/hooks/useAuth";

export default function RootLayout() {
  return (
    <AuthProvider>
      <Stack
        screenOptions={{
          animation: "fade_from_bottom",
          contentStyle: { backgroundColor: "#3b8af5" },
          headerShown: false,
        }}
      >
        <Stack.Screen name="index" />
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(app)" />
      </Stack>
    </AuthProvider>
  );
}

import { Stack } from "expo-router";

export default function Layout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      {/* Landing Page (starts first by default) */}
      <Stack.Screen name="index" options={{ headerShown: false }} />

      {/* Login Flow */}
      <Stack.Screen name="login-type" options={{ headerShown: false }} />
      <Stack.Screen name="dashboard" options={{ headerShown: false }} />

      {/* Main Tabs */}
      <Stack.Screen name="dashbaord" options={{ headerShown: false }} />
    </Stack>
  );
}

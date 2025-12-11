import { IrishGrover_400Regular, useFonts } from "@expo-google-fonts/irish-grover";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";

SplashScreen.preventAutoHideAsync();

export default function Layout() {
  const [fontsLoaded] = useFonts({
    IrishGrover: IrishGrover_400Regular,
  });

  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync(); // hide splash once fonts are ready
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) {
    return null;
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="login-type" />
      <Stack.Screen name="welcome" />
      <Stack.Screen name="(tabs)" />
    </Stack>
  );
}

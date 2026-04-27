import { DarkTheme, DefaultTheme, ThemeProvider } from "@react-navigation/native";
import { onAuthStateChanged, User } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { Stack, useRouter, useSegments } from "expo-router";
import { useEffect, useState } from "react";
import { Platform, Text, TouchableOpacity, useColorScheme } from "react-native";
import "react-native-reanimated";
import "../global.css";

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const router = useRouter();
  const segments = useSegments();
  const [user, setUser] = useState<User | null | undefined>(undefined);
  const headerTitleAlign = Platform.OS === "web" ? ("center" as const) : undefined;
  const webBack =
    Platform.OS === "web"
      ? (onPress: () => void) => (
          <TouchableOpacity
            onPress={onPress}
            className="ml-2 flex-row items-center"
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Text className="text-2xl leading-none text-blue-600 -mt-0.5">
              ‹
            </Text>
            <Text className="text-base font-semibold text-blue-600 ml-1">
              Back
            </Text>
          </TouchableOpacity>
        )
      : undefined;

  useEffect(() => {
    return onAuthStateChanged(auth, setUser);
  }, []);

  useEffect(() => {
    if (user === undefined) return; // Still loading

    const onLoginScreen = segments[0] === "login";
    if (!user && !onLoginScreen) {
      router.replace("/login");
    } else if (user && onLoginScreen) {
      router.replace("/");
    }
  }, [user, segments]);

  // Render nothing until auth state is known to prevent flash
  if (user === undefined) return null;

  return (
    <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
      <Stack>
        <Stack.Screen name="login" options={{ headerShown: false }} />
        <Stack.Screen
          name="index"
          options={{
            title: "Gift Cards",
            headerBackVisible: false,
            headerTitleAlign,
          }}
        />
        <Stack.Screen
          name="create"
          options={{
            title: "New Card",
            headerTitleAlign,
            headerLeft: webBack ? () => webBack(() => router.back()) : undefined,
          }}
        />
        <Stack.Screen
          name="card/[id]"
          options={{
            title: "Card Detail",
            headerTitleAlign,
            headerLeft: webBack
              ? () => webBack(() => router.replace("/"))
              : undefined,
          }}
        />
        <Stack.Screen
          name="scan"
          options={{
            title: "Scan Card",
            presentation: "modal",
            headerTransparent: true,
            headerTintColor: "#fff",
            headerTitleAlign,
            headerLeft: webBack ? () => webBack(() => router.back()) : undefined,
          }}
        />
      </Stack>
    </ThemeProvider>
  );
}

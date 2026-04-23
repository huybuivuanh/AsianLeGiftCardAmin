import { DarkTheme, DefaultTheme, ThemeProvider } from "@react-navigation/native";
import { Stack } from "expo-router";
import { useColorScheme } from "react-native";
import "react-native-reanimated";
import "../global.css";

export default function RootLayout() {
  const colorScheme = useColorScheme();
  return (
    <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
      <Stack>
        <Stack.Screen name="index" options={{ title: "Gift Cards", headerBackVisible: false }} />
        <Stack.Screen name="create" options={{ title: "New Card" }} />
        <Stack.Screen name="card/[id]" options={{ title: "Card Detail" }} />
        <Stack.Screen
          name="scan"
          options={{
            title: "Scan Card",
            presentation: "modal",
            headerTransparent: true,
            headerTintColor: "#fff",
          }}
        />
      </Stack>
    </ThemeProvider>
  );
}

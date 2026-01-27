import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { Platform, View } from "react-native";
import "../global.css";
import { cn } from "../src/lib/utils";

export default function Layout() {
  return (
    <View className="flex-1 bg-gray-100 items-center">
      <View className={cn("flex-1 w-full bg-background", Platform.OS === 'web' && "max-w-md shadow-2xl")}>
        <Stack
          screenOptions={{
            headerStyle: {
              backgroundColor: "#F3F4F6",
            },
            headerShadowVisible: false,
            headerTitleStyle: {
              fontWeight: "bold",
              color: "#1F2937",
            },
            contentStyle: {
              backgroundColor: "#F3F4F6",
            },
          }}
        >
          <Stack.Screen name="index" options={{ title: "Gestion Clientes" }} />
          <Stack.Screen name="create" options={{ title: "Nuevo Cliente", presentation: "modal" }} />
          <Stack.Screen name="[id]" options={{ title: "Detalle" }} />
        </Stack>
        <StatusBar style="dark" />
      </View>
    </View>
  );
}

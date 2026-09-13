import { NativeTabs } from "expo-router/unstable-native-tabs";
import { ThemeProvider, DarkTheme, DefaultTheme } from "expo-router/react-navigation";
import { useColorScheme } from "react-native";
import { useAppColors } from "@/theme/colors";
import { initializeDB } from "@/services/localDB";
import { useEffect } from "react";
import { requestPermissions } from "@/services/notifications";
import { NavigationBar } from "expo-navigation-bar";

initializeDB();

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const colors = useAppColors();

  useEffect(() => {
    requestPermissions();
  }, []);

  return (
    <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
      <NavigationBar style={colorScheme === "dark" ? "light" : "dark"} />
      <NativeTabs
        screenOptions={{
          headerTintColor: colors.label,
        }}
      >
        <NativeTabs.Trigger name="(home)">
          <NativeTabs.Trigger.Icon sf="house.fill" md="home" />
          <NativeTabs.Trigger.Label>Início</NativeTabs.Trigger.Label>
        </NativeTabs.Trigger>
        <NativeTabs.Trigger name="(settings)">
          <NativeTabs.Trigger.Icon sf="gear" md="settings" />
          <NativeTabs.Trigger.Label>Configurações</NativeTabs.Trigger.Label>
        </NativeTabs.Trigger>
      </NativeTabs>
    </ThemeProvider>
  );
}

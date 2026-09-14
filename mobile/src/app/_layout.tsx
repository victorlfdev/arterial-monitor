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
      <NavigationBar style={colorScheme === "dark" ? "dark" : "light"} />
      <NativeTabs
        backgroundColor={colors.systemBackground}
        iconColor={{ default: colors.secondaryLabel, selected: colors.coral }}
        screenOptions={{
          headerTintColor: colors.label,
        }}
      >
        <NativeTabs.Trigger name="(home)">
          <NativeTabs.Trigger.Icon sf="house.fill" md="home" />
          <NativeTabs.Trigger.Label>Início</NativeTabs.Trigger.Label>
        </NativeTabs.Trigger>
        <NativeTabs.Trigger name="(graficos)">
          {/* @ts-expect-error - SF Symbols types are incomplete */}
          <NativeTabs.Trigger.Icon sf="chart.line" md="trending_up" />
          <NativeTabs.Trigger.Label>Gráfico</NativeTabs.Trigger.Label>
        </NativeTabs.Trigger>
        <NativeTabs.Trigger name="(conquistas)">
          <NativeTabs.Trigger.Icon sf="trophy" md="emoji_events" />
          <NativeTabs.Trigger.Label>Conquistas</NativeTabs.Trigger.Label>
        </NativeTabs.Trigger>
        <NativeTabs.Trigger name="(amigos)">
          <NativeTabs.Trigger.Icon sf="person.2" md="people" />
          <NativeTabs.Trigger.Label>Amigos</NativeTabs.Trigger.Label>
        </NativeTabs.Trigger>
        <NativeTabs.Trigger name="(profile)">
          <NativeTabs.Trigger.Icon sf="person" md="person" />
          <NativeTabs.Trigger.Label>Perfil</NativeTabs.Trigger.Label>
        </NativeTabs.Trigger>
      </NativeTabs>
    </ThemeProvider>
  );
}

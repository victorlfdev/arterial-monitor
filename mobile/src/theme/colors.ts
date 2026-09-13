import { useColorScheme, Platform } from "react-native";
import { Color } from "expo-router";

const isIOS = Platform.OS === "ios";

export function useAppColors() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  if (isIOS) {
    return {
      label: Color.ios.label,
      secondaryLabel: Color.ios.secondaryLabel,
      tertiaryLabel: Color.ios.tertiaryLabel,
      separator: Color.ios.separator,
      systemBackground: Color.ios.systemBackground,
      secondarySystemBackground: Color.ios.secondarySystemBackground,
      tertiarySystemBackground: Color.ios.tertiarySystemBackground,
      systemBlue: Color.ios.systemBlue,
      systemGreen: Color.ios.systemGreen,
      systemOrange: Color.ios.systemOrange,
      systemRed: Color.ios.systemRed,
      systemPink: Color.ios.systemPink,
      systemPurple: Color.ios.systemPurple,
      systemYellow: Color.ios.systemYellow,
      pressureNormal: Color.ios.systemGreen,
      pressureElevated: Color.ios.systemOrange,
      pressureHigh: Color.ios.systemRed,
      onTint: Color.ios.systemBackground,
      onAccent: Color.ios.systemBackground,
      headerBackgroundColor: Color.ios.systemBackground,
      headerTintColor: Color.ios.label,
    } as const;
  } else {
    return {
      label: isDark ? "#FFFFFF" : "#000000",
      secondaryLabel: isDark ? "#A1A1A1" : "#666666",
      tertiaryLabel: isDark ? "#717171" : "#888888",
      separator: isDark ? "#333333" : "#E0E0E0",
      systemBackground: isDark ? "#0D0D0D" : "#FFFFFF",
      secondarySystemBackground: isDark ? "#1A1A1A" : "#F5F5F5",
      tertiarySystemBackground: isDark ? "#242424" : "#FAFAFA",
      systemBlue: "#3B82F6",
      systemGreen: "#22C55E",
      systemOrange: "#F59E0B",
      systemRed: "#EF4444",
      systemPink: "#EC4899",
      systemPurple: "#A855F7",
      systemYellow: "#EAB308",
      pressureNormal: "#22C55E",
      pressureElevated: "#F59E0B",
      pressureHigh: "#EF4444",
      onTint: "#FFFFFF",
      onAccent: "#FFFFFF",
      headerBackgroundColor: isDark ? "#0D0D0D" : "#FFFFFF",
      headerTintColor: isDark ? "#FFFFFF" : "#000000",
    } as const;
  }
}

export const colors = {
  label: "#000000",
  secondaryLabel: "#3c3c43",
  tertiaryLabel: "#8e8e93",
  separator: "#c6c6c8",
  systemBackground: "#ffffff",
  secondarySystemBackground: "#f2f2f7",
  tertiarySystemBackground: "#f9f9f9",
  systemBlue: "#3B82F6",
  systemGreen: "#22C55E",
  systemOrange: "#F59E0B",
  systemRed: "#EF4444",
  systemPink: "#EC4899",
  systemPurple: "#A855F7",
  systemYellow: "#EAB308",
  pressureNormal: "#22C55E",
  pressureElevated: "#F59E0B",
  pressureHigh: "#EF4444",
  onTint: "#ffffff",
  onAccent: "#ffffff",
} as const;

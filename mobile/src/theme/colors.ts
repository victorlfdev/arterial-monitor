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
      coral: "#FF6B6B",
      teal: "#2EC4B6",
      amarelo: "#FFD166",
      verde: "#06D6A0",
      vermelho: "#EF476F",
      preto: "#2D3436",
      pressureNormal: "#06D6A0",
      pressureElevated: "#FFD166",
      pressureHigh: "#EF476F",
      onTint: "#ffffff",
      onAccent: "#ffffff",
      gradientStart: "#FF6B6B",
      gradientEnd: "#2EC4B6",
      headerBackgroundColor: isDark ? "#0D0D0D" : "#FFFFFF",
      headerTintColor: isDark ? "#FFFFFF" : "#000000",
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
      coral: "#FF6B6B",
      teal: "#2EC4B6",
      amarelo: "#FFD166",
      verde: "#06D6A0",
      vermelho: "#EF476F",
      preto: "#2D3436",
      pressureNormal: "#06D6A0",
      pressureElevated: "#FFD166",
      pressureHigh: "#EF476F",
      onTint: "#FFFFFF",
      onAccent: "#FFFFFF",
      gradientStart: "#FF6B6B",
      gradientEnd: "#2EC4B6",
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
  coral: "#FF6B6B",
  teal: "#2EC4B6",
  amarelo: "#FFD166",
  verde: "#06D6A0",
  vermelho: "#EF476F",
  preto: "#2D3436",
  pressureNormal: "#06D6A0",
  pressureElevated: "#FFD166",
  pressureHigh: "#EF476F",
  onTint: "#ffffff",
  onAccent: "#ffffff",
  gradientStart: "#FF6B6B",
  gradientEnd: "#2EC4B6",
} as const;

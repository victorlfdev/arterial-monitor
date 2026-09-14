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
      secondaryLabel: isDark ? "#E5E5EA" : "#636366",
      tertiaryLabel: isDark ? "#8E8E93" : "#8E8E93",
      separator: isDark ? "#38383A" : "#C6C6C8",
      systemBackground: isDark ? "#1C1C1E" : "#FFFFFF",
      secondarySystemBackground: isDark ? "#272729" : "#F2F2F7",
      tertiarySystemBackground: isDark ? "#333335" : "#E5E5EA",
      systemBlue: isDark ? "#64D2FF" : "#0A84FF",
      systemGreen: isDark ? "#30D158" : "#34C759",
      systemOrange: isDark ? "#FF9F0A" : "#FF9F0A",
      systemRed: isDark ? "#FF453F" : "#FF3B30",
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

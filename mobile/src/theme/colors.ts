import { Platform } from "react-native";
import { Color } from "expo-router";

export const colors = {
  label: Platform.select({
    ios: Color.ios.label,
    android: Color.android.dynamic.onSurface,
    default: "#000000",
  })!,
  secondaryLabel: Platform.select({
    ios: Color.ios.secondaryLabel,
    android: Color.android.dynamic.onSurfaceVariant,
    default: "#3c3c43",
  })!,
  tertiaryLabel: Platform.select({
    ios: Color.ios.tertiaryLabel,
    android: Color.android.dynamic.onSurfaceVariant,
    default: "#8e8e93",
  })!,
  separator: Platform.select({
    ios: Color.ios.separator,
    android: Color.android.dynamic.outlineVariant,
    default: "#c6c6c8",
  })!,
  systemBackground: Platform.select({
    ios: Color.ios.systemBackground,
    android: Color.android.dynamic.surface,
    default: "#ffffff",
  })!,
  secondarySystemBackground: Platform.select({
    ios: Color.ios.secondarySystemBackground,
    android: Color.android.dynamic.surfaceVariant,
    default: "#f2f2f7",
  })!,
  tertiarySystemBackground: Platform.select({
    ios: Color.ios.tertiarySystemBackground,
    android: Color.android.dynamic.surfaceVariant,
    default: "#f9f9f9",
  })!,
  systemBlue: Platform.select({
    ios: Color.ios.systemBlue,
    android: Color.android.dynamic.primary,
    default: "#007aff",
  })!,
  systemGreen: Platform.select({
    ios: Color.ios.systemGreen,
    android: Color.android.dynamic.secondary,
    default: "#34c759",
  })!,
  systemOrange: Platform.select({
    ios: Color.ios.systemOrange,
    android: Color.android.dynamic.tertiary,
    default: "#ff9500",
  })!,
  systemRed: Platform.select({
    ios: Color.ios.systemRed,
    android: Color.android.dynamic.error,
    default: "#ff3b30",
  })!,
  systemPink: Platform.select({
    ios: Color.ios.systemPink,
    android: Color.android.dynamic.onSecondaryContainer,
    default: "#ff2d55",
  })!,
  systemPurple: Platform.select({
    ios: Color.ios.systemPurple,
    android: Color.android.dynamic.onTertiary,
    default: "#af59de",
  })!,
  systemYellow: Platform.select({
    ios: Color.ios.systemYellow,
    android: Color.android.dynamic.secondaryContainer,
    default: "#ffcc00",
  })!,

  pressureNormal: Platform.select({
    ios: Color.ios.systemGreen,
    android: Color.android.dynamic.secondary,
    default: "#34c759",
  })!,
  pressureElevated: Platform.select({
    ios: Color.ios.systemOrange,
    android: Color.android.dynamic.tertiary,
    default: "#ff9500",
  })!,
  pressureHigh: Platform.select({
    ios: Color.ios.systemRed,
    android: Color.android.dynamic.error,
    default: "#ff3b30",
  })!,

  onTint: "#ffffff",
  onAccent: "#ffffff",
} as const;

import React, { useMemo } from "react";
import { View, Text, ViewProps, StyleSheet } from "react-native";
import { colors, spacing, radius } from "@/theme";
import { useFontScale, scaleFont } from "@/theme/fontScale";

interface BadgeProps extends ViewProps {
  label: string;
  color?: "normal" | "elevated" | "high" | "blue" | "green" | "orange" | "red" | "darkred" | "gray";
  size?: "sm" | "md";
}

const colorMap = {
  normal: colors.pressureNormal,
  elevated: colors.pressureElevated,
  high: colors.pressureHigh,
  blue: colors.systemBlue,
  green: colors.systemGreen,
  orange: colors.systemOrange,
  red: colors.systemRed,
  darkred: colors.pressureHigh,
  gray: colors.separator,
} as const;

export function Badge({ label, color = "gray", size = "md", style }: BadgeProps) {
  const bg = colorMap[color];
  const fontScale = useFontScale();
  const baseSize = size === "sm" ? 11 : 13;
  const fontSize = useMemo(() => scaleFont(baseSize, fontScale), [fontScale, baseSize]);

  return (
    <View
      style={[
        styles.badge,
        { backgroundColor: `${bg}${16}` as string, paddingHorizontal: size === "sm" ? spacing.sm : spacing.md, paddingVertical: size === "sm" ? spacing.xs : spacing.sm },
        style,
      ]}
    >
      <Text style={[styles.text, { color: bg as string }, size === "sm" && styles.textSm, { fontSize }]}>
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    borderRadius: radius.full,
    borderCurve: "continuous",
  },
  text: {
    fontWeight: "600" as const,
  },
  textSm: {},
});

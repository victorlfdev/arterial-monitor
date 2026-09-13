import React, { useMemo } from "react";
import { View, Text, ViewProps, StyleSheet } from "react-native";
import { useAppColors, spacing, radius } from "@/theme";
import { useFontScale, scaleFont } from "@/theme/fontScale";

interface BadgeProps extends ViewProps {
  label: string;
  color?: "normal" | "elevated" | "high" | "blue" | "green" | "orange" | "red" | "darkred" | "gray";
  size?: "sm" | "md";
}

const getColorMap = (c: ReturnType<typeof useAppColors>) => ({
  normal: c.pressureNormal,
  elevated: c.pressureElevated,
  high: c.pressureHigh,
  blue: c.systemBlue,
  green: c.systemGreen,
  orange: c.systemOrange,
  red: c.systemRed,
  darkred: c.pressureHigh,
  gray: c.separator,
}) as const;

export function Badge({ label, color = "gray", size = "md", style }: BadgeProps) {
  const colors = useAppColors();
  const map = getColorMap(colors);
  const bg = map[color];
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

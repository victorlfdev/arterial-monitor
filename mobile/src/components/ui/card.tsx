import React from "react";
import { View, ViewProps, StyleSheet, useColorScheme } from "react-native";
import { useAppColors, spacing, radius, shadows } from "@/theme";

interface CardProps extends ViewProps {
  children: React.ReactNode;
  variant?: "flat" | "elevated";
}

export function Card({ children, style, variant = "elevated", ...rest }: CardProps) {
  const colors = useAppColors();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  return (
    <View
      style={[
        styles.card,
        variant === "elevated" && {
          backgroundColor: isDark ? colors.tertiarySystemBackground : colors.systemBackground,
          borderRadius: radius.lg,
          ...shadows.card,
        },
        variant === "flat" && {
          backgroundColor: colors.tertiarySystemBackground,
          borderRadius: radius.md,
        },
        style,
      ]}
      {...rest}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: spacing.lg,
  },
});

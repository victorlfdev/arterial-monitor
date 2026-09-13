import React from "react";
import { View, ViewProps, StyleSheet } from "react-native";
import { useAppColors, spacing, radius, shadows } from "@/theme";

interface CardProps extends ViewProps {
  children: React.ReactNode;
  variant?: "flat" | "elevated";
}

export function Card({ children, style, variant = "elevated", ...rest }: CardProps) {
  const colors = useAppColors();
  return (
    <View
      style={[
        styles.card,
        variant === "elevated" && {
          backgroundColor: colors.systemBackground,
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

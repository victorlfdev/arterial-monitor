import React, { useMemo } from "react";
import { View, Text, ViewProps, StyleSheet, useColorScheme } from "react-native";
import { useAppColors, spacing } from "@/theme";
import { useFontScale, scaleFont } from "@/theme/fontScale";

interface SectionProps extends ViewProps {
  title: string;
  children: React.ReactNode;
}

export function Section({ title, children, style, ...rest }: SectionProps) {
  const colors = useAppColors();
  const fontScale = useFontScale();
  const titleSize = useMemo(() => scaleFont(15, fontScale), [fontScale]);
  const isDark = useColorScheme() === "dark";

  return (
    <View style={[styles.container, { backgroundColor: isDark ? colors.tertiarySystemBackground : colors.systemBackground }, style]} {...rest}>
      <Text style={[styles.title, { fontSize: titleSize, color: colors.secondaryLabel }]}>{title}</Text>
      <View style={styles.content}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 14,
    marginVertical: spacing.sm,
    marginHorizontal: spacing.lg,
  },
  title: {
    fontWeight: "600" as const,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.sm,
  },
  content: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.lg,
  },
});

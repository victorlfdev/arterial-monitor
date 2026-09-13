import React, { useMemo } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Icon } from "./Icon";
import { colors, spacing, radius, shadowCard } from "@/theme";
import { type } from "@/theme/typography";
import { useFontScale, scaleFont } from "@/theme/fontScale";

interface FeatureCardProps {
  icon: string;
  title: string;
  subtitle: string;
  color: string;
  onPress?: () => void;
  comingSoon?: boolean;
}

export function FeatureCard({ icon, title, subtitle, color, onPress, comingSoon = true }: FeatureCardProps) {
  const fontScale = useFontScale();
  const titleSize = useMemo(() => scaleFont(15, fontScale), [fontScale]);
  const subtitleSize = useMemo(() => scaleFont(12, fontScale), [fontScale]);
  const accessibilityLabel = comingSoon ? `${title} - Em breve` : title;

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={onPress}
      disabled={!onPress}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      accessibilityHint={comingSoon ? "Este recurso está em desenvolvimento" : `Abrir ${title}`}
    >
      <View style={[styles.iconCircle, { backgroundColor: color }]}>
        <Icon name={icon as any} size={24} color="#fff" />
      </View>
      <Text style={[styles.title, { fontSize: titleSize }]}>{title}</Text>
      <Text style={[styles.subtitle, { fontSize: subtitleSize }]}>{subtitle}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    minWidth: 150,
    backgroundColor: colors.systemBackground,
    borderRadius: radius.lg,
    padding: spacing.lg,
    alignItems: "center",
    ...shadowCard,
  },
  iconCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: spacing.sm,
  },
  title: {
    ...type.headline,
    marginBottom: 2,
  },
  subtitle: {
    color: colors.tertiaryLabel,
  },
});

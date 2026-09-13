import React, { useEffect } from "react";
import { StyleSheet, View, TouchableOpacity, Text } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
  Easing,
} from "react-native-reanimated";
import { colors, spacing, radius } from "@/theme";
import { scaleFont } from "@/theme/fontScale";

const PULSE_DURATION = 1200;

interface EmptyStateViewProps {
  onPrimaryAction?: () => void;
  primaryActionLabel?: string;
  emptyType: "no-readings" | "no-filters";
}

export function EmptyStateView({
  onPrimaryAction,
  primaryActionLabel = "Registrar primeira medição",
  emptyType,
}: EmptyStateViewProps) {
  const buttonOpacity = useSharedValue(1);

  useEffect(() => {
    buttonOpacity.value = withRepeat(
      withTiming(0.7, { duration: PULSE_DURATION, easing: Easing.ease }),
      2,
      true
    );
  }, []);

  const buttonStyle = useAnimatedStyle(() => ({
    opacity: buttonOpacity.value,
  }));

  const iconEmoji = emptyType === "no-readings" ? "🩺" : "🔍";
  const title =
    emptyType === "no-readings"
      ? "Nenhuma medição ainda"
      : "Nenhuma medição encontrada";
  const description =
    emptyType === "no-readings"
      ? "Comece registrando sua primeira medição de pressão arterial. Assim poderá acompanhar sua evolução ao longo do tempo."
      : "Tente ajustar os filtros para ver suas medições.";

  return (
    <View style={styles.container}>
      <Animated.View style={styles.iconContainer}>
        <Text style={styles.icon}>{iconEmoji}</Text>
      </Animated.View>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.description}>{description}</Text>
      {onPrimaryAction && (
        <TouchableOpacity
          style={styles.ctaButton}
          onPress={onPrimaryAction}
          accessibilityRole="button"
          accessibilityLabel={primaryActionLabel}
        >
          <Animated.View style={[styles.ctaButtonInner, buttonStyle]}>
            <Text style={styles.ctaButtonText}>{primaryActionLabel}</Text>
          </Animated.View>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: spacing.xxl * 1.5,
    paddingHorizontal: spacing.xl,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.secondarySystemBackground,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.xl,
  },
  icon: {
    fontSize: 40,
  },
  title: {
    fontSize: 18,
    fontWeight: "600" as const,
    color: colors.label,
    textAlign: "center",
    marginBottom: spacing.sm,
  },
  description: {
    fontSize: 14,
    color: colors.secondaryLabel,
    textAlign: "center",
    lineHeight: 22,
    marginBottom: spacing.xl,
    maxWidth: 280,
  },
  ctaButton: {
    borderRadius: radius.lg,
    overflow: "hidden",
  },
  ctaButtonInner: {
    backgroundColor: colors.systemBlue,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: radius.lg,
    alignItems: "center",
    justifyContent: "center",
    minWidth: 200,
  },
  ctaButtonText: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: colors.onTint,
  },
});

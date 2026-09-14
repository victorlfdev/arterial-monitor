import React, { useMemo } from "react";
import {
  Pressable,
  ActivityIndicator,
  ViewStyle,
  StyleProp,
  Text,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useAppColors, radius, spacing } from "@/theme";
import { useFontScale, scaleFont } from "@/theme/fontScale";

interface GradientButtonProps {
  title: string;
  onPress?: () => void;
  loading?: boolean;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
  icon?: string;
  iconColor?: string;
}

export function GradientButton({
  title,
  onPress,
  loading,
  disabled,
  style,
  icon,
  iconColor = "#ffffff",
}: GradientButtonProps) {
  const colors = useAppColors();
  const fontScale = useFontScale();
  const textSize = useMemo(() => scaleFont(16, fontScale), [fontScale]);
  const iconSize = useMemo(() => scaleFont(18, fontScale), [fontScale]);

  const gradientColors: [string, string] = useMemo(() => {
    if (disabled) {
      const lighten = (hex: string, amount: number) => {
        const num = parseInt(hex.replace("#", ""), 16);
        const r = Math.min(255, ((num >> 16) & 0xff) + amount);
        const g = Math.min(255, ((num >> 8) & 0xff) + amount);
        const b = Math.min(255, (num & 0xff) + amount);
        return `#${(r << 16) | (g << 8) | b}`;
      };
      return [
        lighten(colors.coral, 40),
        lighten(colors.teal, 40),
      ] as [string, string];
    }
    return [colors.coral, colors.teal] as [string, string];
  }, [colors.coral, colors.teal, disabled]);

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={title}
      accessibilityState={{ disabled: !!(disabled || loading), busy: !!loading }}
      disabled={disabled || loading}
      onPress={onPress}
      style={({ pressed }) => ({
        borderRadius: radius.full,
        borderCurve: "continuous",
        overflow: "hidden",
        opacity: disabled ? 0.5 : pressed ? 0.85 : 1,
        ...(style as ViewStyle),
      })}
    >
      <LinearGradient
        colors={disabled ? [gradientColors[0], gradientColors[1]] : gradientColors}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={{
          alignItems: "center",
          justifyContent: "center",
          flexDirection: "row",
          gap: spacing.sm,
          flex: 1,
        }}
      >
        {icon && !loading && (
          <Text style={{ fontSize: iconSize, color: iconColor }}>{icon}</Text>
        )}
        {loading ? (
          <ActivityIndicator color={iconColor} />
        ) : (
          <Text
            style={{
              fontSize: textSize,
              fontWeight: "700" as const,
              color: "#ffffff",
            }}
          >
            {title}
          </Text>
        )}
      </LinearGradient>
    </Pressable>
  );
}

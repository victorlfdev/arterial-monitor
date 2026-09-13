import React, { useMemo } from "react";
import {
  Pressable,
  ActivityIndicator,
  ViewStyle,
  StyleProp,
  TextProps as RNTextProps,
  Text,
} from "react-native";
import { useAppColors, radius, spacing } from "@/theme";
import { useFontScale, scaleFont } from "@/theme/fontScale";

export function ThemedText({
  variant = "body",
  style,
  ...props
}: RNTextProps & { variant?: string }) {
  return <Text style={[{ [variant]: true } as any, style]} {...props} />;
}

interface ButtonProps {
  title: string;
  onPress?: () => void;
  variant?: "primary" | "secondary" | "destructive" | "ghost";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
  icon?: string;
}

export function Button({
  title,
  onPress,
  variant = "primary",
  size = "md",
  loading,
  disabled,
  style,
  icon,
}: ButtonProps) {
  const colors = useAppColors();
  const fontScale = useFontScale();
  const iconSize = useMemo(() => scaleFont(18, fontScale), [fontScale]);
  const textSize = useMemo(() => scaleFont(16, fontScale), [fontScale]);
  const v = variantStyles[variant](colors);
  const s = sizeStyles[size];
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={title}
      accessibilityState={{ disabled: !!(disabled || loading), busy: !!loading }}
      disabled={disabled || loading}
      onPress={onPress}
      style={({ pressed }) => ({
        borderRadius: radius.md,
        borderCurve: "continuous",
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "row",
        gap: spacing.sm,
        backgroundColor: variant === "ghost" ? "transparent" : v.backgroundColor,
        opacity: disabled ? 0.4 : pressed ? 0.85 : 1,
        ...s,
        ...style,
      })}
    >
      {icon && <Text style={{ fontSize: iconSize, color: v.textColor }}>{icon}</Text>}
      {loading ? (
        <ActivityIndicator color={v.textColor} />
      ) : (
        <Text style={{ fontSize: textSize, fontWeight: "600" as const, color: v.textColor }}>
          {title}
        </Text>
      )}
    </Pressable>
  );
}

const variantStyles = {
  primary: (c: ReturnType<typeof useAppColors>) => ({ backgroundColor: c.systemBlue, textColor: c.onTint }),
  secondary: (c: ReturnType<typeof useAppColors>) => ({ backgroundColor: c.secondarySystemBackground, textColor: c.systemBlue }),
  destructive: (c: ReturnType<typeof useAppColors>) => ({ backgroundColor: c.systemRed, textColor: c.onTint }),
  ghost: (c: ReturnType<typeof useAppColors>) => ({ backgroundColor: "transparent", textColor: c.systemBlue }),
} as const;

const sizeStyles = {
  sm: { paddingVertical: spacing.md, paddingHorizontal: spacing.md, minHeight: 44 },
  md: { paddingVertical: spacing.sm, paddingHorizontal: spacing.md },
  lg: { paddingVertical: spacing.md, paddingHorizontal: spacing.xl },
} as const;

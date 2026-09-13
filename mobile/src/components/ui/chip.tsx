import React, { useMemo } from "react";
import { TouchableOpacity, Text, ViewStyle, StyleProp, StyleSheet } from "react-native";
import { useAppColors, radius } from "@/theme";
import { useFontScale, scaleFont } from "@/theme/fontScale";

interface ChipProps {
  label: string;
  active?: boolean;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
}

export function Chip({ label, active = false, onPress, style }: ChipProps) {
  const colors = useAppColors();
  const fontScale = useFontScale();
  const fontSize = useMemo(() => scaleFont(13, fontScale), [fontScale]);
  const accessibilityLabel = active ? `${label} (ativado)` : label;

  return (
    <TouchableOpacity
      style={[
        styles.chip,
        { backgroundColor: active ? colors.systemBlue : colors.separator },
        style,
      ]}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      accessibilityState={{ selected: active }}
    >
      <Text
        style={[
          styles.text,
          { color: active ? colors.onTint : colors.secondaryLabel, fontSize },
        ]}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: radius.full,
    borderCurve: "continuous",
    minHeight: 44,
  },
  text: {
    fontWeight: "500" as const,
  },
});

import React, { useMemo } from "react";
import { View, Text } from "react-native";
import { useAppColors, spacing } from "@/theme";
import { useFontScale, scaleFont } from "@/theme/fontScale";

interface ProgressDayProps {
  day: string;
  date: string;
  hasMeasurement?: boolean;
  isActive?: boolean;
}

export function ProgressDay({ day, date, hasMeasurement, isActive }: ProgressDayProps) {
  const colors = useAppColors();
  const fontScale = useFontScale();

  const barWidth = useMemo(() => scaleFont(8, fontScale), [fontScale]);
  const daySize = useMemo(() => scaleFont(11, fontScale), [fontScale]);
  const dateSize = useMemo(() => scaleFont(11, fontScale), [fontScale]);
  const barHeight = useMemo(() => scaleFont(20, fontScale), [fontScale]);

  const textColor = hasMeasurement ? colors.label : colors.tertiaryLabel;
  const barBgColor = hasMeasurement
    ? colors.teal
    : String(colors.separator) + "40";

  return (
    <View style={{ alignItems: "center", gap: spacing.xs }}>
      <View
        style={{
          width: barWidth,
          height: barHeight,
          borderRadius: barWidth / 2,
          backgroundColor: barBgColor,
        }}
      />
      <Text style={{ fontSize: daySize, fontWeight: "600" as const, color: textColor }}>
        {day}
      </Text>
      <Text style={{ fontSize: dateSize, color: textColor }}>{date}</Text>
    </View>
  );
}

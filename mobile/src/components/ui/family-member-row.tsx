import React, { useMemo } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { useAppColors, spacing } from "@/theme";
import { useFontScale, scaleFont } from "@/theme/fontScale";

interface FamilyMemberRowProps {
  name: string;
  relation: string;
  lastReading: string;
  statusColor?: "green" | "orange" | "red";
  avatarColor?: string;
  onPress?: () => void;
}

export function FamilyMemberRow({
  name,
  relation,
  lastReading,
  statusColor = "green",
  avatarColor,
  onPress,
}: FamilyMemberRowProps) {
  const colors = useAppColors();
  const fontScale = useFontScale();

  const initial = useMemo(() => name.charAt(0).toUpperCase(), [name]);

  const statusDotColors = useMemo(() => {
    if (statusColor === "green") return colors.pressureNormal;
    if (statusColor === "orange") return colors.pressureElevated;
    return colors.pressureHigh;
  }, [statusColor, colors.pressureNormal, colors.pressureElevated, colors.pressureHigh]);

  const nameSize = useMemo(() => scaleFont(16, fontScale), [fontScale]);
  const readingSize = useMemo(() => scaleFont(14, fontScale), [fontScale]);

  const avatarBg = useMemo(
    () => avatarColor || colors.teal,
    [avatarColor, colors.teal]
  );

  return (
    <TouchableOpacity
      onPress={onPress}
      style={{
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: spacing.md,
        paddingHorizontal: spacing.xs,
      }}
    >
      <View
        style={{
          width: 44,
          height: 44,
          borderRadius: 22,
          backgroundColor: avatarBg,
          justifyContent: "center",
          alignItems: "center",
          marginRight: spacing.md,
        }}
      >
        <Text
          style={{
            fontSize: scaleFont(16, fontScale),
            fontWeight: "700" as const,
            color: "#ffffff",
          }}
        >
          {initial}
        </Text>
      </View>
      <View style={{ flex: 1 }}>
        <Text
          style={{
            fontSize: nameSize,
            fontWeight: "700" as const,
            color: colors.label,
          }}
        >
          {name}
        </Text>
        <Text
          style={{
            fontSize: readingSize,
            color: colors.secondaryLabel,
          }}
        >
          Última: {lastReading}
        </Text>
      </View>
      <View
        style={{
          width: 12,
          height: 12,
          borderRadius: 6,
          backgroundColor: statusDotColors,
          marginLeft: spacing.sm,
        }}
      />
    </TouchableOpacity>
  );
}

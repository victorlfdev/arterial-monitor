import React, { useMemo } from "react";
import { View, Text } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useAppColors, spacing, radius } from "@/theme";
import { useFontScale, scaleFont } from "@/theme/fontScale";

interface WeekChallengeProps {
  completedCount: number;
  totalCount: number;
  streakDays?: number;
}

export function WeekChallenge({ completedCount, totalCount, streakDays }: WeekChallengeProps) {
  const colors = useAppColors();
  const fontScale = useFontScale();

  const progress = useMemo(() => completedCount / totalCount, [completedCount, totalCount]);
  const progressWidth = useMemo(
    () => (96 * progress) + "px",
    [progress]
  );

  const subtitleSize = useMemo(() => scaleFont(14, fontScale), [fontScale]);
  const countSize = useMemo(() => scaleFont(14, fontScale), [fontScale]);

  function fs(base: number) {
    return scaleFont(base, fontScale);
  }

  return (
    <View
      style={{
        backgroundColor: colors.systemBackground,
        borderRadius: radius.lg,
        padding: spacing.lg,
        marginTop: spacing.sm,
      }}
    >
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: spacing.sm,
        }}
      >
        <Text style={{ fontSize: fs(17), fontWeight: "700" as const, color: colors.label }}>
          Desafio da semana
        </Text>
        <Text
          style={{
            fontSize: countSize,
            fontWeight: "600" as const,
            color: colors.teal,
          }}
        >
          {completedCount}/{totalCount} concluídos
        </Text>
      </View>
      <Text
        style={{
          fontSize: subtitleSize,
          color: colors.secondaryLabel,
          marginBottom: spacing.md,
        }}
      >
        Meça sua pressão 7 dias seguidos
      </Text>
      {streakDays && streakDays >= 7 && (
        <View
          style={{
            backgroundColor: `${colors.amarelo}20`,
            borderRadius: radius.md,
            paddingHorizontal: spacing.sm,
            paddingVertical: spacing.xs,
            marginBottom: spacing.sm,
            alignSelf: "flex-end",
          }}
        >
          <Text
            style={{
              fontSize: countSize,
              fontWeight: "600" as const,
              color: colors.amarelo,
            }}
          >
            {streakDays} dias seguidos! 🔥
          </Text>
        </View>
      )}
      <View
        style={{
          height: 8,
          borderRadius: 4,
          backgroundColor: colors.separator,
          overflow: "hidden",
        }}
      >
        <LinearGradient
          colors={[colors.coral, colors.teal]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={{
            width: progressWidth,
            height: "100%",
            borderRadius: 4,
          }}
        />
      </View>
    </View>
  );
}

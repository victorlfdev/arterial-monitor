import React from "react";
import { View, Text, StyleSheet, useColorScheme } from "react-native";
import { useAppColors, spacing, radius } from "@/theme";
import { useFontScale, scaleFont } from "@/theme/fontScale";

export function WeekChallenge({ completedCount, totalCount, streakDays }) {
  const colors = useAppColors();
  const fontScale = useFontScale();
  const isDark = useColorScheme() === "dark";

  const progress = completedCount / totalCount;
  const progressWidth = 96 * progress;
  const subtitleSize = scaleFont(14, fontScale);
  const countSize = scaleFont(14, fontScale);

  function fs(base) {
    return scaleFont(base, fontScale);
  }

  const styles = React.useMemo(
    () =>
      StyleSheet.create({
        container: {
          backgroundColor: isDark ? colors.tertiarySystemBackground : colors.systemBackground,
          borderRadius: radius.lg,
          padding: spacing.lg,
          marginTop: spacing.sm,
        },
        header: {
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: spacing.sm,
        },
        title: {
          fontSize: fs(17),
          fontWeight: "700",
          color: colors.label,
        },
        count: {
          fontSize: countSize,
          fontWeight: "600",
          color: colors.teal,
        },
        subtitle: {
          fontSize: subtitleSize,
          color: colors.secondaryLabel,
          marginBottom: spacing.md,
        },
        badge: {
          backgroundColor: colors.amarelo + "20",
          borderRadius: radius.md,
          paddingHorizontal: spacing.sm,
          paddingVertical: spacing.xs,
          marginBottom: spacing.sm,
          alignSelf: "flex-end",
        },
        badgeText: {
          fontSize: countSize,
          fontWeight: "600",
          color: colors.amarelo,
        },
        progressContainer: {
          height: 8,
          borderRadius: 4,
          backgroundColor: colors.separator,
          overflow: "hidden",
        },
        progressBar: {
          width: progressWidth,
          height: "100%",
          borderRadius: 4,
        },
      }),
    [colors, fontScale, isDark, progressWidth, subtitleSize, countSize, fs]
  );

  return React.createElement(View, { style: styles.container },
    React.createElement(View, { style: styles.header },
      React.createElement(Text, { style: styles.title }, "Desafio da semana"),
      React.createElement(Text, { style: styles.count },
        String(completedCount) + "/" + String(totalCount) + " conclu\u00EDdos")
    ),
    React.createElement(Text, { style: styles.subtitle }, "Me\u00E7a sua press\u00E3o 7 dias seguidos"),
    streakDays && streakDays >= 7
      ? React.createElement(View, { style: styles.badge },
          React.createElement(Text, { style: styles.badgeText },
            String(streakDays) + " dias seguidos! \uD83D\uDD25")
        )
      : null,
    React.createElement(View, { style: styles.progressContainer },
      React.createElement(View, { style: styles.progressBar })
    )
  );
}

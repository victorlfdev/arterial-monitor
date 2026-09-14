import React from "react";
import { StyleSheet, View, useColorScheme } from "react-native";
import Animated from "react-native-reanimated";
import { useAppColors, spacing, radius } from "@/theme";

const CARD_COUNT = 4;

export function HomeLoadingView() {
  const colors = useAppColors();
  const isDark = useColorScheme() === "dark";
  return (
    <View style={[styles.container]}>
      {Array.from({ length: CARD_COUNT }, (_, i) => (
        <Animated.View key={i} style={[styles.card, { backgroundColor: isDark ? colors.tertiarySystemBackground : colors.systemBackground }]}>
          <View style={styles.cardRow}>
            <View style={[styles.cardCircle, { backgroundColor: `${colors.separator}4D`, opacity: 0.3 }]}>
              <Animated.View
                style={[
                  styles.shimmerOverlay,
                  { backgroundColor: `${colors.separator}80` }
                ]}
              />
            </View>
            <View style={styles.cardTextBlock}>
              <View style={[styles.cardLineLong, { backgroundColor: `${colors.separator}4D` }]} />
              <View style={[styles.cardLineShort, { backgroundColor: `${colors.separator}4D` }]} />
            </View>
          </View>
        </Animated.View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    gap: spacing.md,
  },
  card: {
    borderRadius: radius.lg,
    padding: spacing.lg,
  },
  cardRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
  },
  cardCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    overflow: "hidden",
  },
  shimmerOverlay: {
    position: "absolute",
    width: 28,
    height: "100%",
    opacity: 0.5,
    borderRadius: 14,
    left: 8,
  },
  cardTextBlock: {
    flex: 1,
    gap: spacing.sm,
  },
  cardLineLong: {
    height: 12,
    borderRadius: 6,
    opacity: 0.3,
    width: "85%",
  },
  cardLineShort: {
    height: 10,
    borderRadius: 5,
    opacity: 0.3,
    width: "50%",
  },
});

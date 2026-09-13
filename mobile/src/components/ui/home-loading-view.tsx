import React, { useEffect } from "react";
import { StyleSheet, View } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withTiming,
  Easing,
} from "react-native-reanimated";
import { colors, spacing, radius } from "@/theme";

const CARD_COUNT = 4;

const CARD_STAGGER = 80;
const CARD_FADE_IN = 350;
const CARD_EASE = Easing.bezier(0, 0, 0.2, 1);

const SHIMMER_SWEEP = 1600;
const SHIMMER_EASE = Easing.bezier(0.4, 0, 0.2, 1);

function ShimmerCard({ index }: { index: number }) {
  const cardOpacity = useSharedValue(0);
  const shimmerOpacity = useSharedValue(0);
  const shimmerTranslate = useSharedValue(-40);

  useEffect(() => {
    const startDelay = index * CARD_STAGGER;

    cardOpacity.value = withDelay(
      startDelay,
      withTiming(1, { duration: CARD_FADE_IN, easing: CARD_EASE })
    );

    shimmerOpacity.value = withDelay(
      startDelay + CARD_FADE_IN,
      withTiming(1, { duration: 300, easing: CARD_EASE })
    );

    shimmerTranslate.value = -40;

    setTimeout(() => {
      shimmerOpacity.value = withRepeat(
        withSequence(
          withTiming(0.6, { duration: SHIMMER_SWEEP / 2, easing: SHIMMER_EASE }),
          withTiming(0.1, { duration: SHIMMER_SWEEP / 2, easing: SHIMMER_EASE })
        ),
        -1
      );
      shimmerTranslate.value = withRepeat(
        withSequence(
          withTiming(20, { duration: SHIMMER_SWEEP, easing: Easing.out(Easing.ease) }),
          withTiming(-40, { duration: 100, easing: SHIMMER_EASE })
        ),
        -1
      );
    }, startDelay + CARD_FADE_IN + 300);
  }, [index]);

  const cardStyle = useAnimatedStyle(() => ({
    opacity: cardOpacity.value,
  }));

  const shimmerStyle = useAnimatedStyle(() => ({
    opacity: shimmerOpacity.value,
    transform: [{ translateX: shimmerTranslate.value }],
  }));

  return (
    <Animated.View style={[styles.card, cardStyle]}>
      <View style={styles.cardRow}>
        <View style={styles.cardCircle}>
          <Animated.View
            style={[
              styles.shimmerOverlay,
              shimmerStyle,
            ]}
          />
        </View>
        <View style={styles.cardTextBlock}>
          <View style={styles.cardLineLong} />
          <View style={styles.cardLineShort} />
        </View>
      </View>
    </Animated.View>
  );
}

export function HomeLoadingView() {
  return (
    <View style={styles.container}>
      {Array.from({ length: CARD_COUNT }, (_, i) => (
        <ShimmerCard key={i} index={i} />
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
    backgroundColor: colors.systemBackground,
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
    backgroundColor: colors.separator,
    opacity: 0.3,
    overflow: "hidden",
  },
  shimmerOverlay: {
    position: "absolute",
    width: 28,
    height: "100%",
    backgroundColor: colors.separator,
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
    backgroundColor: colors.separator,
    opacity: 0.3,
    width: "85%",
  },
  cardLineShort: {
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.separator,
    opacity: 0.3,
    width: "50%",
  },
});

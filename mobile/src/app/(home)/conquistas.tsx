import React, { useMemo } from "react";
import {
  StyleSheet,
  View,
  ScrollView,
  Text,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { Icon } from "@/components/ui/Icon";
import useAppStore from "@/store/useAppStore";
import { colors, spacing, radius, shadowCard } from "@/theme";
import { useFontScale, scaleFont } from "@/theme/fontScale";

export default function ConquistasScreen() {
  const insets = useSafeAreaInsets();
  const fontScale = useFontScale();
  const { readings } = useAppStore();
  const count = readings.length;
  const has7DayStreak = count >= 7;
  const has100Readings = count >= 100;
  const hasFirstReading = count >= 1;

  const s = useMemo(() => {
    const fs = (base: number) => scaleFont(base, fontScale);
    return StyleSheet.create({
      title: { fontSize: fs(28), fontWeight: "700" as const, color: colors.label },
      subtitle: { fontSize: fs(15), color: colors.secondaryLabel, marginTop: spacing.xs },
      progressText: { fontSize: fs(13), color: colors.tertiaryLabel, marginTop: spacing.sm, textAlign: "right" },
      cardTitle: { fontSize: fs(14), fontWeight: "600" as const, color: colors.label, textAlign: "center", marginBottom: spacing.xs },
      cardDesc: { fontSize: fs(12), color: colors.secondaryLabel, textAlign: "center", marginBottom: spacing.sm },
      unlockedText: { fontSize: fs(11), fontWeight: "600" as const, color: colors.onTint },
    });
  }, [fontScale]);

  const achievements = [
    {
      id: "first",
      title: "Primeira Medição",
      description: "Registre sua primeira medição de pressão arterial",
      icon: "medical",
      color: colors.systemBlue,
      unlocked: hasFirstReading,
    },
    {
      id: "week",
      title: "Uma Semana de Dedicação",
      description: "Mantenha registros por 7 dias consecutivos",
      icon: "flame",
      color: colors.systemOrange,
      unlocked: has7DayStreak,
    },
    {
      id: "hundred",
      title: "Cento Medições",
      description: "Complete 100 medições no seu histórico",
      icon: "trophy",
      color: colors.systemYellow,
      unlocked: has100Readings,
    },
    {
      id: "controller",
      title: "Controlador",
      description: "Mantenha pressão normal por 30 dias",
      icon: "checkmark-done-circle",
      color: colors.systemGreen,
      unlocked: false,
    },
    {
      id: "punctual",
      title: "Pontualidade",
      description: "Registre medições pela manhã e à noite por uma semana",
      icon: "time",
      color: colors.systemPurple,
      unlocked: false,
    },
    {
      id: "sharing",
      title: "Compartilhador",
      description: "Compartilhe seus relatórios com seu médico",
      icon: "share",
      color: colors.systemPink,
      unlocked: false,
    },
  ];

  const unlockedCount = achievements.filter((a) => a.unlocked).length;

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 32 }]}
        contentInsetAdjustmentBehavior="automatic"
      >
        <View style={styles.header}>
          <Text style={s.title}>Conquistas</Text>
          <Text style={s.subtitle}>
            {unlockedCount} de {achievements.length} desbloqueadas
          </Text>
        </View>

        {/* Progress bar */}
        <View style={styles.progressWrap}>
          <View style={styles.progressBar}>
            <View
              style={[
                styles.progressFill,
                {
                  width: `${(unlockedCount / achievements.length) * 100}%`,
                  backgroundColor: colors.systemGreen,
                },
              ]}
            />
          </View>
          <Text style={s.progressText}>
            {Math.round((unlockedCount / achievements.length) * 100)}% concluído
          </Text>
        </View>

        {/* Achievements grid */}
        <View style={styles.grid}>
          {achievements.map((a) => (
            <TouchableOpacity
              key={a.id}
              style={[
                styles.card,
                !a.unlocked && styles.cardLocked,
              ]}
              disabled
            >
              <View
                style={[
                  styles.iconCircle,
                  {
                    backgroundColor: a.unlocked
                      ? a.color
                      : colors.separator,
                  },
                ]}
              >
                <Icon
                  name={a.icon as any}
                  size={28}
                  color={a.unlocked ? colors.onTint : colors.tertiaryLabel}
                />
              </View>
              <Text
                style={[
                  s.cardTitle,
                  !a.unlocked && styles.cardTitleLocked,
                ]}
              >
                {a.title}
              </Text>
              <Text style={s.cardDesc}>{a.description}</Text>
              {a.unlocked && (
                <View style={styles.unlockedBadge}>
                  <Icon name="checkmark" size={14} color={colors.onTint} />
                  <Text style={s.unlockedText}>Desbloqueada</Text>
                </View>
              )}
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.secondarySystemBackground,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: spacing.lg,
  },
  header: {
    marginBottom: spacing.lg,
  },
  title: {
    fontWeight: "700" as const,
    color: colors.label,
  },
  subtitle: {
    color: colors.secondaryLabel,
    marginTop: spacing.xs,
  },
  progressWrap: {
    marginBottom: spacing.xxl,
  },
  progressBar: {
    height: 8,
    backgroundColor: colors.separator,
    borderRadius: 4,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: 4,
  },
  progressText: {
    color: colors.tertiaryLabel,
    marginTop: spacing.sm,
    textAlign: "right",
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.md,
  },
  card: {
    flex: 1,
    minWidth: "48%",
    backgroundColor: colors.systemBackground,
    borderRadius: radius.lg,
    padding: spacing.lg,
    alignItems: "center",
    ...shadowCard,
  },
  cardLocked: {
    opacity: 0.5,
  },
  iconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: spacing.sm,
  },
  cardTitle: {
    fontWeight: "600" as const,
    color: colors.label,
    textAlign: "center",
    marginBottom: spacing.xs,
  },
  cardTitleLocked: {
    color: colors.tertiaryLabel,
  },
  cardDesc: {
    color: colors.secondaryLabel,
    textAlign: "center",
    marginBottom: spacing.sm,
  },
  unlockedBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: colors.systemGreen,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radius.full,
  },
  unlockedText: {
    fontWeight: "600" as const,
    color: colors.onTint,
  },
});

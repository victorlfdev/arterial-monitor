import React, { useMemo } from "react";
import {
  StyleSheet,
  View,
  ScrollView,
  Text,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { Icon } from "@/components/ui/Icon";
import { colors, spacing, radius, shadowCard } from "@/theme";
import { useFontScale, scaleFont } from "@/theme/fontScale";

export default function DesafiosScreen() {
  const insets = useSafeAreaInsets();
  const fontScale = useFontScale();

  const s = useMemo(() => {
    const fs = (base: number) => scaleFont(base, fontScale);
    return StyleSheet.create({
      title: { fontSize: fs(28), fontWeight: "700" as const, color: colors.label, marginBottom: spacing.xs },
      subtitle: { fontSize: fs(15), color: colors.secondaryLabel, marginBottom: spacing.xxl },
      sectionHeader: { fontSize: fs(17), fontWeight: "600" as const, color: colors.label, marginBottom: spacing.md },
      challengeTitle: { fontSize: fs(15), fontWeight: "600" as const, color: colors.label, marginBottom: 2 },
      challengeDesc: { fontSize: fs(13), color: colors.secondaryLabel },
      progressCount: { fontSize: fs(13), color: colors.tertiaryLabel, fontWeight: "600" as const },
    });
  }, [fontScale]);

  const dailyChallenges = [
    {
      id: "morning",
      title: "Medição da Manhã",
      description: "Registre sua pressão arterial logo ao acordar",
      icon: "sunny",
      color: colors.systemYellow,
      completed: false,
    },
    {
      id: "evening",
      title: "Medição da Noite",
      description: "Registre sua pressão antes de dormir",
      icon: "moon",
      color: colors.systemPurple,
      completed: false,
    },
    {
      id: "symptoms",
      title: "Registrar Sintomas",
      description: "Anote quaisquer sintomas sentidos hoje",
      icon: "alert-circle",
      color: colors.systemOrange,
      completed: false,
    },
  ];

  const consistencyChallenges = [
    {
      id: "streak7",
      title: "Sequência de 7 Dias",
      description: "Registre medições por 7 dias seguidos",
      icon: "flame",
      color: colors.systemOrange,
      progress: 0,
      target: 7,
    },
    {
      id: "streak30",
      title: "Sequência de 30 Dias",
      description: "Mantenha registros diários por um mês",
      icon: "trophy",
      color: colors.systemYellow,
      progress: 0,
      target: 30,
    },
    {
      id: "twice_daily",
      title: "Duas Medições Diárias",
      description: "Faça manhã e noite no mesmo dia",
      icon: "time",
      color: colors.systemBlue,
      completed: false,
    },
  ];

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 32 }]}
        contentInsetAdjustmentBehavior="automatic"
      >
        <Text style={s.title}>Desafios</Text>
        <Text style={s.subtitle}>Mantenha seus hábitos de saúde em dia</Text>

        <View style={styles.section}>
          <Text style={s.sectionHeader}>Desafios Diários</Text>
          {dailyChallenges.map((c) => (
            <View key={c.id} style={styles.challengeCard}>
              <View style={[styles.challengeIcon, { backgroundColor: c.color }]}>
                  <Icon name={c.icon as any} size={24} color={colors.onTint} />
              </View>
              <View style={styles.challengeInfo}>
                <Text style={s.challengeTitle}>{c.title}</Text>
                <Text style={s.challengeDesc}>{c.description}</Text>
              </View>
              <View
                style={[
                  styles.challengeDot,
                  c.completed
                    ? { backgroundColor: colors.systemGreen }
                    : { backgroundColor: colors.separator },
                ]}
              />
            </View>
          ))}
        </View>

        <View style={styles.section}>
          <Text style={s.sectionHeader}>Desafios de Consistência</Text>
          {consistencyChallenges.map((c) => (
            <View key={c.id} style={styles.progressCard}>
              <View style={styles.progressCardHeader}>
                <View style={[styles.challengeIcon, { backgroundColor: c.color }]}>
                <Icon name={c.icon as any} size={24} color={colors.onTint} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={s.challengeTitle}>{c.title}</Text>
                  <Text style={s.challengeDesc}>{c.description}</Text>
                </View>
              </View>
              <View style={styles.progressFooter}>
                <View style={styles.progressBar}>
                  <View
                    style={[
                      styles.progressFill,
                      {
                        width: `${((c.progress || 0) / c.target) * 100}%`,
                        backgroundColor: colors.systemGreen,
                      },
                    ]}
                  />
                </View>
                <Text style={s.progressCount}>
                  {c.progress || 0}/{c.target} dias
                </Text>
              </View>
            </View>
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
  title: {
    fontWeight: "700" as const,
    color: colors.label,
    marginBottom: spacing.xs,
  },
  subtitle: {
    color: colors.secondaryLabel,
    marginBottom: spacing.xxl,
  },
  section: {
    marginBottom: spacing.xxl,
  },
  sectionHeader: {
    fontWeight: "600" as const,
    color: colors.label,
    marginBottom: spacing.md,
  },
  challengeCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.systemBackground,
    borderRadius: radius.lg,
    padding: spacing.lg,
    marginBottom: spacing.sm,
    gap: spacing.md,
    ...shadowCard,
  },
  challengeIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
  },
  challengeInfo: {
    flex: 1,
  },
  challengeTitle: {
    fontWeight: "600" as const,
    color: colors.label,
    marginBottom: 2,
  },
  challengeDesc: {
    color: colors.secondaryLabel,
  },
  challengeDot: {
    width: 24,
    height: 24,
    borderRadius: 12,
  },
  progressCard: {
    backgroundColor: colors.systemBackground,
    borderRadius: radius.lg,
    padding: spacing.lg,
    marginBottom: spacing.sm,
    ...shadowCard,
  },
  progressCardHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  progressFooter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  progressBar: {
    flex: 1,
    height: 6,
    backgroundColor: colors.separator,
    borderRadius: 3,
    overflow: "hidden",
    marginRight: spacing.sm,
  },
  progressFill: {
    height: "100%",
    borderRadius: 3,
  },
  progressCount: {
    color: colors.tertiaryLabel,
    fontWeight: "600" as const,
  },
});

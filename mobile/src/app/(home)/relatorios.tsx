import React from "react";
import {
  StyleSheet,
  View,
  ScrollView,
  Text,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Icon } from "@/components/ui/Icon";
import useAppStore from "@/store/useAppStore";
import { colors, spacing, radius, shadowCard } from "@/theme";

export default function RelatoriosScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { readings, medications } = useAppStore();
  const hasData = readings.length > 0;

  const reportOptions = [
    {
      id: "weekly",
      title: "Relatório Semanal",
      description: "Resumo das medições da semana com gráficos e estatísticas",
      icon: "bar-chart",
      color: colors.systemBlue,
      available: readings.length >= 7,
    },
    {
      id: "monthly",
      title: "Relatório Mensal",
      description: "Análise completa do mês com tendências e comparações",
      icon: "calendar",
      color: colors.systemPurple,
      available: readings.length >= 30,
    },
    {
      id: "custom",
      title: "Período Personalizado",
      description: "Gere relatórios para qualquer intervalo de datas",
      icon: "options",
      color: colors.systemOrange,
      available: true,
    },
  ];

  const shareOptions = [
    {
      id: "doctor",
      title: "Enviar ao Médico",
      description: "Exporte PDF para compartilhar com seu profissional de saúde",
      icon: "document",
      color: colors.systemGreen,
    },
    {
      id: "family",
      title: "Compartilhar com Família",
      description: "Envie resumo para membros da sua rede de apoio",
      icon: "share",
      color: colors.systemBlue,
    },
  ];

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 32 }]}
        contentInsetAdjustmentBehavior="automatic"
      >
        <Text style={styles.title}>Relatórios</Text>
        <Text style={styles.subtitle}>
          Acompanhe sua evolução e compartilhe com quem importa
        </Text>

        {hasData ? (
          <>
            {/* Stats summary */}
            <View style={styles.summaryCard}>
              <View style={styles.summaryRow}>
                <View style={styles.summaryStat}>
                  <Text style={styles.summaryValue}>{readings.length}</Text>
                  <Text style={styles.summaryLabel}>Medições</Text>
                </View>
                <View style={styles.summaryStat}>
                  <Text style={styles.summaryValue}>{medications.length}</Text>
                  <Text style={styles.summaryLabel}>Medicamentos</Text>
                </View>
              </View>
            </View>

            {/* Reports */}
            <View style={styles.section}>
              <Text style={styles.sectionHeader}>Gerar Relatórios</Text>
              {reportOptions.map((r) => (
                <TouchableOpacity
                  key={r.id}
                  style={[
                    styles.reportCard,
                    !r.available && styles.reportCardDisabled,
                  ]}
                  disabled={!r.available}
                  onPress={() => {}}
                >
                  <View style={[styles.reportIcon, { backgroundColor: r.color }]}>
                    <Icon name={r.icon as any} size={24} color={colors.onTint} />
                  </View>
                  <View style={styles.reportInfo}>
                    <Text style={styles.reportTitle}>{r.title}</Text>
                    <Text style={styles.reportDesc}>{r.description}</Text>
                    {!r.available && (
                      <Text style={styles.reportLocked}>
                        Precisa de dados suficientes
                      </Text>
                    )}
                  </View>
                  <Icon
                    name="chevron-forward-outline"
                    size={20}
                    color={r.available ? colors.tertiaryLabel : colors.separator}
                  />
                </TouchableOpacity>
              ))}
            </View>

            {/* Share */}
            <View style={styles.section}>
              <Text style={styles.sectionHeader}>Compartilhar</Text>
              {shareOptions.map((s) => (
                <View key={s.id} style={styles.shareCard}>
                  <View style={[styles.shareIcon, { backgroundColor: s.color }]}>
                    <Icon name={s.icon as any} size={24} color={colors.onTint} />
                  </View>
                  <View style={styles.shareInfo}>
                    <Text style={styles.shareTitle}>{s.title}</Text>
                    <Text style={styles.shareDesc}>{s.description}</Text>
                  </View>
                </View>
              ))}
            </View>
          </>
        ) : (
          <View style={styles.emptyState}>
            <Icon name="bar-chart-outline" size={48} color={colors.tertiaryLabel} />
            <Text style={styles.emptyTitle}>Nenhum dado para relatórios</Text>
            <Text style={styles.emptyDesc}>
              Registre medições para gerar relatórios e acompanhar sua evolução
            </Text>
            <TouchableOpacity
              style={[styles.ctaBtn, { backgroundColor: colors.systemBlue }]}
              onPress={() => router.push("/new-reading")}
            >
              <Icon name="add" size={20} color={colors.onTint} />
              <Text style={styles.ctaText}>Registrar Primeira Medição</Text>
            </TouchableOpacity>
          </View>
        )}
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
    fontSize: 28,
    fontWeight: "700" as const,
    color: colors.label,
    marginBottom: spacing.xs,
  },
  subtitle: {
    fontSize: 15,
    color: colors.secondaryLabel,
    marginBottom: spacing.xxl,
  },
  summaryCard: {
    backgroundColor: colors.systemBackground,
    borderRadius: radius.lg,
    padding: spacing.lg,
    marginBottom: spacing.xxl,
    ...shadowCard,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-around",
  },
  summaryStat: {
    alignItems: "center",
  },
  summaryValue: {
    fontSize: 28,
    fontWeight: "700" as const,
    color: colors.systemBlue,
  },
  summaryLabel: {
    fontSize: 13,
    color: colors.secondaryLabel,
    marginTop: 2,
  },
  section: {
    marginBottom: spacing.xxl,
  },
  sectionHeader: {
    fontSize: 17,
    fontWeight: "600" as const,
    color: colors.label,
    marginBottom: spacing.md,
  },
  reportCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.systemBackground,
    borderRadius: radius.md,
    padding: spacing.lg,
    marginBottom: spacing.sm,
    gap: spacing.md,
    ...shadowCard,
  },
  reportCardDisabled: {
    opacity: 0.4,
  },
  reportIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
  },
  reportInfo: {
    flex: 1,
  },
  reportTitle: {
    fontSize: 15,
    fontWeight: "600" as const,
    color: colors.label,
    marginBottom: 2,
  },
  reportDesc: {
    fontSize: 13,
    color: colors.secondaryLabel,
  },
  reportLocked: {
    fontSize: 12,
    color: colors.tertiaryLabel,
    marginTop: 4,
    fontStyle: "italic" as const,
  },
  shareCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.systemBackground,
    borderRadius: radius.md,
    padding: spacing.lg,
    marginBottom: spacing.sm,
    gap: spacing.md,
    ...shadowCard,
  },
  shareIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
  },
  shareInfo: {
    flex: 1,
  },
  shareTitle: {
    fontSize: 15,
    fontWeight: "600" as const,
    color: colors.label,
    marginBottom: 2,
  },
  shareDesc: {
    fontSize: 13,
    color: colors.secondaryLabel,
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: spacing.xxl,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "600" as const,
    color: colors.label,
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },
  emptyDesc: {
    fontSize: 15,
    color: colors.secondaryLabel,
    textAlign: "center",
    marginBottom: spacing.xxl,
    paddingHorizontal: spacing.xxl,
  },
  ctaBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    borderRadius: radius.lg,
  },
  ctaText: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: colors.onTint,
  },
});

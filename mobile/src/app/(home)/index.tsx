import React, { useState, useEffect, useCallback, useMemo, useRef } from "react";
import {
  StyleSheet,
  View,
  TouchableOpacity,
  ScrollView,
  RefreshControl,
  Text,
} from "react-native";
import { useRouter } from "expo-router";
import { Icon } from "@/components/ui/Icon";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";

import useAppStore from "@/store/useAppStore";
import { fullSync } from "@/services/sync";
import { checkHealth } from "@/services/api";
import { classifyPressure } from "@/lib/bpClassification";
import { FeatureCard } from "@/components/ui/feature-card";
import { useAppColors, spacing, radius, shadows } from "@/theme";
import { useFontScale, scaleFont } from "@/theme/fontScale";
import PressureChart from "@/components/PressureChart";
import { EmptyStateView } from "@/components/ui/empty-state-view";

export default function HomeScreen() {
  const colors = useAppColors();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const fontScale = useFontScale();
  const { readings, fetchReadings } = useAppStore();

  const [connected, setConnected] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const loadedRef = useRef(false);
  const [triggerLoad, setTriggerLoad] = useState(0);

  const s = useMemo(() => {
    const fs = (base: number) => scaleFont(base, fontScale);
    return StyleSheet.create({
      headerTitle: { fontSize: fs(20), fontWeight: "700" as const, color: colors.onTint },
      statusText: { fontSize: fs(13), color: `${colors.onTint}CC` },
      headerBtnText: { fontSize: fs(13), fontWeight: "600" as const, color: colors.onTint },
      sectionHeader: { fontSize: fs(17), fontWeight: "600" as const, color: colors.label, marginBottom: spacing.md },
      lastPressureValue: { fontSize: fs(52), fontWeight: "700" as const, letterSpacing: 1 },
      unit: { fontSize: fs(14), color: colors.tertiaryLabel, marginTop: 2 },
      infoText: { fontSize: fs(14), color: colors.secondaryLabel },
      timestamp: { fontSize: fs(13), color: colors.tertiaryLabel, marginTop: spacing.sm },
      stubTitle: { fontSize: fs(14), fontWeight: "600" as const, color: colors.label },
      stubEmoji: { fontSize: fs(36), marginVertical: spacing.sm },
      stubDesc: { fontSize: fs(12), color: colors.tertiaryLabel },
    });
  }, [fontScale, colors.onTint, colors.label, colors.tertiaryLabel, colors.secondaryLabel]);

  const checkConnection = async () => {
    const isOnline = await checkHealth();
    setConnected(isOnline);
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      checkConnection();
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (readings.length > 0 && !loadedRef.current) {
      loadedRef.current = true;
      setInitialLoading(false);
      setTriggerLoad((prev) => prev + 1);
    } else if (readings.length === 0 && !loadedRef.current) {
      const timer = setTimeout(() => {
        setInitialLoading(false);
      }, 800);
      return () => clearTimeout(timer);
    }
  }, [readings]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await fullSync();
    } catch {}
    await Promise.all([fetchReadings(), checkConnection()]);
    setRefreshing(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const last = readings[0];

  const formatDateFull = (d: string) => {
    try {
      return format(new Date(d), "dd 'de' MMMM 'às' HH:mm", {
        locale: ptBR,
      });
    } catch {
      return "";
    }
  };

  const styles = createStyles(colors);

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 16 }]}
        contentInsetAdjustmentBehavior="automatic"
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.systemBlue}
          />
        }
      >
        {!initialLoading && (
          <>
            {/* Header */}
            <View style={styles.header}>
              <View style={styles.headerTop}>
                <View>
                  <Text style={s.headerTitle}>Pressão Arterial</Text>
                  <View style={styles.statusRow}>
                    <View
                      style={[
                        styles.statusDot,
                        { backgroundColor: connected ? colors.systemGreen : colors.systemRed },
                      ]}
                    />
                    <Text style={s.statusText}>
                      {connected ? "Conectado" : "Offline"}
                    </Text>
                  </View>
                </View>
                <View style={styles.headerActions}>
                  <TouchableOpacity
                    style={styles.headerBtn}
                    onPress={() => router.push("/history")}
                    accessibilityRole="button"
                    accessibilityLabel="Ver histórico de medições"
                  >
                    <Icon name="time" size={18} color={colors.onTint} />
                    <Text style={s.headerBtnText}>Histórico</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.headerBtn, styles.newBtn]}
                    onPress={() => router.push("/new-reading")}
                    accessibilityRole="button"
                    accessibilityLabel="Registrar nova medição"
                  >
                    <Icon name="add" size={18} color={colors.onTint} />
                    <Text style={s.headerBtnText}>Nova Medição</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>

            {/* Quick Actions */}
            <View style={styles.quickActions}>
              <FeatureCard
                icon="trophy"
                title="Conquistas"
                subtitle="Em breve"
                color="#ffc107"
                onPress={() => router.push("/conquistas")}
              />
              <FeatureCard
                icon="flag"
                title="Desafios"
                subtitle="Em breve"
                color={colors.systemGreen}
                onPress={() => router.push("/desafios")}
              />
              <FeatureCard
                icon="people"
                title="Amigos"
                subtitle="Em breve"
                color={colors.systemBlue}
                onPress={() => router.push("/amigos")}
              />
              <FeatureCard
                icon="document-text"
                title="Relatórios"
                subtitle="Em breve"
                color={colors.systemPurple}
                onPress={() => router.push("/relatorios")}
              />
            </View>

            {/* Last Reading */}
            {last && (
              <View style={styles.lastReadingSection}>
                <Text style={s.sectionHeader}>Última medição</Text>
                <View style={styles.lastCard}>
                  <View style={styles.lastPressure}>
                    <Text
                      style={[
                        s.lastPressureValue,
                        {
                          color: (() => {
                            const cat = classifyPressure(last.systolic, last.diastolic);
                            if (cat.key === "normal") return colors.pressureNormal;
                            if (cat.key === "elevated") return colors.pressureElevated;
                            return colors.pressureHigh;
                          })(),
                        },
                      ]}
                    >
                      {last.systolic}/{last.diastolic}
                    </Text>
                    <Text style={s.unit}>mmHg</Text>
                  </View>
                  <View style={styles.lastInfo}>
                    {last.heart_rate && (
                      <View style={styles.infoRow}>
                        <Icon name="heart" size={18} color={colors.systemPink} />
                        <Text style={s.infoText}>{last.heart_rate} bpm</Text>
                      </View>
                    )}
                    {last.medication_name && (
                      <View style={styles.infoRow}>
                        <Icon name="medkit" size={18} color={colors.systemBlue} />
                        <Text style={s.infoText}>{last.medication_name}</Text>
                      </View>
                    )}
                    <Text style={s.timestamp}>{formatDateFull(last.created_at)}</Text>
                  </View>
                </View>
              </View>
            )}

            {/* Chart */}
            {readings.length > 0 && <PressureChart readings={readings} />}

            {/* Empty State */}
            {readings.length === 0 && !initialLoading && (
              <View style={styles.emptyState}>
                <EmptyStateView
                  onPrimaryAction={() => router.push("/new-reading")}
                  primaryActionLabel="Registrar primeira medição"
                  emptyType="no-readings"
                />
              </View>
            )}

            {/* Stubs */}
            {readings.length > 0 && (
              <View style={styles.stubsSection}>
                <View style={styles.stubCard}>
                  <View style={styles.stubHeader}>
                    <Icon name="flash" size={22} color={colors.systemOrange} />
                    <Text style={s.stubTitle}>Sequência Ativa</Text>
                  </View>
                  <Text style={styles.stubEmoji}>🔥</Text>
                  <Text style={styles.stubDesc}>
                    Mantenha sua sequência!
                  </Text>
                </View>
                <View style={styles.stubCard}>
                  <View style={styles.stubHeader}>
                    <Icon name="people" size={22} color={colors.systemGreen} />
                    <Text style={s.stubTitle}>Rede de Apoio</Text>
                  </View>
                  <Text style={styles.stubEmoji}>👥</Text>
                  <Text style={styles.stubDesc}>
                    Convide amigos e familiares
                  </Text>
                </View>
              </View>
            )}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const createStyles = (colors: ReturnType<typeof import("@/theme").useAppColors>) => ({
  container: {
    flex: 1,
    backgroundColor: colors.secondarySystemBackground,
  },
  scrollView: {
    flex: 1,
  },
  content: {},
  header: {
    backgroundColor: colors.systemBlue,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
  },
  headerTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  headerTitle: {
    fontWeight: "700" as const,
    color: colors.onTint,
  },
  statusRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    marginTop: spacing.xs,
  },
  statusDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  statusText: {
    color: `${colors.onTint}CC`,
  },
  headerActions: {
    flexDirection: "row",
    gap: spacing.sm,
  },
  headerBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "rgba(255,255,255,0.15)",
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.full,
    minHeight: 44,
  },
  headerBtnText: {
    fontWeight: "600" as const,
    color: colors.onTint,
  },
  newBtn: {
    backgroundColor: colors.systemGreen,
  },
  emptyState: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
  },
  quickActions: {
    flexDirection: "row",
    flexWrap: "wrap",
    padding: spacing.lg,
    gap: spacing.md,
  },
  lastReadingSection: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
  },
  sectionHeader: {
    fontWeight: "600" as const,
    color: colors.label,
    marginBottom: spacing.md,
  },
  lastCard: {
    backgroundColor: colors.systemBackground,
    borderRadius: radius.lg,
    padding: spacing.lg,
    ...shadows.card,
  },
  lastPressure: {
    alignItems: "center",
    paddingVertical: spacing.md,
  },
  lastPressureValue: {
    fontWeight: "700" as const,
    letterSpacing: 1,
  },
  unit: {
    color: colors.tertiaryLabel,
    marginTop: 2,
  },
  lastInfo: {
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  infoText: {
    color: colors.secondaryLabel,
  },
  timestamp: {
    color: colors.tertiaryLabel,
    marginTop: spacing.sm,
  },
  stubsSection: {
    flexDirection: "row",
    padding: spacing.lg,
    gap: spacing.md,
  },
  stubCard: {
    flex: 1,
    backgroundColor: colors.systemBackground,
    borderRadius: radius.lg,
    padding: spacing.lg,
    alignItems: "center",
    ...shadows.card,
  },
  stubHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  stubTitle: {
    fontWeight: "600" as const,
    color: colors.label,
  },
  stubEmoji: {
    marginVertical: spacing.sm,
  },
  stubDesc: {
    color: colors.tertiaryLabel,
  },
});

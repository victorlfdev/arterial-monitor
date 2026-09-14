import React, { useState, useEffect, useMemo, useCallback, useRef } from "react";
import {
  StyleSheet,
  View,
  TouchableOpacity,
  ScrollView,
  RefreshControl,
  Text,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { Icon } from "@/components/ui/Icon";
import { format, subDays } from "date-fns";
import { ptBR } from "date-fns/locale";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import useAppStore from "@/store/useAppStore";
import { fullSync } from "@/services/sync";
import { classifyPressure } from "@/lib/bpClassification";
import { GradientButton } from "@/components/ui/gradient-button";
import { ProgressDay } from "@/components/ui/progress-day";
import { WeekChallenge } from "@/components/ui/week-challenge";
import { FamilyMemberRow } from "@/components/ui/family-member-row";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EmptyStateView } from "@/components/ui/empty-state-view";
import { useAppColors, spacing, radius, shadows } from "@/theme";
import { useFontScale, scaleFont } from "@/theme/fontScale";

type FamilyMember = {
  id: number;
  name: string;
  relation: string;
  lastReading: string;
  statusColor: "green" | "orange" | "red";
  avatarColor: string;
};

export default function HomeScreen() {
  const colors = useAppColors();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const fontScale = useFontScale();
  const { readings, fetchReadings } = useAppStore();

  const [refreshing, setRefreshing] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const loadedRef = useRef(false);

  const familyMembers: FamilyMember[] = useMemo(
    () => [
      { id: 1, name: "Francisco (Pai)", relation: "Pai", lastReading: "138/85 mmHg", statusColor: "orange", avatarColor: colors.teal },
      { id: 2, name: "Nanci (Mãe)", relation: "Mãe", lastReading: "115/75 mmHg", statusColor: "green", avatarColor: colors.amarelo },
      { id: 3, name: "Jonatha (Irmão)", relation: "Irmão", lastReading: "125/82 mmHg", statusColor: "red", avatarColor: colors.coral },
    ],
    [colors.teal, colors.amarelo, colors.coral]
  );

  const s = useMemo(() => {
    const fs = (base: number) => scaleFont(base, fontScale);
    return StyleSheet.create({
      greeting: { fontSize: fs(28), fontWeight: "700" as const, color: colors.label },
      dateText: { fontSize: fs(15), color: colors.secondaryLabel, marginTop: 2 },
      lastPressureValue: { fontSize: fs(52), fontWeight: "700" as const, letterSpacing: 1 },
      unit: { fontSize: fs(14), color: colors.tertiaryLabel, marginTop: 2 },
      timestamp: { fontSize: fs(13), color: colors.tertiaryLabel },
      sectionTitle: { fontSize: fs(17), fontWeight: "700" as const, color: colors.label },
      sectionSubtitle: { fontSize: fs(14), color: colors.secondaryLabel },
      familyTitle: { fontSize: fs(17), fontWeight: "700" as const, color: colors.label },
      seeAllText: { fontSize: fs(15), fontWeight: "600" as const, color: colors.teal },
      emptyText: { fontSize: fs(13), color: colors.secondaryLabel },
      streakBadgeText: { fontSize: fs(13), fontWeight: "600" as const, color: colors.amarelo },
      chartTitle: { fontSize: fs(17), fontWeight: "700" as const, color: colors.label, marginBottom: spacing.md },
    });
  }, [fontScale, colors]);

  useEffect(() => {
    if (readings.length > 0 && !loadedRef.current) {
      loadedRef.current = true;
      setInitialLoading(false);
    } else if (readings.length === 0 && !loadedRef.current) {
      const timer = setTimeout(() => {
        setInitialLoading(false);
      }, 800);
      return () => clearTimeout(timer);
    }
  }, [readings]);

  useEffect(() => {
    fetchReadings();
  }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await fullSync();
    } catch {}
    await fetchReadings();
    setRefreshing(false);
  }, [fetchReadings]);

  const last = readings[0];

  const getTimeAgo = (d: string) => {
    try {
      const now = new Date();
      const date = new Date(d);
      const diffMs = now.getTime() - date.getTime();
      const diffHrs = Math.floor(diffMs / (1000 * 60 * 60));
      if (diffHrs < 1) return "agora";
      if (diffHrs === 1) return "há 1h";
      if (diffHrs < 24) return `há ${diffHrs}h`;
      const diffDays = Math.floor(diffHrs / 24);
      if (diffDays === 1) return "há 1 dia";
      return `há ${diffDays} dias`;
    } catch {
      return "";
    }
  };

  const streakDays = useMemo(() => {
    const days = new Map<string, boolean>();
    for (let i = 0; i < 30; i++) {
      const d = subDays(new Date(), i);
      const key = format(d, "yyyy-MM-dd");
      days.set(key, false);
    }
    for (const r of readings) {
      const key = format(new Date(r.created_at), "yyyy-MM-dd");
      if (days.has(key)) {
        days.set(key, true);
      }
    }
    let streak = 0;
    for (const [, has] of days) {
      if (has) {
        streak++;
      } else {
        break;
      }
    }
    return streak;
  }, [readings]);

  const progressDays = useMemo(() => {
    const days: { day: string; date: string; has: boolean }[] = [];
    for (let i = 4; i >= 0; i--) {
      const d = subDays(new Date(), i);
      const key = format(d, "yyyy-MM-dd");
      const hasMeasurement = readings.some(
        (r) => format(new Date(r.created_at), "yyyy-MM-dd") === key
      );
      days.push({
        day: format(d, "dd"),
        date: format(d, "MMM", { locale: ptBR }).replace(".", ""),
        has: hasMeasurement,
      });
    }
    return days;
  }, [readings]);
  const completedChallenges = useMemo(() => Math.min(streakDays, 7), [streakDays]);

  const styles = createStyles(colors);

  if (initialLoading) {
    return (
      <SafeAreaView style={styles.container} edges={["top"]}>
        <View style={styles.loadingContainer}>
          <View style={styles.skeletonHeader} />
          <View style={styles.skeletonCard} />
          <View style={styles.skeletonButton} />
          <View style={styles.skeletonCard} />
        </View>
      </SafeAreaView>
    );
  }

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
            tintColor={colors.coral}
          />
        }
      >
        {!initialLoading && (
          <>
            {/* Header */}
            <View style={styles.header}>
              <View style={styles.headerContent}>
                <View>
                  <Text style={s.greeting}>Olá, Victor! 👋</Text>
                  <Text style={s.dateText}>
                    {format(new Date(), "EEE, dd MMM", { locale: ptBR }).toLowerCase()}
                  </Text>
                </View>
                <TouchableOpacity
                  style={styles.heartBtn}
                  onPress={() => {}}
                  accessibilityRole="button"
                  accessibilityLabel="Favoritos"
                >
                  <Icon name="heart-outline" size={22} color={colors.pressureNormal} />
                </TouchableOpacity>
              </View>
            </View>
            <LinearGradient
              colors={[colors.coral, colors.teal]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.gradientLine}
            />

            {/* Last Measurement */}
            {last && (
              <View style={styles.section}>
                <Card style={styles.lastCard}>
                  <View style={styles.lastCardHeader}>
                    <Text style={styles.lastCardLabel}>ÚLTIMA MEDIÇÃO</Text>
                    <Text style={styles.lastCardTime}>{getTimeAgo(last.created_at)}</Text>
                  </View>
                  <View style={styles.lastPressureRow}>
                    <View style={styles.bpContainer}>
                      <Text
                        style={[
                          s.lastPressureValue,
                          {
                            color: colors.label,
                          },
                        ]}
                      >
                        {last.systolic}/{last.diastolic}
                      </Text>
                      <Text style={s.unit}>mmHg</Text>
                    </View>
                    <View style={{ alignItems: "center" }}>
                      <Badge
                        label={classifyPressure(last.systolic, last.diastolic).label}
                        color={
                          classifyPressure(last.systolic, last.diastolic).key === "normal"
                            ? "normal"
                            : classifyPressure(last.systolic, last.diastolic).key === "elevated"
                            ? "elevated"
                            : "high"
                        }
                        size="md"
                      />
                    </View>
                  </View>
                  {(last.heart_rate || last.medication_name) && (
                    <View style={styles.lastInfo}>
                      {last.heart_rate && (
                        <View style={styles.infoRow}>
                          <Icon name="heart" size={16} color={colors.pressureHigh} />
                          <Text style={s.emptyText}>{last.heart_rate} bpm</Text>
                        </View>
                      )}
                      {last.medication_name && (
                        <View style={styles.infoRow}>
                          <Icon name="medkit" size={16} color={colors.teal} />
                          <Text style={s.emptyText}>{last.medication_name}</Text>
                        </View>
                      )}
                    </View>
                  )}
                </Card>
              </View>
            )}

            {/* Nova Medição Button */}
            <View style={[styles.section, { paddingVertical: spacing.sm }]}>
              <GradientButton
                title="+ Nova Medição"
                onPress={() => router.push("/new-reading")}
                style={styles.newReadingButton}
              />
            </View>

              <View style={styles.section}>
                <View style={styles.progressSection}>
                  <View style={styles.progressHeader}>
                    <Text style={s.sectionTitle}>Seu progresso</Text>
                    {streakDays >= 7 && (
                      <View
                        style={{
                          backgroundColor: `${colors.amarelo}20`,
                          borderRadius: radius.md,
                          paddingHorizontal: spacing.sm,
                          paddingVertical: spacing.xs,
                        }}
                      >
                        <Text style={{ ...s.streakBadgeText, color: colors.amarelo }}>{streakDays} dias seguidos! 🔥</Text>
                      </View>
                    )}
                  </View>
                  <View style={styles.progressDaysRow}>
                    {progressDays.map((day, idx) => (
                      <ProgressDay
                        key={idx}
                        day={day.day}
                        date={day.date}
                        hasMeasurement={day.has}
                        isActive={idx === progressDays.length - 1}
                      />
                    ))}
                  </View>
                </View>
              </View>

            {/* Week Challenge */}
            {readings.length > 0 && (
              <View style={styles.section}>
                <WeekChallenge
                  completedCount={completedChallenges}
                  totalCount={7}
                  streakDays={streakDays}
                />
              </View>
            )}

            {/* Empty State */}
            {readings.length === 0 && (
              <View style={styles.section}>
                <EmptyStateView
                  onPrimaryAction={() => router.push("/new-reading")}
                  primaryActionLabel="Registrar primeira medição"
                  emptyType="no-readings"
                />
              </View>
            )}

              <View style={[styles.section, { paddingTop: spacing.sm }]}>
                <Card>
                  <View style={styles.familyHeader}>
                    <Text style={s.familyTitle}>Família</Text>
                    <TouchableOpacity onPress={() => router.push("/amigos")}>
                      <Text style={s.seeAllText}>Ver todos</Text>
                    </TouchableOpacity>
                  </View>
                  {familyMembers.map((member) => (
                    <FamilyMemberRow
                      key={member.id}
                      name={member.name}
                      relation={member.relation}
                      lastReading={member.lastReading}
                      statusColor={member.statusColor}
                      avatarColor={member.avatarColor}
                      onPress={() => {}}
                    />
                  ))}
                </Card>
              </View>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const createStyles = (colors: ReturnType<typeof useAppColors>) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: "#F8F9FA",
    },
    loadingContainer: {
      padding: spacing.lg,
      gap: spacing.lg,
    },
    skeletonHeader: {
      height: 40,
      backgroundColor: colors.separator,
      borderRadius: radius.md,
      marginBottom: spacing.md,
    },
    skeletonCard: {
      height: 120,
      backgroundColor: colors.tertiarySystemBackground,
      borderRadius: radius.lg,
      marginBottom: spacing.md,
    },
    skeletonButton: {
      height: 52,
      backgroundColor: colors.separator,
      borderRadius: radius.full,
      marginBottom: spacing.md,
    },
    scrollView: {
      flex: 1,
    },
    content: {
      flexGrow: 1,
    },
    header: {
      paddingHorizontal: spacing.lg,
      paddingTop: spacing.md,
      paddingBottom: spacing.sm,
    },
    headerContent: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "flex-start",
      marginBottom: spacing.sm,
    },
    gradientLine: {
      height: 4,
      borderRadius: 2,
    },
    heartBtn: {
      width: 44,
      height: 44,
      borderRadius: 22,
      backgroundColor: `${colors.pressureNormal}15`,
      justifyContent: "center",
      alignItems: "center",
    },
    section: {
      paddingHorizontal: spacing.lg,
    },
    lastCard: {
      padding: spacing.lg,
    },
    lastCardHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: spacing.md,
    },
    lastCardLabel: {
      fontSize: 13,
      fontWeight: "600" as const,
      color: colors.secondaryLabel,
    },
    lastCardTime: {
      fontSize: 13,
      color: colors.tertiaryLabel,
    },
    lastPressureRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "flex-start",
      paddingVertical: spacing.md,
    },
    bpContainer: {
      flexDirection: "row",
      alignItems: "baseline",
      gap: spacing.sm,
    },
    lastInfo: {
      flexDirection: "row",
      gap: spacing.md,
      marginTop: spacing.sm,
    },
    infoRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: spacing.xs,
    },
    newReadingButton: {
      minHeight: 52,
    },
    progressSection: {
      backgroundColor: colors.systemBackground,
      borderRadius: radius.lg,
      padding: spacing.lg,
      ...shadows.card,
    },
    progressHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: spacing.lg,
    },
    progressDaysRow: {
      flexDirection: "row",
      justifyContent: "space-between",
    },
    familyHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: spacing.sm,
      paddingTop: spacing.xs,
      paddingHorizontal: spacing.xs,
    },
  });

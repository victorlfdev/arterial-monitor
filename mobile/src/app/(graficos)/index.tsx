import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  StyleSheet,
  View,
  ScrollView,
  Text,
  Alert,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";

import useAppStore from "@/store/useAppStore";
import { deleteLocalReading } from "@/services/localDB";
import { getReadingsStats } from "@/services/api";
import { ReadingCard } from "@/components/ui/reading-card";
import { StatsPanel } from "@/components/ui/stats-panel";
import { Chip } from "@/components/ui/chip";
import { useAppColors, spacing } from "@/theme";
import { useFontScale, scaleFont } from "@/theme/fontScale";

export default function HistoryScreen() {
  const colors = useAppColors();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const fontScale = useFontScale();
  const { readings, deleteReading, fetchReadings } = useAppStore();

  const s = useMemo(() => {
    const fs = (base: number) => scaleFont(base, fontScale);
    return StyleSheet.create({
      sectionHeader: { fontSize: fs(17), fontWeight: "600" as const, color: colors.label, marginBottom: spacing.md },
      emptyText: { fontSize: fs(15), color: colors.tertiaryLabel, textAlign: "center", paddingVertical: spacing.xxl },
    });
  }, [fontScale, colors]);

  const styles = useMemo(() => createStyles(colors), [colors]);

  const [filter, setFilter] = useState("all");
  const [medicationFilter, setMedicationFilter] = useState("all");
  const [armFilter, setArmFilter] = useState("all");
  const [sortBy, setSortBy] = useState("date_desc");
  const [stats, setStats] = useState(null);
  const [showStats, setShowStats] = useState(false);

  const uniqueMeds = [
    ...new Set(readings.map((r) => r.medication_name).filter(Boolean)),
  ];
  const uniqueArms = [
    ...new Set(readings.map((r) => r.arm).filter(Boolean)),
  ];

  useEffect(() => {
    fetchReadings();
  }, []);

  useEffect(() => {
    const load = async () => {
      try {
        const result = await getReadingsStats();
        if (result.success) setStats(result.data);
      } catch {}
    };
    load();
  }, []);

  const filtered = readings
    .filter((r) => {
      if (filter === "medicated") return r.medication_used === 1;
      if (filter === "high") return r.systolic >= 140 || r.diastolic >= 90;
      if (filter === "normal") return r.systolic < 120 && r.diastolic < 80;
      return true;
    })
    .filter((r) => medicationFilter === "all" || r.medication_name === medicationFilter)
    .filter((r) => armFilter === "all" || r.arm === armFilter)
    .sort((a, b) => {
      if (sortBy === "date_desc")
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      if (sortBy === "date_asc")
        return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
      if (sortBy === "sys_desc") return b.systolic - a.systolic;
      if (sortBy === "sys_asc") return a.systolic - b.systolic;
      if (sortBy === "dia_desc") return b.diastolic - a.diastolic;
      if (sortBy === "dia_asc") return a.diastolic - b.diastolic;
      return 0;
    });

  const formatDateShort = (d: string) => {
    try {
      return formatDistanceToNow(new Date(d), { locale: ptBR, addSuffix: true });
    } catch {
      return "";
    }
  };

  const handleDelete = useCallback(
    (id: number, serverId?: number) => {
      Alert.alert(
        "Excluir Medição",
        "Tem certeza que deseja excluir esta medição?",
        [
          { text: "Cancelar" },
          {
            text: "Excluir",
            style: "destructive",
            onPress: async () => {
              deleteReading(id);
              try {
                await deleteLocalReading(id);
              } catch {
                console.error("Error deleting reading:", error);
              }
              if (serverId) {
                import("@/services/api").then(({ deleteReading: del }) => del(serverId));
              }
            },
          },
        ]
      );
    },
    [deleteReading]
  );

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 16 }]}
        contentInsetAdjustmentBehavior="automatic"
      >
        {/* Stats */}
        {stats && (
          <StatsPanel stats={stats} collapsed={!showStats} onToggle={() => setShowStats(!showStats)} />
        )}

        {/* Filters */}
        <View style={styles.filterSection}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterScroll}>
            {[
              { key: "all", label: "Todas" },
              { key: "medicated", label: "Medicada" },
              { key: "high", label: "Alta" },
              { key: "normal", label: "Normal" },
            ].map((f) => (
              <Chip key={f.key} label={f.label} active={filter === f.key} onPress={() => setFilter(f.key)} />
            ))}
          </ScrollView>
        </View>

        {uniqueMeds.length > 0 && (
          <View style={styles.filterSection}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterScroll}>
              <Chip label="Todos remédios" active={medicationFilter === "all"} onPress={() => setMedicationFilter("all")} />
              {uniqueMeds.map((m) => (
                <Chip key={m} label={m} active={medicationFilter === m} onPress={() => setMedicationFilter(m)} />
              ))}
            </ScrollView>
          </View>
        )}

        {uniqueArms.length > 0 && (
          <View style={styles.filterSection}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterScroll}>
              <Chip label="Todos braços" active={armFilter === "all"} onPress={() => setArmFilter("all")} />
              {uniqueArms.map((a) => (
                <Chip
                  key={a}
                  label={a === "left" ? "Esquerdo" : a === "right" ? "Direito" : a}
                  active={armFilter === a}
                  onPress={() => setArmFilter(a)}
                />
              ))}
            </ScrollView>
          </View>
        )}

        <View style={styles.filterSection}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterScroll}>
            {[
              { key: "date_desc", label: "Recentes" },
              { key: "date_asc", label: "Antigas" },
              { key: "sys_desc", label: "Sist ↓" },
              { key: "sys_asc", label: "Sist ↑" },
              { key: "dia_desc", label: "Dia ↓" },
              { key: "dia_asc", label: "Dia ↑" },
            ].map((o) => (
              <Chip key={o.key} label={o.label} active={sortBy === o.key} onPress={() => setSortBy(o.key)} />
            ))}
          </ScrollView>
        </View>

        {/* History List */}
        <View style={styles.historySection}>
          <Text style={s.sectionHeader}>{filtered.length} medições</Text>
          {filtered.length > 0 ? (
            filtered.map((r) => (
              <ReadingCard
                key={r.id}
                systolic={r.systolic}
                diastolic={r.diastolic}
                heartRate={r.heart_rate || undefined}
                timestamp={formatDateShort(r.created_at)}
                medicationName={r.medication_name || undefined}
                symptoms={r.symptoms || undefined}
                arm={r.arm || undefined}
                onPress={() =>
                  router.push({
                    pathname: "/(home)/new-reading",
                    params: { editingId: r.id, ...r },
                  })
                }
                showActions
                onEdit={() =>
                  router.push({
                    pathname: "/(home)/new-reading",
                    params: { editingId: r.id, ...r },
                  })
                }
                onDelete={() => handleDelete(r.id, r.server_id || undefined)}
              />
            ))
          ) : (
            <Text style={s.emptyText}>Nenhuma medição encontrada</Text>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const createStyles = (c: ReturnType<typeof useAppColors>) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: c.secondarySystemBackground,
  },
  scrollView: {
    flex: 1,
  },
  content: {},
  filterSection: {
    padding: spacing.lg,
    paddingTop: spacing.sm,
  },
  filterScroll: {
    paddingRight: spacing.lg,
    gap: spacing.sm,
  },
  historySection: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
  },
  sectionHeader: {
    fontWeight: "600" as const,
    color: c.label,
    marginBottom: spacing.md,
  },
  emptyText: {
    color: c.tertiaryLabel,
    textAlign: "center",
    paddingVertical: spacing.xxl,
  },
});

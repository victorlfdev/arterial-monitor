import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Icon } from "./Icon";
import { useAppColors, spacing, radius } from "@/theme";
import { useFontScale, scaleFont } from "@/theme/fontScale";

interface StatsPanelProps {
  stats: {
    count?: number;
    systolic?: { avg?: number; min?: number; max?: number };
    diastolic?: { avg?: number; min?: number; max?: number };
    heart_rate?: { avg?: number };
  };
  collapsed: boolean;
  onToggle: () => void;
}

export function StatsPanel({ stats, collapsed, onToggle }: StatsPanelProps) {
  const colors = useAppColors();
  const fontScale = useFontScale();
  const fs = (base: number) => scaleFont(base, fontScale);

  return (
    <View style={[styles.container, { backgroundColor: colors.systemBackground }]}>
      <TouchableOpacity
        style={styles.header}
        onPress={onToggle}
        accessibilityRole="button"
        accessibilityLabel={collapsed ? "Expandir estatísticas" : "Recolher estatísticas"}
        accessibilityHint={collapsed ? "Toque para mostrar as estatísticas" : "Toque para esconder as estatísticas"}
      >
        <Icon
          name={collapsed ? "chevron-down-circle" : "chevron-up-circle"}
          size={22}
          color={colors.secondaryLabel}
        />
        <Text style={[styles.title, { fontSize: fs(16), color: colors.label }]}>Estatísticas Gerais</Text>
      </TouchableOpacity>
      {!collapsed && (
        <View style={[styles.content, { borderTopColor: colors.separator }]}>
          <View style={styles.row}>
            <View style={styles.statCell}>
              <Text style={[styles.statValue, { fontSize: fs(22), color: colors.systemBlue }]}>{stats.count ?? "—"}</Text>
              <Text style={[styles.statLabel, { fontSize: fs(11), color: colors.tertiaryLabel }]}>Medições</Text>
            </View>
            <View style={styles.statCell}>
              <Text style={[styles.statValue, { fontSize: fs(22), color: colors.systemBlue }]}>{stats.systolic?.avg ?? "—"}</Text>
              <Text style={[styles.statLabel, { fontSize: fs(11), color: colors.tertiaryLabel }]}>Sistólica Média</Text>
            </View>
            <View style={styles.statCell}>
              <Text style={[styles.statValue, { fontSize: fs(22), color: colors.systemBlue }]}>{stats.diastolic?.avg ?? "—"}</Text>
              <Text style={[styles.statLabel, { fontSize: fs(11), color: colors.tertiaryLabel }]}>Diastólica Média</Text>
            </View>
          </View>
          <View style={styles.row}>
            <View style={styles.statCell}>
              <Text style={[styles.statValueSmall, { fontSize: fs(14), color: colors.label }]}>{stats.systolic?.min ?? "—"} - {stats.systolic?.max ?? "—"}</Text>
              <Text style={[styles.statLabel, { fontSize: fs(11), color: colors.tertiaryLabel }]}>Sistólica</Text>
            </View>
            <View style={styles.statCell}>
              <Text style={[styles.statValueSmall, { fontSize: fs(14), color: colors.label }]}>{stats.diastolic?.min ?? "—"} - {stats.diastolic?.max ?? "—"}</Text>
              <Text style={[styles.statLabel, { fontSize: fs(11), color: colors.tertiaryLabel }]}>Diastólica</Text>
            </View>
            <View style={styles.statCell}>
              <Text style={[styles.statValueSmall, { fontSize: fs(14), color: colors.label }]}>{stats.heart_rate?.avg ?? "—"}</Text>
              <Text style={[styles.statLabel, { fontSize: fs(11), color: colors.tertiaryLabel }]}>FC Média</Text>
            </View>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: spacing.lg,
    marginTop: spacing.lg,
    borderRadius: radius.lg,
    padding: spacing.lg,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  title: {
    fontWeight: "600" as const,
  },
  content: {
    marginTop: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: 1,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: spacing.sm,
  },
  statCell: {
    alignItems: "center",
    flex: 1,
  },
  statValue: {
    fontWeight: "700" as const,
  },
  statValueSmall: {
    fontWeight: "500" as const,
  },
  statLabel: {
    marginTop: 2,
    textAlign: "center",
  },
});

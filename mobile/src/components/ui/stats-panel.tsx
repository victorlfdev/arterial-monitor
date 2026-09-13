import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Icon } from "./Icon";
import { colors, spacing, radius } from "@/theme";
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
  const fontScale = useFontScale();
  const fs = (base: number) => scaleFont(base, fontScale);

  return (
    <View style={styles.container}>
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
        <Text style={[styles.title, { fontSize: fs(16) }]}>Estatísticas Gerais</Text>
      </TouchableOpacity>
      {!collapsed && (
        <View style={styles.content}>
          <View style={styles.row}>
            <View style={styles.statCell}>
              <Text style={[styles.statValue, { fontSize: fs(22) }]}>{stats.count ?? "—"}</Text>
              <Text style={[styles.statLabel, { fontSize: fs(11) }]}>Medições</Text>
            </View>
            <View style={styles.statCell}>
              <Text style={[styles.statValue, { fontSize: fs(22) }]}>{stats.systolic?.avg ?? "—"}</Text>
              <Text style={[styles.statLabel, { fontSize: fs(11) }]}>Sistólica Média</Text>
            </View>
            <View style={styles.statCell}>
              <Text style={[styles.statValue, { fontSize: fs(22) }]}>{stats.diastolic?.avg ?? "—"}</Text>
              <Text style={[styles.statLabel, { fontSize: fs(11) }]}>Diastólica Média</Text>
            </View>
          </View>
          <View style={styles.row}>
            <View style={styles.statCell}>
              <Text style={[styles.statValueSmall, { fontSize: fs(14) }]}>
                {stats.systolic?.min ?? "—"} - {stats.systolic?.max ?? "—"}
              </Text>
              <Text style={[styles.statLabel, { fontSize: fs(11) }]}>Sistólica</Text>
            </View>
            <View style={styles.statCell}>
              <Text style={[styles.statValueSmall, { fontSize: fs(14) }]}>
                {stats.diastolic?.min ?? "—"} - {stats.diastolic?.max ?? "—"}
              </Text>
              <Text style={[styles.statLabel, { fontSize: fs(11) }]}>Diastólica</Text>
            </View>
            <View style={styles.statCell}>
              <Text style={[styles.statValueSmall, { fontSize: fs(14) }]}>{stats.heart_rate?.avg ?? "—"}</Text>
              <Text style={[styles.statLabel, { fontSize: fs(11) }]}>FC Média</Text>
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
    backgroundColor: colors.systemBackground,
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
    color: colors.label,
  },
  content: {
    marginTop: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.separator,
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
    color: colors.systemBlue,
  },
  statValueSmall: {
    fontWeight: "500" as const,
    color: colors.label,
  },
  statLabel: {
    color: colors.tertiaryLabel,
    marginTop: 2,
    textAlign: "center",
  },
});

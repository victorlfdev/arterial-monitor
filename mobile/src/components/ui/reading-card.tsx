import React from "react";
import { View, Text, TouchableOpacity, ViewProps, StyleSheet } from "react-native";
import { Icon } from "./Icon";
import { colors, spacing, radius, shadows } from "@/theme";
import { Badge } from "./badge";
import { useFontScale, scaleFont } from "@/theme/fontScale";
import { classifyPressure } from "@/lib/bpClassification";

interface ReadingCardProps extends ViewProps {
  systolic: number;
  diastolic: number;
  heartRate?: number;
  timestamp?: string;
  medicationName?: string;
  symptoms?: string;
  arm?: string;
  onPress?: () => void;
  showActions?: boolean;
  onEdit?: () => void;
  onDelete?: () => void;
}

export function ReadingCard({
  systolic,
  diastolic,
  heartRate,
  timestamp,
  medicationName,
  symptoms,
  arm,
  onPress,
  showActions,
  onEdit,
  onDelete,
  style,
}: ReadingCardProps) {
  const fontScale = useFontScale();
  const cat = classifyPressure(systolic, diastolic);
  const pressureColor =
    cat.color === "green"
      ? colors.pressureNormal
      : cat.color === "orange"
        ? colors.pressureElevated
        : colors.pressureHigh;

  const fs = (base: number) => scaleFont(base, fontScale);

  const content = (
    <>
      <View style={styles.headerRow}>
        <View style={styles.pressureDisplay}>
          <Text style={[styles.pressureValue, { color: pressureColor }]}>
            {systolic}/{diastolic}
          </Text>
          <Text style={[styles.unit, { fontSize: fs(13) }]}>mmHg</Text>
        </View>
        <Badge label={cat.label} color={cat.color} />
      </View>

      <View style={styles.meta}>
        {heartRate ? (
          <View style={styles.metaItem}>
            <Icon name="heart" size={16} color={colors.systemPink} />
            <Text style={[styles.metaText, { fontSize: fs(13) }]}>{heartRate} bpm</Text>
          </View>
        ) : null}
        {arm && (
          <View style={styles.metaItem}>
            <Icon name="hand" size={16} color={colors.systemPurple} />
            <Text style={[styles.metaText, { fontSize: fs(13) }]}>{arm === "left" ? "Braço esquerdo" : "Braço direito"}</Text>
          </View>
        )}
        {timestamp && <Text style={[styles.timestamp, { fontSize: fs(13) }]}>{timestamp}</Text>}
      </View>

      {medicationName && (
        <View style={styles.tag}>
            <Icon name="medkit" size={14} color={colors.systemBlue} />
          <Text style={[styles.tagText, { fontSize: fs(13) }]}>{medicationName}</Text>
        </View>
      )}
      {symptoms && (
        <View style={styles.tagSymptom}>
            <Icon name="alert-circle-outline" size={14} color={colors.systemOrange} />
          <Text style={[styles.tagTextSymptom, { fontSize: fs(13) }]}>{symptoms}</Text>
        </View>
      )}
    </>
  );

  if (showActions) {
    return (
      <View style={[styles.card, style]}>
        {onPress ? (
          <TouchableOpacity onPress={onPress} style={{ flex: 1 }} accessibilityRole="button" accessibilityLabel={`Leitura de pressão ${systolic}/${diastolic} mmHg`}>{content}</TouchableOpacity>
        ) : (
          <View accessibilityRole="text" accessibilityLabel={`Leitura de pressão ${systolic}/${diastolic} mmHg - ${cat.label}`}>{content}</View>
        )}
        <View style={styles.actions}>
          {onEdit && (
            <TouchableOpacity onPress={onEdit} style={styles.actionIcon} accessibilityRole="button" accessibilityLabel="Editar leitura">
              <Icon name="create-outline" size={20} color={colors.systemBlue} />
            </TouchableOpacity>
          )}
          {onDelete && (
            <TouchableOpacity onPress={onDelete} style={styles.actionIcon} accessibilityRole="button" accessibilityLabel="Excluir leitura">
              <Icon name="trash-outline" size={20} color={colors.systemRed} />
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  }

  return <View style={[styles.card, style]}>{content}</View>;
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.systemBackground,
    borderRadius: radius.lg,
    padding: spacing.lg,
    marginBottom: spacing.sm,
    ...shadows.card,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.md,
  },
  pressureDisplay: {
    alignItems: "center",
  },
  pressureValue: {
    fontWeight: "700" as const,
    letterSpacing: 1,
  },
  unit: {
    color: colors.tertiaryLabel,
    marginTop: 2,
  },
  meta: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.md,
    marginBottom: spacing.sm,
  },
  metaItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
  },
  metaText: {
    color: colors.secondaryLabel,
  },
  timestamp: {
    color: colors.tertiaryLabel,
  },
  tag: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    backgroundColor: `${colors.systemBlue}${10}` as string,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radius.sm,
    marginTop: spacing.sm,
  },
  tagText: {
    color: colors.systemBlue,
    fontWeight: "500" as const,
  },
  tagSymptom: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    backgroundColor: `${colors.systemOrange}${10}` as string,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radius.sm,
    marginTop: spacing.xs,
  },
  tagTextSymptom: {
    color: colors.systemOrange,
    fontWeight: "500" as const,
  },
  actions: {
    flexDirection: "row",
    gap: spacing.md,
    marginTop: spacing.sm,
  },
  actionIcon: {
    width: 44,
    height: 44,
    justifyContent: "center",
    alignItems: "center",
  },
});

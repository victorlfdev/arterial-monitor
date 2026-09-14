import React, { useState, useMemo } from "react";
import {
  StyleSheet,
  View,
  ScrollView,
  Text,
  TouchableOpacity,
  TextInput,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { Icon } from "@/components/ui/Icon";
import { useAppColors, spacing, radius, shadowCard } from "@/theme";
import { useFontScale, scaleFont } from "@/theme/fontScale";

export default function AmigosScreen() {
  const colors = useAppColors();
  const insets = useSafeAreaInsets();
  const fontScale = useFontScale();
  const [inviteText, setInviteText] = useState("");

  const s = useMemo(() => {
    const fs = (base: number) => scaleFont(base, fontScale);
    return StyleSheet.create({
      title: { fontSize: fs(28), fontWeight: "700" as const, color: colors.label, marginBottom: spacing.xs },
      subtitle: { fontSize: fs(15), color: colors.secondaryLabel, marginBottom: spacing.xxl },
      inviteTitle: { fontSize: fs(17), fontWeight: "600" as const, color: colors.label },
      inviteDesc: { fontSize: fs(13), color: colors.secondaryLabel },
      sectionHeader: { fontSize: fs(17), fontWeight: "600" as const, color: colors.label, marginBottom: spacing.md },
      friendName: { fontSize: fs(16), fontWeight: "600" as const, color: colors.label },
      friendRelation: { fontSize: fs(13), color: colors.secondaryLabel },
      privacyText: { flex: 1, fontSize: fs(13), color: colors.systemBlue },
      statusBadgeText: { fontWeight: "600" as const },
    });
  }, [fontScale, colors]);

  const styles = useMemo(() => createStyles(colors), [colors]);

  const friends = [
    { id: "1", name: "Nanci Lima", relation: "Mãe", status: "connected" as const },
    { id: "2", name: "Francisco Fernandes", relation: "Pai", status: "pending" as const },
  ];

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 32 }]}
        contentInsetAdjustmentBehavior="automatic"
      >
        <Text style={s.title}>Amigos & Família</Text>
          <Text style={s.subtitle}>
          Convide pessoas de confiança para acompanhar sua saúde
        </Text>

        {/* Invite */}
        <View style={styles.inviteCard}>
          <View style={styles.inviteHeader}>
            <View style={[styles.inviteIcon, { backgroundColor: colors.systemBlue }]}>
              <Icon name="person-add" size={24} color={colors.onTint} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={s.inviteTitle}>Convidar Supporte</Text>
              <Text style={s.inviteDesc}>
                Adicione familiares ou amigos para sua rede de apoio
              </Text>
            </View>
          </View>
          <View style={styles.inviteRow}>
            <TextInput
              style={styles.inviteInput}
              placeholder="Número ou email"
              placeholderTextColor={colors.tertiaryLabel}
              value={inviteText}
              onChangeText={setInviteText}
            />
            <TouchableOpacity style={[styles.inviteBtn, { backgroundColor: colors.systemBlue }]}>
              <Icon name="arrow-forward" size={20} color={colors.onTint} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Friends list */}
        <View style={styles.section}>
              <Text style={s.sectionHeader}>
            Rede de Apoio ({friends.length})
          </Text>
          {friends.map((f) => (
            <View key={f.id} style={styles.friendCard}>
              <View style={[styles.avatar, { backgroundColor: f.status === "connected" ? colors.systemGreen : colors.separator }]}>
                <Icon
                  name={f.status === "connected" ? "person" : "person-outline"}
                  size={24}
                  color={colors.onTint}
                />
              </View>
              <View style={styles.friendInfo}>
                <Text style={s.friendName}>{f.name}</Text>
                <Text style={s.friendRelation}>{f.relation}</Text>
              </View>
              <View
                style={[
                  styles.statusBadge,
                  {
                    backgroundColor: f.status === "connected"
                      ? `${colors.systemGreen}20`
                      : `${colors.systemOrange}20`,
                  },
                ]}
              >
                <Text
                  style={[
                    s.statusBadgeText,
                    {
                      fontSize: scaleFont(12, fontScale),
                      color: f.status === "connected" ? colors.systemGreen : colors.systemOrange,
                    },
                  ]}
                >
                  {f.status === "connected" ? "Conectado" : "Pendente"}
                </Text>
              </View>
            </View>
          ))}
        </View>

        {/* Privacy notice */}
        <View style={styles.privacyCard}>
          <Icon name="lock-closed" size={20} color={colors.systemBlue} />
          <Text style={styles.privacyText}>
            Seus dados são protegidos e só são compartilhados com pessoas autorizadas.
          </Text>
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
  content: {
    padding: spacing.lg,
  },
  title: {
    fontWeight: "700" as const,
    color: c.label,
    marginBottom: spacing.xs,
  },
  subtitle: {
    color: c.secondaryLabel,
    marginBottom: spacing.xxl,
  },
  inviteCard: {
    backgroundColor: c.systemBackground,
    borderRadius: radius.lg,
    padding: spacing.lg,
    marginBottom: spacing.xxl,
    ...shadowCard,
  },
  inviteHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  inviteIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
  },
  inviteTitle: {
    fontWeight: "600" as const,
    color: c.label,
  },
  inviteDesc: {
    color: c.secondaryLabel,
  },
  inviteRow: {
    flexDirection: "row",
    gap: spacing.sm,
  },
  inviteInput: {
    flex: 1,
    backgroundColor: c.tertiarySystemBackground,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    fontSize: 16,
    color: c.label,
    borderWidth: 1,
    borderColor: c.separator,
  },
  inviteBtn: {
    width: 48,
    height: 48,
    borderRadius: radius.md,
    justifyContent: "center",
    alignItems: "center",
  },
  section: {
    marginBottom: spacing.lg,
  },
  sectionHeader: {
    fontWeight: "600" as const,
    color: c.label,
    marginBottom: spacing.md,
  },
  friendCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: c.systemBackground,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
    gap: spacing.md,
    ...shadowCard,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
  },
  friendInfo: {
    flex: 1,
  },
  friendName: {
    fontWeight: "600" as const,
    color: c.label,
  },
  friendRelation: {
    color: c.secondaryLabel,
  },
  statusBadge: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.full,
  },
  privacyCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    backgroundColor: `${c.systemBlue}10`,
    borderRadius: radius.md,
    padding: spacing.md,
  },
  privacyText: {
    flex: 1,
    color: c.systemBlue,
  },
  statusBadgeText: {
    fontWeight: "600" as const,
  },
});

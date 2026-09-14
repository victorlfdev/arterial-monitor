import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  StyleSheet,
  View,
  ScrollView,
  Text,
  TouchableOpacity,
  Switch,
  TextInput,
  Alert,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { Icon } from "@/components/ui/Icon";
import useAppStore from "@/store/useAppStore";
import {
  getServerUrl,
  setServerUrl,
  resetServerUrl,
} from "@/constants/server";
import { useAppColors, spacing, radius, shadowCard } from "@/theme";
import { useFontScale, scaleFont } from "@/theme/fontScale";

export default function SettingsScreen() {
  const colors = useAppColors();
  const insets = useSafeAreaInsets();
  const { isConnected, lastSync } = useAppStore();
  const fontScale = useFontScale();

  const s = useMemo(() => {
    const fs = (base: number) => scaleFont(base, fontScale);
    return StyleSheet.create({
      title: { fontSize: fs(28), fontWeight: "700" as const, color: colors.label, marginBottom: spacing.lg },
      sectionHeader: { fontSize: fs(17), fontWeight: "600" as const, color: colors.label, marginBottom: spacing.md },
      appTitle: { fontSize: fs(18), fontWeight: "700" as const, color: colors.label },
      appVersion: { fontSize: fs(13), color: colors.tertiaryLabel },
      statusText: { fontSize: fs(13), color: colors.secondaryLabel },
      syncText: { fontSize: fs(12), color: colors.tertiaryLabel, marginTop: spacing.xs },
      settingTitle: { fontSize: fs(15), fontWeight: "600" as const, color: colors.label },
      settingDesc: { fontSize: fs(13), color: colors.secondaryLabel },
      testBtnText: { fontSize: fs(14), fontWeight: "600" as const, color: colors.systemBlue },
      configBtnText: { fontSize: fs(14), fontWeight: "600" as const, color: colors.systemBlue },
      serverBtnTextCancel: { fontSize: fs(14), fontWeight: "600" as const, color: colors.secondaryLabel },
      serverBtnTextSave: { fontSize: fs(14), fontWeight: "600" as const, color: colors.onTint },
      serverBtnTextReset: { fontSize: fs(14), fontWeight: "600" as const, color: colors.secondaryLabel },
      aboutText: { fontSize: fs(14), color: colors.label, marginBottom: spacing.md, lineHeight: 20 },
      aboutLink: { fontSize: fs(13), color: colors.tertiaryLabel, lineHeight: 18 },
    });
  }, [fontScale, colors]);

  const styles = useMemo(() => createStyles(colors), [colors]);

  const [morningEnabled, setMorningEnabled] = useState(true);
  const [eveningEnabled, setEveningEnabled] = useState(true);
  const [serverUrl, setServerUrlState] = useState("");
  const [showServerConfig, setShowServerConfig] = useState(false);

  useEffect(() => {
    getServerUrl().then(setServerUrlState);
  }, []);

  const handleTestNotification = useCallback(async () => {
    try {
      const { scheduleNotificationAsync } = await import("expo-notifications");
      await scheduleNotificationAsync({
        content: {
          title: "Pressão Arterial",
          body: "Esta é uma notificação de teste. Configure seus horários de lembrete nas opções abaixo.",
          sound: true,
        },
        trigger: null,
      });
      Alert.alert("Sucesso", "Notificação de teste enviada!");
    } catch {
      Alert.alert(
        "Indisponível",
        "Notificações não estão disponíveis no Expo Go. Use um desenvolvimento build para testar lembretes.",
      );
    }
  }, []);

  const handleSaveServer = async () => {
    if (serverUrl.trim()) {
      await setServerUrl(serverUrl.trim());
      Alert.alert("Sucesso", "URL do servidor atualizada!");
    }
    setShowServerConfig(false);
  };

  const handleResetServer = async () => {
    await resetServerUrl();
    setServerUrlState("");
    setShowServerConfig(false);
    Alert.alert("Sucesso", "URL do servidor restaurada para padrão!");
  };

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 32 }]}
        contentInsetAdjustmentBehavior="automatic"
      >
        <Text style={s.title}>Configurações</Text>

        {/* App Info */}
        <View style={styles.section}>
          <View style={styles.infoCard}>
            <View style={styles.appIcon}>
              <Icon name="heart" size={32} color={colors.systemRed} />
            </View>
            <View style={styles.appInfo}>
              <Text style={s.appTitle}>Pressão Arterial</Text>
              <Text style={s.appVersion}>Versão 1.0.0</Text>
              <View style={styles.statusRow}>
                <View
                  style={[
                    styles.statusDot,
                    { backgroundColor: isConnected ? colors.systemGreen : colors.systemRed },
                  ]}
                />
                <Text style={s.statusText}>
                  {isConnected ? "Servidor conectado" : "Offline"}
                </Text>
              </View>
              {lastSync && (
                <Text style={s.syncText}>
                  Última sincronização: {lastSync}
                </Text>
              )}
            </View>
          </View>
        </View>

        {/* Reminders */}
        <View style={styles.section}>
          <Text style={s.sectionHeader}>Lembretes</Text>

          <View style={styles.settingRow}>
            <View style={styles.settingLeft}>
              <Icon name="alarm" size={20} color={colors.systemBlue} />
              <View style={{ marginLeft: spacing.sm }}>
                <Text style={s.settingTitle}>Lembrete Matinal</Text>
                <Text style={s.settingDesc}>
                  Medição pela manhã
                </Text>
              </View>
            </View>
            <Switch
              value={morningEnabled}
              onValueChange={setMorningEnabled}
              trackColor={{ false: colors.separator, true: colors.systemGreen }}
              thumbColor={colors.onTint}
              accessibilityRole="switch"
              accessibilityLabel="Lembrete matinal"
              accessibilityHint={`Lembrete matinal ${morningEnabled ? 'ativado' : 'desativado'}. Toque para alternar.`}
              style={styles.switchTouch}
            />
          </View>

          <View style={styles.settingRow}>
            <View style={styles.settingLeft}>
              <Icon name="moon" size={20} color={colors.systemPurple} />
              <View style={{ marginLeft: spacing.sm }}>
                <Text style={s.settingTitle}>Lembrete Noturno</Text>
                <Text style={s.settingDesc}>
                  Medição à noite
                </Text>
              </View>
            </View>
            <Switch
              value={eveningEnabled}
              onValueChange={setEveningEnabled}
              trackColor={{ false: colors.separator, true: colors.systemGreen }}
              thumbColor={colors.onTint}
              accessibilityRole="switch"
              accessibilityLabel="Lembrete noturno"
              accessibilityHint={`Lembrete noturno ${eveningEnabled ? 'ativado' : 'desativado'}. Toque para alternar.`}
              style={styles.switchTouch}
            />
          </View>

          <TouchableOpacity style={styles.testBtn} onPress={handleTestNotification} accessibilityRole="button" accessibilityLabel="Enviar notificação de teste">
            <Icon name="notifications" size={20} color={colors.systemBlue} />
            <Text style={s.testBtnText}>Enviar Notificação de Teste</Text>
          </TouchableOpacity>
        </View>

        {/* Server */}
        <View style={styles.section}>
              <Text style={s.sectionHeader}>Servidor</Text>

          {!showServerConfig ? (
            <>
              <View style={styles.settingRow}>
                <View style={styles.settingLeft}>
                  <Icon name="server" size={20} color={colors.systemOrange} />
                  <View style={{ marginLeft: spacing.sm }}>
                    <Text style={s.settingTitle}>URL do Servidor</Text>
                    <Text style={s.settingDesc} numberOfLines={1}>
                      {serverUrl || "Padrão"}
                    </Text>
                  </View>
                </View>
              </View>
              <TouchableOpacity
                style={styles.configBtn}
                onPress={() => setShowServerConfig(true)}
                accessibilityRole="button"
                accessibilityLabel="Configurar URL do servidor"
              >
                <Icon name="create-outline" size={20} color={colors.systemBlue} />
                <Text style={s.configBtnText}>Configurar URL</Text>
              </TouchableOpacity>
            </>
          ) : (
            <View style={styles.serverConfig}>
              <TextInput
                style={styles.serverInput}
                value={serverUrl}
                onChangeText={setServerUrlState}
                placeholder="http://seu-servidor:3001"
                placeholderTextColor={colors.tertiaryLabel}
                accessibilityLabel="URL do servidor"
                accessibilityHint="Digite a URL do servidor backend"
              />
              <View style={styles.serverActions}>
                <TouchableOpacity style={[styles.serverBtn, styles.serverBtnCancel]} onPress={() => setShowServerConfig(false)} accessibilityRole="button" accessibilityLabel="Cancelar">
                  <Text style={s.serverBtnTextCancel}>Cancelar</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.serverBtn, styles.serverBtnSave]} onPress={handleSaveServer} accessibilityRole="button" accessibilityLabel="Salvar URL">
                  <Text style={s.serverBtnTextSave}>Salvar</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.serverBtn, styles.serverBtnReset]} onPress={handleResetServer} accessibilityRole="button" accessibilityLabel="Restaurar URL padrão">
                  <Text style={s.serverBtnTextReset}>Restaurar Padrão</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>

        {/* About */}
        <View style={styles.section}>
              <Text style={s.sectionHeader}>Sobre</Text>
          <View style={styles.aboutCard}>
            <Text style={s.aboutText}>
              Pressão Arterial Monitor é um aplicativo para acompanhar suas medições de pressão arterial ao longo do tempo.
            </Text>
            <Text style={s.aboutLink}>
              Em caso de dúvidas, consulte seu médico. Este aplicativo não substitui acompanhamento profissional.
            </Text>
          </View>
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
    marginBottom: spacing.lg,
  },
  section: {
    marginBottom: spacing.xxl,
  },
  sectionHeader: {
    fontWeight: "600" as const,
    color: c.label,
    marginBottom: spacing.md,
  },
  infoCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: c.systemBackground,
    borderRadius: radius.lg,
    padding: spacing.lg,
    gap: spacing.lg,
    ...shadowCard,
  },
  appIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: `${c.systemRed}15`,
    justifyContent: "center",
    alignItems: "center",
  },
  appInfo: {
    flex: 1,
  },
  appTitle: {
    fontWeight: "700" as const,
    color: c.label,
  },
  appVersion: {
    color: c.tertiaryLabel,
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
    color: c.secondaryLabel,
  },
  syncText: {
    color: c.tertiaryLabel,
    marginTop: spacing.xs,
  },
  settingRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: c.systemBackground,
    borderRadius: radius.md,
    padding: spacing.lg,
    marginBottom: spacing.sm,
    ...shadowCard,
  },
  settingLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  settingTitle: {
    fontWeight: "600" as const,
    color: c.label,
  },
  settingDesc: {
    color: c.secondaryLabel,
  },
  testBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: `${c.systemBlue}10`,
    borderRadius: radius.md,
    padding: spacing.md,
    marginTop: spacing.md,
    gap: spacing.sm,
    minHeight: 44,
  },
  switchTouch: {
    width: 44,
    height: 44,
    justifyContent: "center",
    alignItems: "center",
  },
  testBtnText: {
    fontWeight: "600" as const,
    color: c.systemBlue,
  },
  configBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: `${c.systemBlue}10`,
    borderRadius: radius.md,
    padding: spacing.md,
    marginTop: spacing.sm,
    gap: spacing.sm,
    minHeight: 44,
  },
  configBtnText: {
    fontWeight: "600" as const,
    color: c.systemBlue,
  },
  serverConfig: {
    backgroundColor: c.systemBackground,
    borderRadius: radius.lg,
    padding: spacing.lg,
    ...shadowCard,
  },
  serverInput: {
    backgroundColor: c.tertiarySystemBackground,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    fontSize: 15,
    color: c.label,
    borderWidth: 1,
    borderColor: c.separator,
    marginBottom: spacing.md,
  },
  serverActions: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
  },
  serverBtn: {
    flex: 1,
    padding: spacing.md,
    borderRadius: radius.md,
    alignItems: "center",
    minWidth: 100,
  },
  serverBtnCancel: {
    backgroundColor: c.tertiarySystemBackground,
  },
  serverBtnTextCancel: {
    fontWeight: "600" as const,
    color: c.secondaryLabel,
  },
  serverBtnSave: {
    backgroundColor: c.systemBlue,
  },
  serverBtnTextSave: {
    fontWeight: "600" as const,
    color: c.onTint,
  },
  serverBtnReset: {
    backgroundColor: c.tertiarySystemBackground,
  },
  serverBtnTextReset: {
    fontWeight: "600" as const,
    color: c.secondaryLabel,
  },
  aboutCard: {
    backgroundColor: c.systemBackground,
    borderRadius: radius.lg,
    padding: spacing.lg,
    ...shadowCard,
  },
  aboutText: {
    color: c.label,
    marginBottom: spacing.md,
    lineHeight: 20,
  },
  aboutLink: {
    color: c.tertiaryLabel,
    lineHeight: 18,
  },
});

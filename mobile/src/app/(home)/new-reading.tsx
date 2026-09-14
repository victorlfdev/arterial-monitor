import React, { useState, useEffect, useRef, useMemo } from "react";
import {
  StyleSheet,
  View,
  TextInput,
  ScrollView,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Text,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter, useLocalSearchParams } from "expo-router";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { GradientButton } from "@/components/ui/gradient-button";
import { Card } from "@/components/ui/card";
import useAppStore from "@/store/useAppStore";
import { updateReading as apiUpdateReading } from "@/services/api";
import { saveReading, markSynced } from "@/services/localDB";
import { useAppColors, spacing, radius } from "@/theme";

export default function NewReadingScreen() {
  const colors = useAppColors();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams();
  const { medications, fetchMedications, addReading, updateReading } = useAppStore();

  const isEditing = params.editingId && params.editingId !== "undefined";
  const editingId = isEditing ? parseInt(params.editingId) : null;

  const parseBool = (val: unknown) => val === 1 || val === "1" || val === true || val === "true";
  const parseNum = (val: unknown) => (val !== undefined && val !== "" ? parseInt(String(val), 10) : NaN);

  const [systolic, setSystolic] = useState("");
  const [diastolic, setDiastolic] = useState("");
  const [heartRate, setHeartRate] = useState("");
  const [medicationUsed, setMedicationUsed] = useState(false);
  const [selectedMed, setSelectedMed] = useState("");
  const [selectedArm, setSelectedArm] = useState("");
  const [symptoms, setSymptoms] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const initialized = useRef(false);

  const styles = useMemo(() => createStyles(colors), [colors]);

  useEffect(() => {
    fetchMedications();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (initialized.current || !isEditing) return;
    initialized.current = true;
    const timer = setTimeout(() => {
      if (params) {
        const sys = parseNum(params.systolic);
        const dia = parseNum(params.diastolic);
        const hr = parseNum(params.heart_rate);
        setSystolic(sys >= 0 ? String(sys) : "");
        setDiastolic(dia >= 0 ? String(dia) : "");
        setHeartRate(hr >= 0 ? String(hr) : "");
        setMedicationUsed(parseBool(params.medication_used));
        setSelectedMed(params.medication_name?.toString() || "");
        setSelectedArm(params.arm?.toString() || "");
        setSymptoms(params.symptoms?.toString() || "");
        setNotes(params.notes?.toString() || "");
      }
    }, 0);
    return () => clearTimeout(timer);
  }, [isEditing, params]);

  const handleSave = async () => {
    if (!systolic || !diastolic) {
      Alert.alert("Erro", "Pressão sistólica e diastólica são obrigatórias");
      return;
    }
    setLoading(true);
    const reading = {
      systolic: parseInt(systolic),
      diastolic: parseInt(diastolic),
      heart_rate: heartRate ? parseInt(heartRate) : null,
      medication_used: medicationUsed ? 1 : 0,
      medication_name: medicationUsed && selectedMed ? selectedMed : null,
      symptoms: symptoms || null,
      notes: notes || null,
      arm: selectedArm || null,
    };
    try {
      if (isEditing) {
        await saveReading({ id: editingId, ...reading });
        updateReading(editingId, reading);
        const serverResult = await apiUpdateReading(editingId, reading);
        if (serverResult.success && serverResult.data && serverResult.data.id) {
          await markSynced(editingId, serverResult.data.id);
        }
      } else {
        await addReading(reading);
      }
      if (router.canGoBack()) router.back();
      else router.dismiss();
    } catch {
      Alert.alert("Erro", "Não foi possível salvar a medição");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 32 }]}
        >
          <Text style={styles.screenTitle}>
            {isEditing ? "Editar Medição" : "Nova Medição"}
          </Text>

          <LinearGradient
            colors={[colors.coral, colors.teal]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.gradientLine}
          />

          {/* Pressure Input */}
          <View style={styles.section}>
            <Card style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>Pressão Arterial</Text>
            <View style={styles.pressureRow}>
              <View style={styles.pressureInputWrap}>
                <Text style={styles.inputLabel}>Sistólica</Text>
                <TextInput
                  style={styles.numberInput}
                  keyboardType="number-pad"
                  value={systolic}
                  onChangeText={setSystolic}
                  placeholder="120"
                  placeholderTextColor={colors.tertiaryLabel}
                  accessibilityLabel="Pressão sistólica"
                  accessibilityHint="Digite o valor da pressão sistólica em mmHg"
                />
                <Text style={styles.inputUnit}>mmHg</Text>
              </View>
              <View style={styles.pressureInputWrap}>
                <Text style={styles.inputLabel}>Diastólica</Text>
                <TextInput
                  style={styles.numberInput}
                  keyboardType="number-pad"
                  value={diastolic}
                  onChangeText={setDiastolic}
                  placeholder="80"
                  placeholderTextColor={colors.tertiaryLabel}
                  accessibilityLabel="Pressão diastólica"
                  accessibilityHint="Digite o valor da pressão diastólica em mmHg"
                />
                <Text style={styles.inputUnit}>mmHg</Text>
              </View>
            </View>
            </Card>
          </View>

          {/* Heart Rate */}
          <View style={styles.section}>
            <Card style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>Frequência Cardíaca</Text>
            <View style={styles.inputWrap}>
              <TextInput
                style={styles.textInput}
                keyboardType="number-pad"
                value={heartRate}
                onChangeText={setHeartRate}
                placeholder="72"
                placeholderTextColor={colors.tertiaryLabel}
                accessibilityLabel="Frequência cardíaca"
                accessibilityHint="Digite a frequência cardíaca em bpm"
              />
              <Text style={styles.suffix}>bpm</Text>
            </View>
            </Card>
          </View>

          {/* Medication */}
          <View style={styles.section}>
            <Card style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>Medicamento</Text>
            <View style={styles.toggleRow}>
              <TouchableOpacity
                style={[
                  styles.toggleBtn,
                  medicationUsed && styles.toggleBtnActive,
                ]}
                onPress={() => setMedicationUsed(true)}
                accessibilityRole="button"
                accessibilityLabel="Sim"
                accessibilityState={medicationUsed ? { selected: true } : undefined}
              >
                <Text
                  style={[
                    styles.toggleText,
                    medicationUsed && styles.toggleTextActive,
                  ]}
                >
                  Sim
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.toggleBtn,
                  !medicationUsed && styles.toggleBtnActive,
                ]}
                onPress={() => setMedicationUsed(false)}
                accessibilityRole="button"
                accessibilityLabel="Não"
                accessibilityState={!medicationUsed ? { selected: true } : undefined}
              >
                <Text
                  style={[
                    styles.toggleText,
                    !medicationUsed && styles.toggleTextActive,
                  ]}
                >
                  Não
                </Text>
              </TouchableOpacity>
            </View>
            {medicationUsed && medications.length > 0 && (
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.medScroll}
                contentContainerStyle={styles.medScrollContent}
              >
                {medications.map((med) => (
                  <TouchableOpacity
                    key={med.id}
                    style={[
                      styles.medChip,
                      selectedMed === med.name && styles.medChipSelected,
                    ]}
                    onPress={() => setSelectedMed(med.name)}
                    accessibilityRole="button"
                    accessibilityLabel={`${med.name}${selectedMed === med.name ? ' (selecionado)' : ''}`}
                    accessibilityState={selectedMed === med.name ? { selected: true } : undefined}
                  >
                    <Text
                      style={[
                        styles.medChipText,
                        selectedMed === med.name && styles.medChipTextSelected,
                      ]}
                    >
                      {med.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            )}
            </Card>
          </View>

          {/* Arm */}
          <View style={styles.section}>
            <Card style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>Braço</Text>
            <View style={styles.toggleRow}>
              <TouchableOpacity
                style={[
                  styles.toggleBtn,
                  selectedArm === "left" && styles.toggleBtnActive,
                ]}
                onPress={() => setSelectedArm("left")}
                accessibilityRole="button"
                accessibilityLabel="Braço esquerdo"
                accessibilityState={selectedArm === "left" ? { selected: true } : undefined}
              >
                <Text
                  style={[
                    styles.toggleText,
                    selectedArm === "left" && styles.toggleTextActive,
                  ]}
                >
                  Esquerdo
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.toggleBtn,
                  selectedArm === "right" && styles.toggleBtnActive,
                ]}
                onPress={() => setSelectedArm("right")}
                accessibilityRole="button"
                accessibilityLabel="Braço direito"
                accessibilityState={selectedArm === "right" ? { selected: true } : undefined}
              >
                <Text
                  style={[
                    styles.toggleText,
                    selectedArm === "right" && styles.toggleTextActive,
                  ]}
                >
                  Direito
                </Text>
              </TouchableOpacity>
            </View>
            </Card>
          </View>

          {/* Symptoms */}
          <View style={styles.section}>
            <Card style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>Sintomas (opcional)</Text>
            <TextInput
              style={styles.textArea}
              value={symptoms}
              onChangeText={setSymptoms}
              placeholder="Ex: dor de cabeça, tontura..."
              placeholderTextColor={colors.tertiaryLabel}
              multiline
              numberOfLines={3}
              textAlignVertical="top"
              accessibilityLabel="Sintomas"
              accessibilityHint="Descreva quaisquer sintomas observados"
              />
              </Card>
              </View>

              {/* Notes */}
              <View style={styles.section}>
              <Card style={styles.sectionCard}>
              <Text style={styles.sectionTitle}>Notas (opcional)</Text>
            <TextInput
              style={styles.textArea}
              value={notes}
              onChangeText={setNotes}
              placeholder="Ex: medição após café, após exercício..."
              placeholderTextColor={colors.tertiaryLabel}
              multiline
              numberOfLines={3}
              textAlignVertical="top"
              accessibilityLabel="Notas"
              accessibilityHint="Adicione notas adicionais sobre esta medição"
              />
              </Card>
              </View>

              {/* Save */}
              <View style={styles.saveSection}>
              <GradientButton
                title={isEditing ? "Atualizar" : "Salvar Medição"}
                onPress={handleSave}
                loading={loading}
                style={styles.saveBtn}
              />
              </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const createStyles = (c: ReturnType<typeof useAppColors>) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F9FA",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.lg,
    paddingTop: spacing.md,
  },
  screenTitle: {
    fontSize: 28,
    fontWeight: "700" as const,
    color: c.label,
    marginBottom: spacing.sm,
  },
  gradientLine: {
    height: 4,
    borderRadius: 2,
    marginBottom: spacing.lg,
  },
  section: {
    marginBottom: spacing.md,
  },
  sectionCard: {
    padding: spacing.lg,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: "700" as const,
    color: c.label,
    marginBottom: spacing.md,
  },
  pressureRow: {
    flexDirection: "row",
    gap: spacing.md,
  },
  pressureInputWrap: {
    flex: 1,
    alignItems: "center",
  },
  inputLabel: {
    fontSize: 14,
    color: c.secondaryLabel,
    marginBottom: spacing.sm,
  },
  numberInput: {
    fontSize: 36,
    fontWeight: "700" as const,
    color: c.label,
    textAlign: "center",
    padding: spacing.sm,
    borderBottomWidth: 2,
    borderBottomColor: c.separator,
    minWidth: 100,
  },
  inputUnit: {
    fontSize: 12,
    color: c.tertiaryLabel,
    marginTop: spacing.xs,
  },
  inputWrap: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: c.systemBackground,
    borderWidth: 1,
    borderColor: c.separator,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
  },
  textInput: {
    flex: 1,
    fontSize: 16,
    color: c.label,
    paddingVertical: spacing.md,
  },
  suffix: {
    fontSize: 14,
    color: c.tertiaryLabel,
    paddingHorizontal: spacing.sm,
  },
  textArea: {
    backgroundColor: c.systemBackground,
    borderWidth: 1,
    borderColor: c.separator,
    borderRadius: radius.md,
    padding: spacing.md,
    fontSize: 16,
    color: c.label,
    minHeight: 80,
  },
  toggleRow: {
    flexDirection: "row",
    marginBottom: spacing.sm,
    gap: spacing.md,
  },
  toggleBtn: {
    flex: 1,
    padding: spacing.md,
    borderRadius: radius.md,
    backgroundColor: c.tertiarySystemBackground,
    alignItems: "center",
    borderWidth: 1,
    borderColor: c.separator,
  },
  toggleBtnActive: {
    backgroundColor: `${c.systemBlue}15`,
    borderColor: c.systemBlue,
  },
  toggleText: {
    fontSize: 16,
    color: c.secondaryLabel,
  },
  toggleTextActive: {
    color: c.systemBlue,
    fontWeight: "600" as const,
  },
  medScroll: {
    marginTop: spacing.sm,
  },
  medScrollContent: {
    paddingRight: spacing.md,
    gap: spacing.sm,
  },
  medChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderRadius: radius.full,
    backgroundColor: c.tertiarySystemBackground,
    borderWidth: 1,
    borderColor: c.separator,
    minHeight: 44,
    justifyContent: "center",
    alignItems: "center",
  },
  medChipSelected: {
    backgroundColor: `${c.systemBlue}15`,
    borderColor: c.systemBlue,
  },
  medChipText: {
    fontSize: 14,
    color: c.secondaryLabel,
  },
  medChipTextSelected: {
    color: c.systemBlue,
    fontWeight: "600" as const,
  },
  saveSection: {
    marginTop: spacing.lg,
  },
  saveBtn: {
    minHeight: 52,
  },
});

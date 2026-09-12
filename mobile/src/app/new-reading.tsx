import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  TextInput,
  ScrollView,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Text,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import useAppStore from '@/store/useAppStore';
import { createReading, updateReading as apiUpdateReading } from '@/services/api';
import { saveReading, markSynced } from '@/services/localDB';

export default function NewReadingScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { medications, fetchMedications, addReading, updateReading } = useAppStore();

  const isEditing = params.editingId && params.editingId !== 'undefined';
  const editingId = isEditing ? parseInt(params.editingId) : null;

  const [systolic, setSystolic] = useState('');
  const [diastolic, setDiastolic] = useState('');
  const [heartRate, setHeartRate] = useState('');
  const [medicationUsed, setMedicationUsed] = useState(false);
  const [selectedMedication, setSelectedMedication] = useState('');
  const [selectedArm, setSelectedArm] = useState('');
  const [symptoms, setSymptoms] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchMedications();
    if (isEditing && params) {
      setSystolic(String(params.systolic || ''));
      setDiastolic(String(params.diastolic || ''));
      setHeartRate(String(params.heart_rate || ''));
      setMedicationUsed((params.medication_used === '1' || params.medication_used === 'true'));
      setSelectedMedication(params.medication_name || '');
      setSelectedArm(params.arm || '');
      setSymptoms(params.symptoms || '');
      setNotes(params.notes || '');
    }
  }, []);

  const handleSave = async () => {
    if (!systolic || !diastolic) {
      Alert.alert('Erro', 'Pressão sistólica e diastólica são obrigatórias');
      return;
    }

    setLoading(true);

    const reading = {
      systolic: parseInt(systolic),
      diastolic: parseInt(diastolic),
      heart_rate: heartRate ? parseInt(heartRate) : null,
      medication_used: medicationUsed ? 1 : 0,
      medication_name: medicationUsed && selectedMedication ? selectedMedication : null,
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
        Alert.alert('Sucesso', 'Medição atualizada com sucesso');
      } else {
        await addReading(reading);
        Alert.alert('Sucesso', 'Medição salva localmente');
      }

      if (router.canGoBack()) {
        router.back();
      } else {
        router.dismiss();
      }
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível salvar a medição');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
          <View style={styles.section}>
            <Text type="subtitle" style={styles.sectionTitle}>
              {isEditing ? 'Editar Medição' : 'Nova Medição'}
            </Text>

            <View style={styles.pressureRow}>
              <View style={styles.pressureInputContainer}>
                <Text style={styles.inputLabel}>Sistólica</Text>
                <TextInput
                  style={styles.numberInput}
                  keyboardType="number-pad"
                  value={systolic}
                  onChangeText={setSystolic}
                  placeholder="120"
                  placeholderTextColor="#999"
                />
                <Text style={styles.inputUnit}>mmHg</Text>
              </View>

              <View style={styles.pressureInputContainer}>
                <Text style={styles.inputLabel}>Diastólica</Text>
                <TextInput
                  style={styles.numberInput}
                  keyboardType="number-pad"
                  value={diastolic}
                  onChangeText={setDiastolic}
                  placeholder="80"
                  placeholderTextColor="#999"
                />
                <Text style={styles.inputUnit}>mmHg</Text>
              </View>
            </View>
          </View>

          <View style={styles.section}>
            <Text type="subtitle" style={styles.sectionTitle}>Frequência Cardíaca</Text>
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.textInput}
                keyboardType="number-pad"
                value={heartRate}
                onChangeText={setHeartRate}
                placeholder="72"
                placeholderTextColor="#999"
              />
              <Text style={styles.inputSuffix}>bpm</Text>
            </View>
          </View>

          <View style={styles.section}>
            <Text type="subtitle" style={styles.sectionTitle}>Medicamento</Text>

            <View style={styles.toggleRow}>
              <TouchableOpacity
                style={[styles.toggleButton, medicationUsed && styles.toggleButtonActive]}
                onPress={() => setMedicationUsed(true)}
              >
                <Text style={[styles.toggleText, medicationUsed && styles.toggleTextActive]}>
                  Sim
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.toggleButton, !medicationUsed && styles.toggleButtonActive]}
                onPress={() => setMedicationUsed(false)}
              >
                <Text style={[styles.toggleText, !medicationUsed && styles.toggleTextActive]}>
                  Não
                </Text>
              </TouchableOpacity>
            </View>

            {medicationUsed && medications.length > 0 && (
              <View style={styles.medicationSelector}>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  {medications.map((med) => (
                    <TouchableOpacity
                      key={med.id}
                      style={[
                        styles.medChip,
                        selectedMedication === med.name && styles.medChipSelected,
                      ]}
                      onPress={() => setSelectedMedication(med.name)}
                    >
                      <Text style={[styles.medChipText, selectedMedication === med.name && styles.medChipTextSelected]}>
                        {med.name}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            )}
          </View>

          <View style={styles.section}>
            <Text type="subtitle" style={styles.sectionTitle}>Braço Afendido</Text>
            <View style={styles.toggleRow}>
              <TouchableOpacity
                style={[styles.toggleButton, selectedArm === 'left' && styles.toggleButtonActive]}
                onPress={() => setSelectedArm('left')}
              >
                <Text style={[styles.toggleText, selectedArm === 'left' && styles.toggleTextActive]}>
                  Esquerdo
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.toggleButton, selectedArm === 'right' && styles.toggleButtonActive]}
                onPress={() => setSelectedArm('right')}
              >
                <Text style={[styles.toggleText, selectedArm === 'right' && styles.toggleTextActive]}>
                  Direito
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.section}>
            <Text type="subtitle" style={styles.sectionTitle}>Sintomas (opcional)</Text>
            <TextInput
              style={[styles.textInput, styles.textArea]}
              value={symptoms}
              onChangeText={setSymptoms}
              placeholder="Ex: dor de cabeça, tontura..."
              placeholderTextColor="#999"
              multiline
              numberOfLines={3}
            />
          </View>

          <View style={styles.section}>
            <Text type="subtitle" style={styles.sectionTitle}>Notas (opcional)</Text>
            <TextInput
              style={[styles.textInput, styles.textArea]}
              value={notes}
              onChangeText={setNotes}
              placeholder="Ex: medição após café, após exercício..."
              placeholderTextColor="#999"
              multiline
              numberOfLines={3}
            />
          </View>

          <TouchableOpacity
            style={[styles.saveButton, loading && styles.saveButtonDisabled]}
            onPress={handleSave}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <Ionicons name={isEditing ? "checkmark-circle" : "save"} size={24} color="#fff" />
                <Text style={styles.saveButtonText}>
                  {isEditing ? 'Atualizar Medição' : 'Salvar Medição'}
                </Text>
              </>
            )}
          </TouchableOpacity>

          <View style={styles.bottomPadding} />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  section: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  sectionTitle: {
    marginBottom: 12,
    color: '#333',
  },
  pressureRow: {
    flexDirection: 'row',
    gap: 12,
  },
  pressureInputContainer: {
    flex: 1,
    alignItems: 'center',
  },
  inputLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  numberInput: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    padding: 12,
    borderBottomWidth: 2,
    borderBottomColor: '#e0e0e0',
    minWidth: 100,
  },
  inputUnit: {
    fontSize: 12,
    color: '#999',
    marginTop: 4,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    paddingHorizontal: 12,
  },
  textInput: {
    flex: 1,
    fontSize: 16,
    color: '#333',
    padding: 12,
  },
  inputSuffix: {
    fontSize: 14,
    color: '#999',
    paddingHorizontal: 8,
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  toggleRow: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  toggleButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#f5f5f5',
    alignItems: 'center',
  },
  toggleButtonActive: {
    backgroundColor: '#e3f2fd',
  },
  toggleText: {
    fontSize: 16,
    color: '#666',
  },
  toggleTextActive: {
    color: '#2196f3',
    fontWeight: 'bold',
  },
  medicationSelector: {
    marginTop: 8,
  },
  medChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f5f5f5',
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  medChipSelected: {
    backgroundColor: '#e3f2fd',
    borderColor: '#2196f3',
  },
  medChipText: {
    fontSize: 14,
    color: '#666',
  },
  medChipTextSelected: {
    color: '#2196f3',
    fontWeight: 'bold',
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2196f3',
    padding: 16,
    borderRadius: 12,
    marginTop: 8,
    gap: 8,
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  bottomPadding: {
    height: 40,
  },
});

import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Switch,
  Alert,
  Text,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import {
  scheduleDailyAlarm,
  cancelAlarm,
  cancelAllAlarms,
} from '@/services/notifications';
import { checkHealth } from '@/services/api';
import { fullSync } from '@/services/sync';
import useAppStore from '@/store/useAppStore';
import { getServerUrl, setServerUrl, resetServerUrl } from '@/constants/server';

export default function SettingsScreen() {
  const [morningHour, setMorningHour] = useState('07');
  const [morningMinute, setMorningMinute] = useState('00');
  const [morningEnabled, setMorningEnabled] = useState(false);
  const [eveningHour, setEveningHour] = useState('19');
  const [eveningMinute, setEveningMinute] = useState('00');
  const [eveningEnabled, setEveningEnabled] = useState(false);
  const [connected, setConnected] = useState(true);
  const { setSyncing, setLastSync } = useAppStore();
  const [serverUrl, setServerUrlState] = useState('');
  const [showServerUrlInput, setShowServerUrlInput] = useState(false);
  const [serverUrlInput, setServerUrlInput] = useState('');

  useEffect(() => {
    checkConnection();
    loadServerUrl();
  }, []);

  const loadServerUrl = async () => {
    const url = await getServerUrl();
    setServerUrlState(url);
    setServerUrlInput(url);
  };

  const checkConnection = async () => {
    const isOnline = await checkHealth();
    setConnected(isOnline);
  };

  const handleMorningToggle = async (value) => {
    setMorningEnabled(value);
    if (value) {
      await scheduleDailyAlarm(parseInt(morningHour), parseInt(morningMinute), 'morning-reading');
    } else {
      await cancelAlarm('morning-reading');
    }
  };

  const handleEveningToggle = async (value) => {
    setEveningEnabled(value);
    if (value) {
      await scheduleDailyAlarm(parseInt(eveningHour), parseInt(eveningMinute), 'evening-reading');
    } else {
      await cancelAlarm('evening-reading');
    }
  };

  const handleTestAlarm = async () => {
    await cancelAllAlarms();
    await scheduleDailyAlarm(0, 1, 'test-alarm');
    Alert.alert('Teste', 'Notificação de teste agendada para 1 minuto');
  };

  const handleSaveServerUrl = async () => {
    try {
      const normalized = serverUrlInput.startsWith('http') ? serverUrlInput : `http://${serverUrlInput}`;
      await setServerUrl(normalized);
      setServerUrlState(normalized);
      setShowServerUrlInput(false);
      Alert.alert('Sucesso', 'URL do servidor atualizada');
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível salvar a URL do servidor');
    }
  };

  const handleResetServerUrl = async () => {
    try {
      await resetServerUrl();
      await loadServerUrl();
      Alert.alert('Sucesso', 'URL do servidor restaurada para o padrão');
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível resetar a URL do servidor');
    }
  };

  const handleSync = async () => {
    setSyncing(true);
    try {
      await fullSync();
      setLastSync(new Date().toISOString());
      Alert.alert('Sincronização', 'Dados sincronizados com sucesso');
    } catch (error) {
      console.error('Sync error:', error);
      Alert.alert('Erro', 'Falha ao sincronizar dados');
    } finally {
      setSyncing(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        <View style={styles.section}>
          <Text type="subtitle" style={styles.sectionTitle}>
            <Ionicons name="information-circle" size={20} />
            {' '}Sobre o App
          </Text>
          <Text style={styles.infoText}>
            Pressão Arterial Monitor v1.0
          </Text>
          <Text style={styles.infoText}>
            Registre e acompanhe suas medições de pressão arterial.
          </Text>
          <Text style={styles.infoText}>
            {connected ? 'Servidor conectado' : 'Servidor desconectado'}
          </Text>
        </View>

        <View style={styles.section}>
          <Text type="subtitle" style={styles.sectionTitle}>
            <Ionicons name="notifications" size={20} />
            {' '}Lembretes
          </Text>

          <View style={styles.reminderCard}>
            <View style={styles.reminderHeader}>
              <Text style={styles.reminderTitle}>Medição Matinal</Text>
              <Switch
                value={morningEnabled}
                onValueChange={handleMorningToggle}
                trackColor={{ false: '#ccc', true: '#64b5f6' }}
                thumbColor={morningEnabled ? '#2196f3' : '#f5f5f5'}
              />
            </View>

            <View style={styles.timePicker}>
              <TextInput
                style={styles.timeInput}
                value={morningHour}
                onChangeText={setMorningHour}
                keyboardType="number-pad"
                maxLength={2}
              />
              <Text style={styles.timeColon}>:</Text>
              <TextInput
                style={styles.timeInput}
                value={morningMinute}
                onChangeText={setMorningMinute}
                keyboardType="number-pad"
                maxLength={2}
              />
              <Text style={styles.timeLabel}>horas</Text>
            </View>

            {morningEnabled && (
              <TouchableOpacity onPress={handleTestAlarm} style={styles.testButton}>
                <Text style={styles.testButtonText}>Testar notificação</Text>
              </TouchableOpacity>
            )}
          </View>

          <View style={styles.reminderCard}>
            <View style={styles.reminderHeader}>
              <Text style={styles.reminderTitle}>Medição Vespertina</Text>
              <Switch
                value={eveningEnabled}
                onValueChange={handleEveningToggle}
                trackColor={{ false: '#ccc', true: '#64b5f6' }}
                thumbColor={eveningEnabled ? '#2196f3' : '#f5f5f5'}
              />
            </View>

            <View style={styles.timePicker}>
              <TextInput
                style={styles.timeInput}
                value={eveningHour}
                onChangeText={setEveningHour}
                keyboardType="number-pad"
                maxLength={2}
              />
              <Text style={styles.timeColon}>:</Text>
              <TextInput
                style={styles.timeInput}
                value={eveningMinute}
                onChangeText={setEveningMinute}
                keyboardType="number-pad"
                maxLength={2}
              />
              <Text style={styles.timeLabel}>horas</Text>
            </View>

            {eveningEnabled && (
              <TouchableOpacity onPress={handleTestAlarm} style={styles.testButton}>
                <Text style={styles.testButtonText}>Testar notificação</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        <View style={styles.section}>
          <Text type="subtitle" style={styles.sectionTitle}>
            <Ionicons name="cloud" size={20} />
            {' '}Sincronização
          </Text>
          <TouchableOpacity style={styles.actionButton} onPress={handleSync}>
            <Ionicons name="sync" size={20} color="#2196f3" />
            <Text style={styles.actionButtonText}>Sincronizar agora</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text type="subtitle" style={styles.sectionTitle}>
            <Ionicons name="build" size={20} />
            {' '}Servidor
          </Text>
          <Text style={styles.infoText}>URL do servidor:</Text>
          {showServerUrlInput ? (
            <View style={{ gap: 8 }}>
              <TextInput
                style={[styles.codeText, { height: 44 }]}
                value={serverUrlInput}
                onChangeText={setServerUrlInput}
                placeholder="http://100.76.124.1:3001"
              />
              <View style={{ flexDirection: 'row', gap: 8 }}>
                <TouchableOpacity
                  style={[styles.actionButton, { backgroundColor: '#2196f3' }]}
                  onPress={handleSaveServerUrl}
                >
                  <Text style={{ color: '#fff', fontSize: 14, fontWeight: 'bold' }}>Salvar</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.actionButton, { backgroundColor: '#f5f5f5' }]}
                  onPress={() => { setShowServerUrlInput(false); loadServerUrl(); }}
                >
                  <Text style={{ color: '#666', fontSize: 14, fontWeight: 'bold' }}>Cancelar</Text>
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <TouchableOpacity style={styles.actionButton} onPress={() => { setShowServerUrlInput(true); setServerUrlInput(serverUrl); }}>
              <Ionicons name="create" size={16} color="#666" />
              <Text style={{ color: '#666', fontSize: 14 }}>
                {serverUrl}
              </Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity onPress={handleResetServerUrl} style={{ marginTop: 8 }}>
            <Text style={{ color: '#2196f3', fontSize: 13 }}>Resetar para padrão</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
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
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
    color: '#333',
  },
  infoText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  codeText: {
    fontSize: 12,
    color: '#2196f3',
    fontFamily: 'monospace',
    backgroundColor: '#f5f5f5',
    padding: 8,
    borderRadius: 6,
    marginTop: 4,
  },
  reminderCard: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    padding: 12,
    marginBottom: 10,
  },
  reminderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  reminderTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  timePicker: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  timeInput: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    width: 50,
    textAlign: 'center',
    padding: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 6,
  },
  timeColon: {
    fontSize: 24,
    color: '#999',
  },
  timeLabel: {
    fontSize: 14,
    color: '#999',
    marginLeft: 8,
  },
  testButton: {
    marginTop: 8,
    padding: 8,
    backgroundColor: '#e3f2fd',
    borderRadius: 6,
    alignItems: 'center',
  },
  testButtonText: {
    fontSize: 14,
    color: '#2196f3',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 12,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
  },
  actionButtonText: {
    fontSize: 16,
    color: '#2196f3',
  },
});

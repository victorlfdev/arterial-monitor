import React, { useState, useEffect, useCallback } from 'react';
import {
  StyleSheet,
  View,
  TouchableOpacity,
  ScrollView,
  Alert,
  RefreshControl,
  Text,
  Modal,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { format, formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

import useAppStore from '@/store/useAppStore';
import { fullSync } from '@/services/sync';
import { checkHealth } from '@/services/api';
import PressureChart from '@/components/PressureChart';

export default function HomeScreen() {
  const router = useRouter();
  const { readings, medications, loading, fetchReadings, fetchMedications, deleteReading, updateReading } = useAppStore();
  const [refreshing, setRefreshing] = useState(false);
  const [connected, setConnected] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedReading, setSelectedReading] = useState(null);

  useEffect(() => {
    fetchReadings();
    fetchMedications();
    checkConnection();
  }, []);

  const checkConnection = async () => {
    const isOnline = await checkHealth();
    setConnected(isOnline);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await fullSync();
    } catch (error) {
      console.error('Refresh sync error:', error);
    }
    await fetchReadings();
    await checkConnection();
    setRefreshing(false);
  };

  const lastReading = readings[0];

  const getPressureColor = (sys, dia) => {
    if (sys < 120 && dia < 80) return '#4caf50';
    if (sys < 140 || dia < 90) return '#ff9800';
    return '#f44336';
  };

  const getPressureLabel = (sys, dia) => {
    if (sys < 120 && dia < 80) return 'Normal';
    if (sys < 140 || dia < 90) return 'Elevada';
    return 'Alta - Consultar médico';
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Data não disponível';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 'Data inválida';
      return format(date, "dd 'de' MMMM 'às' HH:mm", { locale: ptBR });
    } catch (error) {
      return 'Data não disponível';
    }
  };

  const handleEdit = (reading) => {
    setSelectedReading(reading);
    setModalVisible(true);
  };

  const handleDelete = async (reading) => {
    Alert.alert(
      'Excluir Medição',
      'Tem certeza que deseja excluir esta medição?',
      [
        { text: 'Cancelar', onPress: () => {} },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: async () => {
            try {
              deleteReading(reading.id);
              if (reading.server_id) {
                const { deleteReading: deleteFromApi } = await import('@/services/api');
                await deleteFromApi(reading.server_id);
              }
              setModalVisible(false);
              Alert.alert('Sucesso', 'Medição excluída com sucesso');
            } catch (error) {
              Alert.alert('Erro', 'Não foi possível excluir a medição');
            }
          },
        },
      ]
    );
  };

  const formatDateShort = (dateString) => {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return '';
      return formatDistanceToNow(date, { locale: ptBR, addSuffix: true });
    } catch (error) {
      return '';
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View style={styles.header}>
          <View style={styles.headerRow}>
            <View style={styles.titleArea}>
              <Text style={styles.appTitle}>Pressão Arterial</Text>
              <View style={styles.statusBar}>
                <View style={[styles.statusDot, { backgroundColor: connected ? '#4caf50' : '#f44336' }]} />
                <Text style={styles.statusText}>
                  {connected ? 'Conectado' : 'Offline'}
                </Text>
              </View>
            </View>
            <TouchableOpacity style={styles.profileButton} onPress={() => router.push('/settings')}>
              <Ionicons name="person-circle" size={32} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.quickActions}>
          <TouchableOpacity style={styles.actionCard} onPress={() => router.push('/conquistas')}>
            <View style={[styles.actionIcon, { backgroundColor: '#ffc107' }]}>
              <Ionicons name="trophy" size={24} color="#fff" />
            </View>
            <Text style={styles.actionLabel}>Conquistas</Text>
            <Text style={styles.actionSublabel}>Em breve</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionCard} onPress={() => router.push('/desafios')}>
            <View style={[styles.actionIcon, { backgroundColor: '#4caf50' }]}>
              <Ionicons name="flag" size={24} color="#fff" />
            </View>
            <Text style={styles.actionLabel}>Desafios</Text>
            <Text style={styles.actionSublabel}>Em breve</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionCard} onPress={() => router.push('/amigos')}>
            <View style={[styles.actionIcon, { backgroundColor: '#2196f3' }]}>
              <Ionicons name="people" size={24} color="#fff" />
            </View>
            <Text style={styles.actionLabel}>Amigos</Text>
            <Text style={styles.actionSublabel}>Em breve</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionCard} onPress={() => router.push('/relatorios')}>
            <View style={[styles.actionIcon, { backgroundColor: '#9c27b0' }]}>
              <Ionicons name="document-text" size={24} color="#fff" />
            </View>
            <Text style={styles.actionLabel}>Relatórios</Text>
            <Text style={styles.actionSublabel}>Em breve</Text>
          </TouchableOpacity>
        </View>

        {lastReading ? (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Última medição</Text>

            <View style={styles.pressureContainer}>
              <Text style={[styles.pressureValue, { color: getPressureColor(lastReading.systolic, lastReading.diastolic) }]}>
                {lastReading.systolic}/{lastReading.diastolic}
              </Text>
              <Text style={styles.pressureUnit}>mmHg</Text>
            </View>

            <View style={styles.infoRow}>
              {lastReading.heart_rate ? (
                <View style={styles.infoItem}>
                  <Ionicons name="heart" size={20} color="#e91e63" />
                  <Text style={styles.infoValue}>{lastReading.heart_rate} bpm</Text>
                </View>
              ) : null}
            </View>

            <Text style={styles.timestamp}>{formatDate(lastReading.created_at)}</Text>

            {lastReading.medication_name && (
              <View style={styles.medTag}>
                <Ionicons name="medkit" size={16} color="#2196f3" />
                <Text style={styles.medText}>{lastReading.medication_name}</Text>
              </View>
            )}

            {lastReading.symptoms && (
              <View style={styles.symptomTag}>
                <Ionicons name="alert-circle" size={16} color="#ff9800" />
                <Text style={styles.symptomText}>{lastReading.symptoms}</Text>
              </View>
            )}

            <View style={styles.statusBadge}>
              <Text style={styles.statusBadgeText}>{getPressureLabel(lastReading.systolic, lastReading.diastolic)}</Text>
            </View>
          </View>
        ) : null}

        <PressureChart readings={readings} />

        <View style={styles.stubsSection}>
          <View style={styles.stubCard}>
            <View style={styles.stubHeader}>
              <Ionicons name="flash" size={24} color="#ff9800" />
              <Text style={styles.stubTitle}>Sequência Ativa</Text>
            </View>
            <Text style={styles.stubValue}>{readings.length > 0 ? '🔥' : '—'}</Text>
            <Text style={styles.stubDescription}>
              {readings.length > 0 ? 'Mantenha sua sequência!' : 'Registre hoje para começar'}
            </Text>
          </View>
          <View style={styles.stubCard}>
            <View style={styles.stubHeader}>
              <Ionicons name="people" size={24} color="#4caf50" />
              <Text style={styles.stubTitle}>Rede de Apoio</Text>
            </View>
            <Text style={styles.stubValue}>👥</Text>
            <Text style={styles.stubDescription}>
              Convide amigos e familiares para participar
            </Text>
          </View>
        </View>

        <View style={styles.statsCard}>
          <Text style={styles.statsTitle}>Histórico de Medições</Text>
          
          {readings.length > 0 ? (
            readings.map((reading) => (
              <TouchableOpacity
                key={reading.id}
                style={styles.historyItem}
                onPress={() => handleEdit(reading)}
              >
                <View style={styles.historyPressure}>
                  <Text style={[styles.historyPressureValue, { color: getPressureColor(reading.systolic, reading.diastolic) }]}>
                    {reading.systolic}/{reading.diastolic}
                  </Text>
                  <Text style={styles.historyPressureUnit}>mmHg</Text>
                </View>
                
                <View style={styles.historyRight}>
                  <Text style={styles.historyTime}>{formatDateShort(reading.created_at)}</Text>
                  
                  {reading.heart_rate && (
                    <View style={styles.historyHeartRate}>
                      <Ionicons name="heart" size={14} color="#e91e63" />
                      <Text style={styles.historyHeartRateText}>{reading.heart_rate} bpm</Text>
                    </View>
                  )}

                  <View style={styles.historyActions}>
                    <TouchableOpacity
                      style={styles.actionButton}
                      onPress={(e) => {
                        e.stopPropagation();
                        handleEdit(reading);
                      }}
                    >
                      <Ionicons name="create" size={18} color="#2196f3" />
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.actionButton}
                      onPress={(e) => {
                        e.stopPropagation();
                        handleDelete(reading);
                      }}
                    >
                      <Ionicons name="trash" size={18} color="#f44336" />
                    </TouchableOpacity>
                  </View>
                </View>
              </TouchableOpacity>
            ))
          ) : (
            <Text style={styles.emptyHistoryText}>
              Nenhuma medição registrada
            </Text>
          )}
        </View>
      </ScrollView>

      <TouchableOpacity
        style={styles.fab}
        onPress={() => router.push('/new-reading')}
      >
        <Ionicons name="add" size={32} color="#fff" />
      </TouchableOpacity>

      <View style={styles.bottomPadding} />

      <Modal
        visible={modalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setModalVisible(false)}
        >
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              Medição - {selectedReading ? formatDate(selectedReading.created_at) : ''}
            </Text>

            {selectedReading && (
              <>
                <View style={styles.modalDetail}>
                  <Text style={styles.modalDetailLabel}>Pressão:</Text>
                  <Text style={styles.modalDetailValue}>
                    {selectedReading.systolic}/{selectedReading.diastolic} mmHg
                  </Text>
                </View>

                {selectedReading.heart_rate && (
                  <View style={styles.modalDetail}>
                    <Text style={styles.modalDetailLabel}>Frequência Cardíaca:</Text>
                    <Text style={styles.modalDetailValue}>{selectedReading.heart_rate} bpm</Text>
                  </View>
                )}

                {selectedReading.medication_name && (
                  <View style={styles.modalDetail}>
                    <Text style={styles.modalDetailLabel}>Medicamento:</Text>
                    <Text style={styles.modalDetailValue}>{selectedReading.medication_name}</Text>
                  </View>
                )}

                {selectedReading.symptoms && (
                  <View style={styles.modalDetail}>
                    <Text style={styles.modalDetailLabel}>Sintomas:</Text>
                    <Text style={styles.modalDetailValue}>{selectedReading.symptoms}</Text>
                  </View>
                )}

                {selectedReading.notes && (
                  <View style={styles.modalDetail}>
                    <Text style={styles.modalDetailLabel}>Notas:</Text>
                    <Text style={styles.modalDetailValue}>{selectedReading.notes}</Text>
                  </View>
                )}

                <View style={styles.modalButtons}>
                  <TouchableOpacity
                    style={[styles.modalButton, styles.modalButtonCancel]}
                    onPress={() => {
                      router.push({
                        pathname: '/new-reading',
                        params: { editingId: selectedReading.id, ...selectedReading },
                      });
                      setModalVisible(false);
                    }}
                  >
                    <Ionicons name="create" size={20} color="#2196f3" />
                    <Text style={[styles.modalButtonText, styles.modalButtonCancelText]}>Editar</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.modalButton, styles.modalButtonDelete]}
                    onPress={() => {
                      setModalVisible(false);
                      handleDelete(selectedReading);
                    }}
                  >
                    <Ionicons name="trash" size={20} color="#f44336" />
                    <Text style={[styles.modalButtonText, styles.modalButtonDeleteText]}>Excluir</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </View>
        </TouchableOpacity>
      </Modal>
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
    paddingBottom: 100,
  },
  header: {
    padding: 16,
    backgroundColor: '#2196f3',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  titleArea: {
    flex: 1,
  },
  appTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statusBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  statusText: {
    color: '#fff',
    fontSize: 14,
  },
  profileButton: {
    padding: 4,
  },
  quickActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 16,
    gap: 10,
  },
  actionCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 14,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  actionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  actionLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 2,
  },
  actionSublabel: {
    fontSize: 11,
    color: '#999',
  },
  stubsSection: {
    flexDirection: 'row',
    padding: 16,
    gap: 10,
  },
  stubCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  stubHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  stubTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
  },
  stubValue: {
    fontSize: 32,
    textAlign: 'center',
    marginVertical: 8,
  },
  stubDescription: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  card: {
    margin: 16,
    padding: 20,
    backgroundColor: '#fff',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardTitle: {
    marginBottom: 16,
    color: '#333',
  },
  pressureContainer: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  pressureValue: {
    fontSize: 56,
    fontWeight: 'bold',
    letterSpacing: 2,
  },
  pressureUnit: {
    fontSize: 16,
    color: '#666',
    marginTop: 4,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginTop: 12,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  infoValue: {
    fontSize: 16,
    color: '#333',
  },
  timestamp: {
    fontSize: 14,
    color: '#666',
    marginTop: 12,
  },
  medTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 12,
    padding: 8,
    backgroundColor: '#e3f2fd',
    borderRadius: 6,
  },
  medText: {
    fontSize: 14,
    color: '#1976d2',
  },
  symptomTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 8,
    padding: 8,
    backgroundColor: '#fff3e0',
    borderRadius: 6,
  },
  symptomText: {
    fontSize: 14,
    color: '#f57c00',
  },
  statusBadge: {
    marginTop: 12,
    padding: 8,
    borderRadius: 6,
    alignItems: 'center',
  },
  statusBadgeText: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  emptyText: {
    marginTop: 16,
    color: '#666',
  },
  emptySubtext: {
    marginTop: 8,
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
  },
  statsCard: {
    margin: 16,
    marginTop: 0,
    padding: 20,
    backgroundColor: '#fff',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statsTitle: {
    marginBottom: 12,
    color: '#333',
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2196f3',
  },
  statLabel: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 30,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#2196f3',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 8,
  },
  bottomPadding: {
    height: 80,
  },
  historyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  historyPressure: {
    alignItems: 'center',
    minWidth: 100,
  },
  historyPressureValue: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  historyPressureUnit: {
    fontSize: 12,
    color: '#666',
  },
  historyRight: {
    flex: 1,
    marginLeft: 16,
  },
  historyTime: {
    fontSize: 13,
    color: '#666',
    marginBottom: 4,
  },
  historyHeartRate: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 8,
  },
  historyHeartRateText: {
    fontSize: 12,
    color: '#666',
  },
  historyActions: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    padding: 4,
  },
  emptyHistoryText: {
    color: '#999',
    textAlign: 'center',
    marginTop: 16,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    width: '85%',
    maxWidth: 400,
    maxHeight: '80%',
  },
  modalTitle: {
    marginBottom: 16,
    color: '#333',
  },
  modalDetail: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  modalDetailLabel: {
    fontSize: 14,
    color: '#666',
  },
  modalDetailValue: {
    fontSize: 14,
    color: '#333',
    fontWeight: 'bold',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 20,
    gap: 12,
  },
  modalButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 12,
    borderRadius: 8,
    flex: 1,
    justifyContent: 'center',
  },
  modalButtonCancel: {
    backgroundColor: '#f5f5f5',
  },
  modalButtonDelete: {
    backgroundColor: '#ffebee',
  },
  modalButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  modalButtonCancelText: {
    color: '#2196f3',
  },
  modalButtonDeleteText: {
    color: '#f44336',
  },
});

import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  ScrollView,
  TouchableOpacity,
  Text,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

import useAppStore from '@/store/useAppStore';
import { deleteLocalReading } from '@/services/localDB';

export default function HistoryScreen() {
  const { readings, medications, deleteReading } = useAppStore();
  const [filter, setFilter] = useState('all');

  const filteredReadings = readings.filter((reading) => {
    if (filter === 'medicated') return reading.medication_used === 1;
    if (filter === 'high') return reading.systolic >= 140 || reading.diastolic >= 90;
    return true;
  });

  const getPressureStatus = (sys, dia) => {
    if (sys < 120 && dia < 80) return { label: 'Normal', color: '#4caf50' };
    if (sys < 140 || dia < 90) return { label: 'Elevada', color: '#ff9800' };
    return { label: 'Alta', color: '#f44336' };
  };

  const handleDelete = async (id) => {
    const readingToDelete = readings.find(r => r.id === id);
    deleteReading(id);
    try {
      await deleteLocalReading(id);
    } catch (error) {
      console.error('Error deleting reading:', error);
      if (readingToDelete) {
        const current = useAppStore.getState().readings;
        const stillDeleted = !current.find(r => r.id === id);
        if (stillDeleted) {
          useAppStore.setState((prev) => ({
            readings: [...prev.readings, readingToDelete],
          }));
        }
      }
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.filterContainer}>
        <TouchableOpacity
          style={[styles.filterButton, filter === 'all' && styles.filterButtonActive]}
          onPress={() => setFilter('all')}
        >
          <Text style={[styles.filterText, filter === 'all' && styles.filterTextActive]}>
            Todas
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterButton, filter === 'medicated' && styles.filterButtonActive]}
          onPress={() => setFilter('medicated')}
        >
          <Text style={[styles.filterText, filter === 'medicated' && styles.filterTextActive]}>
            Com medicamento
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterButton, filter === 'high' && styles.filterButtonActive]}
          onPress={() => setFilter('high')}
        >
          <Text style={[styles.filterText, filter === 'high' && styles.filterTextActive]}>
            Pressão alta
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {filteredReadings.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="time" size={48} color="#ccc" />
            <Text style={styles.emptyText}>Nenhuma medição encontrada</Text>
          </View>
        ) : (
          filteredReadings.map((reading) => {
            const status = getPressureStatus(reading.systolic, reading.diastolic);
            return (
              <TouchableOpacity
                key={reading.id}
                style={styles.card}
                onLongPress={() => handleDelete(reading.id)}
              >
                <View style={styles.cardHeader}>
                  <View style={[styles.statusBadge, { backgroundColor: status.color + '20' }]}>
                    <Text style={[styles.statusText, { color: status.color }]}>
                      {status.label}
                    </Text>
                  </View>
                  <Text style={styles.dateText}>
                    {format(new Date(reading.created_at), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                  </Text>
                </View>

                <View style={styles.pressureDisplay}>
                  <Text style={styles.pressureNumber}>
                    {reading.systolic}/{reading.diastolic}
                  </Text>
                  <Text style={styles.pressureUnit}>mmHg</Text>
                </View>

                {reading.heart_rate && (
                  <View style={styles.heartRate}>
                    <Ionicons name="heartbeat" size={16} color="#e91e63" />
                    <Text style={styles.heartRateText}>{reading.heart_rate} bpm</Text>
                  </View>
                )}

                {reading.medication_name && (
                  <View style={styles.medTag}>
                    <Ionicons name="medkit" size={14} color="#2196f3" />
                    <Text style={styles.medText}>{reading.medication_name}</Text>
                  </View>
                )}

                {reading.symptoms && (
                  <View style={styles.symptomRow}>
                    <Ionicons name="alert-circle" size={14} color="#ff9800" />
                    <Text style={styles.symptomText}>{reading.symptoms}</Text>
                  </View>
                )}

                {reading.arm && (
                  <View style={styles.armTag}>
                    <Ionicons name={reading.arm === 'left' ? 'hand-left' : 'hand-right'} size={14} color="#9c27b0" />
                    <Text style={styles.armText}>
                      {reading.arm === 'left' ? 'Braço Esquerdo' : 'Braço Direito'}
                    </Text>
                  </View>
                )}

                {reading.notes && (
                  <Text style={styles.notesText}>{reading.notes}</Text>
                )}
              </TouchableOpacity>
            );
          })
        )}

        <View style={styles.bottomPadding} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  filterContainer: {
    flexDirection: 'row',
    padding: 12,
    gap: 8,
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#e0e0e0',
  },
  filterButtonActive: {
    backgroundColor: '#2196f3',
  },
  filterText: {
    fontSize: 14,
    color: '#666',
  },
  filterTextActive: {
    color: '#fff',
    fontWeight: 'bold',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 12,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    marginTop: 12,
    fontSize: 16,
    color: '#999',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 6,
  },
  statusText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  dateText: {
    fontSize: 12,
    color: '#999',
  },
  pressureDisplay: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginTop: 4,
  },
  pressureNumber: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#333',
  },
  pressureUnit: {
    fontSize: 14,
    color: '#666',
    marginLeft: 8,
  },
  heartRate: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 8,
  },
  heartRateText: {
    fontSize: 14,
    color: '#666',
  },
  medTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 8,
    padding: 6,
    backgroundColor: '#e3f2fd',
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  medText: {
    fontSize: 12,
    color: '#1976d2',
  },
  symptomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 8,
  },
  symptomText: {
    fontSize: 14,
    color: '#f57c00',
  },
  armTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 8,
    padding: 6,
    backgroundColor: '#f3e5f5',
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  armText: {
    fontSize: 12,
    color: '#7b1fa2',
  },
  notesText: {
    fontSize: 14,
    color: '#666',
    marginTop: 8,
    fontStyle: 'italic',
  },
  bottomPadding: {
    height: 40,
  },
});

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
import { getReadingsStats } from '@/services/api';

export default function HistoryScreen() {
  const { readings, medications, deleteReading } = useAppStore();
  const [filter, setFilter] = useState('all');
  const [medicationFilter, setMedicationFilter] = useState('all');
  const [armFilter, setArmFilter] = useState('all');
  const [sortBy, setSortBy] = useState('date_desc');
  const [stats, setStats] = useState(null);
  const [showStats, setShowStats] = useState(false);

  const uniqueMedications = [...new Set(readings.map(r => r.medication_name).filter(Boolean))];
  const uniqueArms = [...new Set(readings.map(r => r.arm).filter(Boolean))];

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const result = await getReadingsStats();
        if (result.success) {
          setStats(result.data);
        }
      } catch (error) {
        console.error('Error fetching stats:', error);
      }
    };
    fetchStats();
  }, []);

  const filteredReadings = readings
    .filter((reading) => {
      if (filter === 'medicated') return reading.medication_used === 1;
      if (filter === 'high') return reading.systolic >= 140 || reading.diastolic >= 90;
      if (filter === 'normal') return reading.systolic < 120 && reading.diastolic < 80;
      return true;
    })
    .filter((reading) => {
      if (medicationFilter !== 'all') return reading.medication_name === medicationFilter;
      return true;
    })
    .filter((reading) => {
      if (armFilter !== 'all') return reading.arm === armFilter;
      return true;
    })
    .sort((a, b) => {
      if (sortBy === 'date_desc') return new Date(b.created_at) - new Date(a.created_at);
      if (sortBy === 'date_asc') return new Date(a.created_at) - new Date(b.created_at);
      if (sortBy === 'sys_desc') return b.systolic - a.systolic;
      if (sortBy === 'sys_asc') return a.systolic - b.systolic;
      if (sortBy === 'dia_desc') return b.diastolic - a.diastolic;
      if (sortBy === 'dia_asc') return a.diastolic - b.diastolic;
      return 0;
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
      {stats && (
        <View style={styles.statsContainer}>
          <TouchableOpacity style={styles.statsToggle} onPress={() => setShowStats(!showStats)}>
            <Ionicons name={showStats ? 'chevron-up' : 'chevron-down'} size={20} color="#333" />
            <Text style={styles.statsTitle}>Estatísticas</Text>
          </TouchableOpacity>
          {showStats && (
            <View style={styles.statsContent}>
              <View style={styles.statsRow}>
                <Text style={styles.statsLabel}>Total de medições:</Text>
                <Text style={styles.statsValue}>{stats.count}</Text>
              </View>
              <View style={styles.statsRow}>
                <Text style={styles.statsLabel}>PA Sistólica:</Text>
                <Text style={styles.statsValue}>
                  {stats.systolic.avg ? `${stats.systolic.avg} (mín ${stats.systolic.min}, máx ${stats.systolic.max})` : 'N/A'}
                </Text>
              </View>
              <View style={styles.statsRow}>
                <Text style={styles.statsLabel}>PA Diastólica:</Text>
                <Text style={styles.statsValue}>
                  {stats.diastolic.avg ? `${stats.diastolic.avg} (mín ${stats.diastolic.min}, máx ${stats.diastolic.max})` : 'N/A'}
                </Text>
              </View>
              <View style={styles.statsRow}>
                <Text style={styles.statsLabel}>Frequência Cardíaca:</Text>
                <Text style={styles.statsValue}>
                  {stats.heart_rate.avg ? `${stats.heart_rate.avg} (mín ${stats.heart_rate.min}, máx ${stats.heart_rate.max})` : 'N/A'}
                </Text>
              </View>
            </View>
          )}
        </View>
      )}

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterContainer} contentContainerStyle={styles.filterContent}>
        {['all', 'medicated', 'high', 'normal'].map((f) => (
          <TouchableOpacity
            key={f}
            style={[styles.filterButton, filter === f && styles.filterButtonActive]}
            onPress={() => setFilter(f)}
          >
            <Text style={[styles.filterText, filter === f && styles.filterTextActive]}>
              {f === 'all' ? 'Todas' : f === 'medicated' ? 'Medicada' : f === 'high' ? 'Pressão alta' : 'Normal'}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterContainer} contentContainerStyle={styles.filterContent}>
        {uniqueMedications.length > 0 ? (
          <>
            <TouchableOpacity
              style={[styles.filterButton, medicationFilter === 'all' && styles.filterButtonActive]}
              onPress={() => setMedicationFilter('all')}
            >
              <Text style={[styles.filterText, medicationFilter === 'all' && styles.filterTextActive]}>
                Todos os medicamentos
              </Text>
            </TouchableOpacity>
            {uniqueMedications.map((med) => (
              <TouchableOpacity
                key={med}
                style={[styles.filterButton, medicationFilter === med && styles.filterButtonActive]}
                onPress={() => setMedicationFilter(med)}
              >
                <Text style={[styles.filterText, medicationFilter === med && styles.filterTextActive]}>
                  {med}
                </Text>
              </TouchableOpacity>
            ))}
          </>
        ) : (
          <Text style={styles.filterText}>Nenhum medicamento registrado</Text>
        )}
      </ScrollView>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterContainer} contentContainerStyle={styles.filterContent}>
        {uniqueArms.length > 0 ? (
          <>
            <TouchableOpacity
              style={[styles.filterButton, armFilter === 'all' && styles.filterButtonActive]}
              onPress={() => setArmFilter('all')}
            >
              <Text style={[styles.filterText, armFilter === 'all' && styles.filterTextActive]}>
                Todos os braços
              </Text>
            </TouchableOpacity>
            {uniqueArms.map((arm) => (
              <TouchableOpacity
                key={arm}
                style={[styles.filterButton, armFilter === arm && styles.filterButtonActive]}
                onPress={() => setArmFilter(arm)}
              >
                <Text style={[styles.filterText, armFilter === arm && styles.filterTextActive]}>
                  {arm === 'left' ? 'Esquerdo' : arm === 'right' ? 'Direito' : arm}
                </Text>
              </TouchableOpacity>
            ))}
          </>
        ) : (
          <Text style={styles.filterText}>Nenhuma medição de braço registrada</Text>
        )}
      </ScrollView>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterContainer} contentContainerStyle={styles.filterContent}>
        {[
          { key: 'date_desc', label: 'Mais recentes' },
          { key: 'date_asc', label: 'Mais antigas' },
          { key: 'sys_desc', label: 'Sistólica ↓' },
          { key: 'sys_asc', label: 'Sistólica ↑' },
          { key: 'dia_desc', label: 'Diastólica ↓' },
          { key: 'dia_asc', label: 'Diastólica ↑' },
        ].map((option) => (
          <TouchableOpacity
            key={option.key}
            style={[styles.filterButton, sortBy === option.key && styles.filterButtonActive]}
            onPress={() => setSortBy(option.key)}
          >
            <Text style={[styles.filterText, sortBy === option.key && styles.filterTextActive]}>
              {option.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

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
  statsContainer: {
    backgroundColor: '#fff',
    margin: 12,
    borderRadius: 12,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  statsToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  statsContent: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  statsLabel: {
    fontSize: 14,
    color: '#666',
  },
  statsValue: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  filterContainer: {
    flexDirection: 'row',
    padding: 12,
    paddingBottom: 4,
  },
  filterContent: {
    paddingRight: 12,
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#e0e0e0',
    marginRight: 8,
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

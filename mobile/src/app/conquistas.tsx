import React from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

export default function ConquistasScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="trophy" size={24} color="#ff9800" />
            <Text style={styles.sectionTitle}>Em Breve</Text>
          </View>
          <Text style={styles.infoText}>
            As conquistas serão implementadas em uma atualização futura.
          </Text>
        </View>
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="star" size={24} color="#ffc107" />
            <Text style={styles.sectionTitle}>Medalhas por Vencência</Text>
          </View>
          <Text style={styles.infoText}>
            Ganhe medalhas ao manter seus registros de pressão em dia.
          </Text>
          <Text style={styles.infoText}>• Primeiro Registro — Registre sua primeira medição</Text>
          <Text style={styles.infoText}>• Sequência de 7 Dias — Meça sua pressão por 7 dias consecutivos</Text>
          <Text style={styles.infoText}>• Mestre do Registro — Registre 100 medições</Text>
          <Text style={styles.infoText}>• Controlador — Mantenha pressão normal por 30 dias</Text>
        </View>
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="flag" size={24} color="#4caf50" />
            <Text style={styles.sectionTitle}>Conquistas Especiais</Text>
          </View>
          <Text style={styles.infoText}>
            Conquistas especiais serão desbloqueadas conforme seu progresso.
          </Text>
          <Text style={styles.infoText}>• Desafio do Mês — Complete todos os desafios do mês</Text>
          <Text style={styles.infoText}>• Padrão Perfeito — 30 dias sem medições fora da faixa</Text>
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
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginLeft: 8,
  },
  infoText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 22,
    marginTop: 4,
  },
});

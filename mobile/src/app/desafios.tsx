import React from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

export default function DesafiosScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="flag" size={24} color="#2196f3" />
            <Text style={styles.sectionTitle}>Em Breve</Text>
          </View>
          <Text style={styles.infoText}>
            Desafios serão implementados em uma atualização futura.
          </Text>
        </View>
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="time" size={24} color="#ff9800" />
            <Text style={styles.sectionTitle}>Desafios Diários</Text>
          </View>
          <Text style={styles.infoText}>
            Complete tarefas simples para ganhar pontos.
          </Text>
          <Text style={styles.infoText}>• Meça sua pressão pela manhã — +10 pontos</Text>
          <Text style={styles.infoText}>• Meça sua pressão à noite — +10 pontos</Text>
          <Text style={styles.infoText}>• Registre seus sintomas — +5 pontos</Text>
          <Text style={styles.infoText}>• Anote notas sobre como se sente — +5 pontos</Text>
        </View>
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="people" size={24} color="#4caf50" />
            <Text style={styles.sectionTitle}>Desafios Sociais</Text>
          </View>
          <Text style={styles.infoText}>
            Desafios para completar com amigos e familiares.
          </Text>
          <Text style={styles.infoText}>• Desafie um amigo a registrar medições por 7 dias</Text>
          <Text style={styles.infoText}>• Compartilhe seu progresso na família</Text>
        </View>
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="trending-up" size={24} color="#e91e63" />
            <Text style={styles.sectionTitle}>Desafios de Progresso</Text>
          </View>
          <Text style={styles.infoText}>
            Meta de 30 dias de registros contínuos.
          </Text>
          <Text style={styles.infoText}>• Reduza variabilidade de pressão — Mantenha registros consistentes</Text>
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

import React from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

export default function RelatoriosScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="document-text" size={24} color="#2196f3" />
            <Text style={styles.sectionTitle}>Em Breve</Text>
          </View>
          <Text style={styles.infoText}>
            Os relatórios serão implementados em uma atualização futura.
          </Text>
        </View>
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="stats-chart" size={24} color="#ff9800" />
            <Text style={styles.sectionTitle}>Relatórios para o Médico</Text>
          </View>
          <Text style={styles.infoText}>
            Gere relatórios profissionais para compartilhar com seu médico.
          </Text>
          <Text style={styles.infoText}>• Relatório semanal com gráfico de pressão</Text>
          <Text style={styles.infoText}>• Relatório mensal com estatísticas detalhadas</Text>
          <Text style={styles.infoText}>• Exportar em PDF para imprimir ou enviar por email</Text>
          <Text style={styles.infoText}>• Médias de pressão por semana/mês</Text>
        </View>
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="trending-up" size={24} color="#4caf50" />
            <Text style={styles.sectionTitle}>Análise de Tendências</Text>
          </View>
          <Text style={styles.infoText}>
            Identifique padrões em seus registros de pressão arterial.
          </Text>
          <Text style={styles.infoText}>• Gráficos interativos de evolução</Text>
          <Text style={styles.infoText}>• Alertas de tendência de alta/baixa</Text>
        </View>
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="pie-chart" size={24} color="#9c27b0" />
            <Text style={styles.sectionTitle}>Estatísticas Pessoais</Text>
          </View>
          <Text style={styles.infoText}>
            Visualize seus dados de forma clara e objetiva.
          </Text>
          <Text style={styles.infoText}>• Percentil de pressão arterial</Text>
          <Text style={styles.infoText}>• Comparativo com recomendações da OMS</Text>
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

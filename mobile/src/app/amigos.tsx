import React from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

export default function AmigosScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="people" size={24} color="#4caf50" />
            <Text style={styles.sectionTitle}>Em Breve</Text>
          </View>
          <Text style={styles.infoText}>
            A rede social será implementada em uma atualização futura.
          </Text>
        </View>
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="person-add" size={24} color="#2196f3" />
            <Text style={styles.sectionTitle}>Conectar-se</Text>
          </View>
          <Text style={styles.infoText}>
            Convide amigos e familiares para se unirem à sua rede de apoio.
          </Text>
          <Text style={styles.infoText}>• Convide pessoas para acompanhar seu progresso</Text>
          <Text style={styles.infoText}>• Conecte-se com quem se importa com você</Text>
          <Text style={styles.infoText}>• Crie grupos familiares para monitoramento coletivo</Text>
        </View>
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="heart" size={24} color="#e91e63" />
            <Text style={styles.sectionTitle}>Apoio Social</Text>
          </View>
          <Text style={styles.infoText}>
            O apoio social é fundamental para criar o hábito de monitorar a pressão.
          </Text>
          <Text style={styles.infoText}>• Relembre o apoio de quem se importa</Text>
          <Text style={styles.infoText}>• Compartilhe conquistas com sua rede</Text>
        </View>
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="lock-closed" size={24} color="#666" />
            <Text style={styles.sectionTitle}>Privacidade</Text>
          </View>
          <Text style={styles.infoText}>
            Controle quem pode ver suas informações de saúde.
          </Text>
          <Text style={styles.infoText}>• Escolha quem pode ver seus registros</Text>
          <Text style={styles.infoText}>• Gerencie permissões de cada membro</Text>
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

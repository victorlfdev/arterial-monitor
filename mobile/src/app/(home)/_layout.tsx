import { Stack } from 'expo-router/stack';
import { useAppColors } from '@/theme/colors';

export default function HomeStackLayout() {
  const colors = useAppColors();

  return (
    <Stack
      screenOptions={{
        headerStyle: {
          backgroundColor: colors.headerBackgroundColor,
        },
        headerTintColor: colors.headerTintColor,
        headerTitleStyle: {
          fontWeight: '600' as const,
        },
      }}
    >
      <Stack.Screen
        name="index"
        options={{
          header: () => null,
        }}
      />
      <Stack.Screen
        name="history"
        options={{
          title: 'Histórico',
        }}
      />
      <Stack.Screen
        name="conquistas"
        options={{
          title: 'Conquistas',
        }}
      />
      <Stack.Screen
        name="desafios"
        options={{
          title: 'Desafios',
        }}
      />
      <Stack.Screen
        name="amigos"
        options={{
          title: 'Amigos',
        }}
      />
      <Stack.Screen
        name="relatorios"
        options={{
          title: 'Relatórios',
        }}
      />
      <Stack.Screen
        name="new-reading"
        options={{
          title: 'Nova Medição',
          presentation: 'modal',
        }}
      />
    </Stack>
  );
}

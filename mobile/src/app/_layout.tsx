import { Stack } from 'expo-router';
import { ThemeProvider, DarkTheme, DefaultTheme } from 'expo-router/react-navigation';
import { useColorScheme } from 'react-native';
import { initializeDB } from '@/services/localDB';
import { useEffect } from 'react';
import { requestPermissions } from '@/services/notifications';

initializeDB();

export default function RootLayout() {
  const colorScheme = useColorScheme();

  useEffect(() => {
    requestPermissions();
  }, []);

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack
        screenOptions={{
          headerStyle: {
            backgroundColor: colorScheme === 'dark' ? '#1a1a1a' : '#2196f3',
          },
          headerTintColor: '#fff',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
        }}
      >
        <Stack.Screen
          name="index"
          options={{
            title: 'Pressão Arterial',
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="new-reading"
          options={{
            title: 'Nova Medição',
            presentation: 'modal',
          }}
        />
        <Stack.Screen
          name="history"
          options={{
            title: 'Histórico',
          }}
        />
        <Stack.Screen
          name="settings"
          options={{
            title: 'Configurações',
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
      </Stack>
    </ThemeProvider>
  );
}

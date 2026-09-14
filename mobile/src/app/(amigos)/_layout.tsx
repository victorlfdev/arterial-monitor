import { Stack } from 'expo-router/stack';
import { useAppColors } from '@/theme/colors';

export default function AmigosLayout() {
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
          title: 'Amigos',
        }}
      />
    </Stack>
  );
}

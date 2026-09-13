import { Stack } from 'expo-router/stack';
import { Platform } from 'react-native';
import { Color } from 'expo-router';

export default function SettingsStackLayout() {
  const headerBg = Platform.select({
    ios: Color.ios.systemBackground,
    android: Color.android.dynamic.surface,
    default: '#ffffff',
  });

  const headerTint = Platform.select({
    ios: Color.ios.label,
    android: Color.android.dynamic.onSurface,
    default: '#000000',
  });

  return (
    <Stack
      screenOptions={{
        headerStyle: {
          backgroundColor: headerBg as string,
        },
        headerTintColor: headerTint as string,
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
    </Stack>
  );
}

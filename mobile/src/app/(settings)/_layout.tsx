import { Stack } from 'expo-router/stack';
import { Platform } from 'react-native';
import { Color } from 'expo-router';

export default function SettingsStackLayout() {
  const headerBg = Platform.select({
    ios: Color.ios.systemBlue,
    android: Color.android.dynamic.primary,
    default: '#007aff',
  });

  return (
    <Stack
      screenOptions={{
        headerStyle: {
          backgroundColor: headerBg as string,
        },
        headerTintColor: '#fff',
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

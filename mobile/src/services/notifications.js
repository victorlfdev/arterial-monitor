import { Platform } from 'react-native';

export async function requestPermissions() {
  try {
    const Notifications = await import('expo-notifications');
    const { status } = await Notifications.requestPermissionsAsync();
    return status === 'granted';
  } catch {
    return false;
  }
}

export async function scheduleDailyAlarm(hour, minute, identifier) {
  try {
    const Notifications = await import('expo-notifications');
    const today = new Date();
    const scheduled = new Date(today);
    scheduled.setHours(hour, minute, 0, 0);

    if (scheduled < today) {
      scheduled.setDate(scheduled.getDate() + 1);
    }

    await Notifications.scheduleNotificationAsync({
      content: {
        title: '⏰ Hora da medição!',
        body: 'Registre sua pressão arterial no app',
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.EVERY_DAY,
        hour,
        minute,
      },
      identifier,
    });
  } catch {
    console.log('Notificações não disponíveis no Expo Go');
  }
}

export async function cancelAlarm(identifier) {
  try {
    const Notifications = await import('expo-notifications');
    await Notifications.cancelNotificationAsync(identifier);
  } catch {
    console.log('Notificações não disponíveis no Expo Go');
  }
}

export async function cancelAllAlarms() {
  try {
    const Notifications = await import('expo-notifications');
    await Notifications.cancelAllScheduledNotificationsAsync();
  } catch {
    console.log('Notificações não disponíveis no Expo Go');
  }
}

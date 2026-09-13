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

    const triggerConfig = {
      hour,
      minute,
    };

    if (Notifications.SchedulableTriggerInputTypes?.EVERY_DAY) {
      triggerConfig.type = Notifications.SchedulableTriggerInputTypes.EVERY_DAY;
    } else {
      triggerConfig.type = 'second';
      triggerConfig.seconds = 86400;
    }

    await Notifications.scheduleNotificationAsync({
      content: {
        title: '⏰ Hora da medição!',
        body: 'Registre sua pressão arterial no app',
      },
      trigger: triggerConfig,
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

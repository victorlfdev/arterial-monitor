import { getUnsyncedReadings, syncToLocal, markSynced } from './localDB';
import { getReadings, createReading } from './api';
import AsyncStorage from '@react-native-async-storage/async-storage';

const LAST_SYNC_KEY = '@pressao_arterial_last_sync';

export async function syncUp() {
  try {
    const unsynced = await getUnsyncedReadings();

    for (const reading of unsynced) {
      const { id: localId, ...data } = reading;

      const result = await createReading(data);

      if (result.success && result.data) {
        await markSynced(localId, result.data.id);
      }
    }

    return { success: true, count: unsynced.length };
  } catch (error) {
    console.error('Sync up error:', error);
    return { success: false, error };
  }
}

export async function syncDown() {
  try {
    const lastSync = await AsyncStorage.getItem(LAST_SYNC_KEY);
    const result = await getReadings(lastSync || undefined);

    if (result.success && result.data.length > 0) {
      await syncToLocal(result.data);
      await AsyncStorage.setItem(LAST_SYNC_KEY, new Date().toISOString());
    }

    return { success: true, count: result.data.length };
  } catch (error) {
    console.error('Sync down error:', error);
    return { success: false, error };
  }
}

export async function fullSync() {
  const results = { up: null, down: null };

  try {
    results.up = await syncUp();
  } catch (error) {
    console.error('fullSync up error:', error);
    results.up = { success: false, error };
  }

  try {
    results.down = await syncDown();
  } catch (error) {
    console.error('fullSync down error:', error);
    results.down = { success: false, error };
  }

  return results;
}

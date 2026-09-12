import { create } from 'zustand';
import { getReadings, getMedications } from '../services/api';
import { getAllReadings, saveReading } from '../services/localDB';

const useAppStore = create((set, get) => ({
  readings: [],
  medications: [],
  loading: false,
  syncing: false,
  isConnected: true,
  lastSync: null,

  fetchReadings: async () => {
    set({ loading: true });
    try {
      const { checkHealth } = await import('@/services/api');
      const isConnected = await checkHealth();
      set({ isConnected });

      if (isConnected) {
        const serverResult = await getReadings(undefined, 1000);
        if (serverResult.success && serverResult.data.length > 0) {
          const { deleteLocalReadingByServerId } = await import('@/services/localDB');
          const localReadings = await getAllReadings();
          const localServerIds = new Map();
          localReadings.forEach(r => {
            if (r.server_id) localServerIds.set(String(r.server_id), r.id);
          });

          for (const serverReading of serverResult.data) {
            const localId = localServerIds.get(String(serverReading.id));
            if (localId) {
              await saveReading({ id: localId, server_id: serverReading.id, ...serverReading, updated_at: new Date().toISOString(), synced_at: null });
            } else {
              const now = new Date().toISOString();
              await saveReading({ server_id: serverReading.id, ...serverReading, created_at: serverReading.created_at || now, synced_at: now });
            }
          }

          for (const localServerId of localServerIds.keys()) {
            if (!serverResult.data.find(r => String(r.id) === localServerId)) {
              try {
                await deleteLocalReadingByServerId(parseInt(localServerId));
              } catch (e) {}
            }
          }

          const finalLocal = await getAllReadings();
          const unique = [];
          const seen = new Set();
          for (const r of finalLocal) {
            const key = r.server_id ? String(r.server_id) : String(r.id);
            if (!seen.has(key)) {
              seen.add(key);
              unique.push(r);
            }
          }
          set({ readings: unique, loading: false });
          return;
        }
      }

      const local = await getAllReadings();
      const unique = [];
      const seen = new Set();
      for (const r of local) {
        const key = r.server_id ? String(r.server_id) : String(r.id);
        if (!seen.has(key)) {
          seen.add(key);
          unique.push(r);
        }
      }
      set({ readings: unique, loading: false });
    } catch (error) {
      console.error('Error fetching readings:', error);
      set({ loading: false });
    }
  },

  fetchMedications: async () => {
    try {
      const result = await getMedications();
      if (result.success) {
        set({ medications: result.data });
      }
    } catch (error) {
      console.error('Error fetching medications:', error);
    }
  },

  addReading: async (reading) => {
    const now = new Date().toISOString();
    try {
      const localId = await saveReading(reading);
      const newReading = { ...reading, id: localId, server_id: null, created_at: now, synced_at: null };
      const current = get().readings;
      set({
        readings: [newReading, ...current],
      });
      return localId;
    } catch (error) {
      console.error('addReading error:', error);
      const newReading = { ...reading, created_at: now, synced_at: null };
      const current = get().readings;
      set({
        readings: [newReading, ...current],
      });
      return null;
    }
  },

  updateReading: async (id, updates) => {
    const current = get().readings;
    const updatedReading = current.find(r => r.id === id);
    if (updatedReading) {
      const updated = { ...updatedReading, ...updates, synced_at: null };
      await saveReading({ id, ...updates, synced_at: null });
      set({
        readings: current.map(r => r.id === id ? updated : r),
      });
    }
  },

  deleteReading: (id) => {
    const current = get().readings;
    set({
      readings: current.filter(r => r.id !== id),
    });
  },

  setSyncing: (syncing) => {
    set({ syncing });
  },

  setLastSync: (timestamp) => {
    set({ lastSync: timestamp });
  },
}));

export default useAppStore;

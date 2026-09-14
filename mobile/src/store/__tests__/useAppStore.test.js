'use strict';

// Mock services before importing the store
jest.mock('@/services/api', () => ({
  checkHealth: jest.fn(() => Promise.resolve(true)),
  getReadings: jest.fn(() => Promise.resolve({ success: true, data: [] })),
  createReading: jest.fn(() => Promise.resolve({ success: true, data: { id: 1 } })),
  updateReading: jest.fn(() => Promise.resolve({ success: true, data: { id: 1 } })),
  deleteReading: jest.fn(() => Promise.resolve({ success: true })),
  getReadingsStats: jest.fn(() => Promise.resolve({ success: true, data: {} })),
  getMedications: jest.fn(() => Promise.resolve({ success: true, data: [] })),
}));

jest.mock('@/services/localDB', () => ({
  getAllReadings: jest.fn(() => Promise.resolve([])),
  deleteLocalReading: jest.fn(() => Promise.resolve()),
  deleteLocalReadingByServerId: jest.fn(() => Promise.resolve()),
  saveReading: jest.fn(() => Promise.resolve(1)),
  markSynced: jest.fn(() => Promise.resolve()),
  getUnsyncedReadings: jest.fn(() => Promise.resolve([])),
}));

// Now import the store
const useAppStore = require('../useAppStore').default;
const localDB = require('@/services/localDB');
const api = require('@/services/api');

describe('useAppStore', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localDB.saveReading.mockResolvedValue(1);
    // Reset store to initial state
    useAppStore.setState({
      readings: [],
      medications: [],
      loading: false,
      syncing: false,
      isConnected: true,
      lastSync: null,
    });
  });

  describe('initial state', () => {
    it('has correct default values', () => {
      const state = useAppStore.getState();
      expect(state.readings).toEqual([]);
      expect(state.medications).toEqual([]);
      expect(state.loading).toBe(false);
      expect(state.syncing).toBe(false);
      expect(state.isConnected).toBe(true);
      expect(state.lastSync).toBeNull();
    });
  });

  describe('deleteReading', () => {
    it('removes reading by id', () => {
      useAppStore.setState({
        readings: [
          { id: 1, systolic: 120, diastolic: 80 },
          { id: 2, systolic: 130, diastolic: 85 },
        ],
      });

      useAppStore.getState().deleteReading(1);

      const state = useAppStore.getState();
      expect(state.readings).toHaveLength(1);
      expect(state.readings[0].id).toBe(2);
    });

    it('does nothing for non-existent id', () => {
      useAppStore.setState({
        readings: [{ id: 1, systolic: 120, diastolic: 80 }],
      });

      useAppStore.getState().deleteReading(999);

      const state = useAppStore.getState();
      expect(state.readings).toHaveLength(1);
    });
  });

  describe('addReading', () => {
    it('adds reading to state', async () => {
      await useAppStore.getState().addReading({ systolic: 120, diastolic: 80, heartRate: 70 });

      const state = useAppStore.getState();
      expect(state.readings).toHaveLength(1);
      expect(state.readings[0].systolic).toBe(120);
      expect(state.readings[0].diastolic).toBe(80);
    });
  });

  describe('setSyncing', () => {
    it('sets syncing state', () => {
      const state1 = useAppStore.getState();
      expect(state1.syncing).toBe(false);

      useAppStore.getState().setSyncing(true);
      const state2 = useAppStore.getState();
      expect(state2.syncing).toBe(true);

      useAppStore.getState().setSyncing(false);
      const state3 = useAppStore.getState();
      expect(state3.syncing).toBe(false);
    });
  });

  describe('setLastSync', () => {
    it('sets lastSync timestamp', () => {
      const now = new Date().toISOString();
      useAppStore.getState().setLastSync(now);

      const state = useAppStore.getState();
      expect(state.lastSync).toBe(now);
    });
  });
});

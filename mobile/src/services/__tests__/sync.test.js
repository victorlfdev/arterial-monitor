'use strict';

jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(() => Promise.resolve(null)),
  setItem: jest.fn(() => Promise.resolve()),
  removeItem: jest.fn(() => Promise.resolve()),
}));

jest.mock('../../constants/server', () => ({
  getServerUrl: jest.fn(() => Promise.resolve('http://localhost:3001')),
  setServerUrl: jest.fn(() => Promise.resolve('http://localhost:3001')),
  resetServerUrl: jest.fn(() => Promise.resolve('http://localhost:3001')),
  DEFAULT_SERVER_URL: 'http://localhost:3001',
}));

jest.mock('../localDB', () => ({
  getUnsyncedReadings: jest.fn(),
  getUnsyncedMedications: jest.fn(),
  getAllReadings: jest.fn(),
  markSynced: jest.fn(),
  saveReading: jest.fn(),
  deleteLocalReadingByServerId: jest.fn(),
  syncToLocal: jest.fn(),
}));

jest.mock('../api', () => ({
  createReading: jest.fn(),
  createMedication: jest.fn(),
  getReadings: jest.fn(),
  getMedications: jest.fn(),
}));

const localDB = require('../localDB');
const api = require('../api');
const { syncUp, syncDown, fullSync } = require('../sync');

describe('sync.js', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('syncUp', () => {
    it('uploads unsynced readings to server', async () => {
      const unsyncedReadings = [
        { id: 1, systolic: 120, diastolic: 80 },
        { id: 2, systolic: 130, diastolic: 85 },
      ];

      localDB.getUnsyncedReadings.mockResolvedValue(unsyncedReadings);
      api.createReading.mockResolvedValue({ success: true, data: { id: 101 } });
      localDB.markSynced.mockResolvedValue(undefined);

      const result = await syncUp();

      expect(localDB.getUnsyncedReadings).toHaveBeenCalled();
      expect(api.createReading).toHaveBeenCalledWith(
        expect.objectContaining({ systolic: 120, diastolic: 80 })
      );
      expect(api.createReading).toHaveBeenCalledWith(
        expect.objectContaining({ systolic: 130, diastolic: 85 })
      );
      expect(localDB.markSynced).toHaveBeenCalledWith(1, 101);
      expect(result.success).toBe(true);
      expect(result.count).toBe(2);
    });

    it('returns error when upload fails', async () => {
      localDB.getUnsyncedReadings.mockResolvedValue([{ id: 1, systolic: 120 }]);
      api.createReading.mockRejectedValue(new Error('Network error'));

      const result = await syncUp();

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });
  });

  describe('syncDown', () => {
    it('downloads readings from server', async () => {
      api.getReadings.mockResolvedValue({
        success: true,
        data: [{ id: 101, systolic: 120, diastolic: 80 }],
      });
      localDB.syncToLocal.mockResolvedValue(undefined);

      const result = await syncDown();

      expect(api.getReadings).toHaveBeenCalled();
      expect(localDB.syncToLocal).toHaveBeenCalled();
      expect(result.success).toBe(true);
    });
  });

  describe('fullSync', () => {
    it('performs both syncUp and syncDown', async () => {
      localDB.getUnsyncedReadings.mockResolvedValue([]);
      api.getReadings.mockResolvedValue({ success: true, data: [] });
      localDB.syncToLocal.mockResolvedValue(undefined);

      const result = await fullSync();

      expect(result).toBeDefined();
    });
  });
});

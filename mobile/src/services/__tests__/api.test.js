'use strict';

jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(() => Promise.resolve(null)),
  setItem: jest.fn(() => Promise.resolve()),
  removeItem: jest.fn(() => Promise.resolve()),
}));

jest.mock('../../constants/server', () => ({
  getServerUrl: jest.fn(() => Promise.resolve('http://example.com')),
  setServerUrl: jest.fn(() => Promise.resolve('http://example.com')),
  resetServerUrl: jest.fn(() => Promise.resolve('http://example.com')),
  DEFAULT_SERVER_URL: 'http://example.com',
}));

describe('api.js', () => {
  const mockFetch = jest.fn();
  let originalFetch;

  beforeAll(() => {
    originalFetch = global.fetch;
  });

  beforeEach(() => {
    mockFetch.mockImplementation(() =>
      Promise.resolve({ json: () => Promise.resolve({ success: true, data: [] }) })
    );
    global.fetch = mockFetch;
  });

  afterAll(() => {
    global.fetch = originalFetch;
  });

  describe('getReadings', () => {
    it('builds URL with limit parameter', async () => {
      const { getReadings } = require('../api');
      await getReadings(undefined, 50);

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('limit=50'),
        expect.anything()
      );
    });

    it('includes since parameter', async () => {
      const { getReadings } = require('../api');
      await getReadings('2024-01-01', 100);

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('since=2024-01-01'),
        expect.anything()
      );
    });
  });

  describe('getReadingsStats', () => {
    it('calls stats endpoint', async () => {
      const { getReadingsStats } = require('../api');
      await getReadingsStats();

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/readings/stats'),
        expect.anything()
      );
    });
  });

  describe('getReading', () => {
    it('fetches single reading by id', async () => {
      mockFetch.mockImplementation(() =>
        Promise.resolve({ json: () => Promise.resolve({ success: true, data: { id: 1 } }) })
      );
      const { getReading } = require('../api');
      const result = await getReading(1);

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/readings/1'),
        expect.anything()
      );
      expect(result.success).toBe(true);
    });
  });

  describe('createReading', () => {
    it('sends POST with body', async () => {
      mockFetch.mockImplementation(() =>
        Promise.resolve({ json: () => Promise.resolve({ success: true, data: { id: 1 } }) })
      );
      const { createReading } = require('../api');
      await createReading({ systolic: 120, diastolic: 80 });

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/readings'),
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({ systolic: 120, diastolic: 80 }),
        })
      );
    });
  });

  describe('updateReading', () => {
    it('sends PUT with body', async () => {
      mockFetch.mockImplementation(() =>
        Promise.resolve({ json: () => Promise.resolve({ success: true, data: { id: 1 } }) })
      );
      const { updateReading } = require('../api');
      await updateReading(1, { systolic: 130 });

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/readings/1'),
        expect.objectContaining({
          method: 'PUT',
          body: JSON.stringify({ systolic: 130 }),
        })
      );
    });
  });

  describe('deleteReading', () => {
    it('sends DELETE', async () => {
      mockFetch.mockImplementation(() =>
        Promise.resolve({ json: () => Promise.resolve({ success: true }) })
      );
      const { deleteReading } = require('../api');
      await deleteReading(1);

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/readings/1'),
        expect.objectContaining({ method: 'DELETE' })
      );
    });
  });

  describe('getMedications', () => {
    it('fetches medications list', async () => {
      const { getMedications } = require('../api');
      await getMedications();

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/medications'),
        expect.anything()
      );
    });
  });

  describe('createMedication', () => {
    it('sends POST with name', async () => {
      mockFetch.mockImplementation(() =>
        Promise.resolve({ json: () => Promise.resolve({ success: true, data: { id: 1, name: 'Test' } }) })
      );
      const { createMedication } = require('../api');
      await createMedication('Test');

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/medications'),
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({ name: 'Test' }),
        })
      );
    });
  });

  describe('updateMedication', () => {
    it('sends PUT with name', async () => {
      mockFetch.mockImplementation(() =>
        Promise.resolve({ json: () => Promise.resolve({ success: true, data: { id: 1, name: 'New' } }) })
      );
      const { updateMedication } = require('../api');
      await updateMedication(1, 'New');

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/medications/1'),
        expect.objectContaining({
          method: 'PUT',
          body: JSON.stringify({ name: 'New' }),
        })
      );
    });
  });

  describe('deleteMedication', () => {
    it('sends DELETE', async () => {
      mockFetch.mockImplementation(() =>
        Promise.resolve({ json: () => Promise.resolve({ success: true }) })
      );
      const { deleteMedication } = require('../api');
      await deleteMedication(1);

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/medications/1'),
        expect.objectContaining({ method: 'DELETE' })
      );
    });
  });

  describe('checkHealth', () => {
    it('returns true when health is ok', async () => {
      mockFetch.mockImplementation(() =>
        Promise.resolve({ json: () => Promise.resolve({ status: 'ok' }) })
      );
      const { checkHealth } = require('../api');
      const result = await checkHealth();
      expect(result).toBe(true);
    });

    it('returns false when health is not ok', async () => {
      mockFetch.mockImplementation(() =>
        Promise.resolve({ json: () => Promise.resolve({ status: 'error' }) })
      );
      const { checkHealth } = require('../api');
      const result = await checkHealth();
      expect(result).toBe(false);
    });

    it('returns false when fetch fails', async () => {
      mockFetch.mockImplementation(() => Promise.reject(new Error('Network error')));
      const { checkHealth } = require('../api');
      const result = await checkHealth();
      expect(result).toBe(false);
    });
  });
});

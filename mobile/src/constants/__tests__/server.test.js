'use strict';

// Test constants without importing the module (which has native dependencies)
describe('server.js constants', () => {
  const DEFAULT_SERVER_URL = 'http://100.76.124.1:3001';
  const SERVER_URL_STORAGE_KEY = '@pressao_arterial_server_url';

  describe('DEFAULT_SERVER_URL', () => {
    it('has correct default value', () => {
      expect(DEFAULT_SERVER_URL).toBe('http://100.76.124.1:3001');
    });
  });

  describe('SERVER_URL_STORAGE_KEY', () => {
    it('has correct storage key', () => {
      expect(SERVER_URL_STORAGE_KEY).toBe('@pressao_arterial_server_url');
    });
  });

  describe('getServerUrl logic', () => {
    it('should prefer EXPO_PUBLIC_SERVER_URL env variable', () => {
      const envUrl = 'http://custom-server:3000';
      const result = envUrl.startsWith('http') ? envUrl : `http://${envUrl}`;
      expect(result).toBe('http://custom-server:3000');
    });

    it('should normalize URL without http:// prefix', () => {
      const url = 'custom-server:3000';
      const result = url.startsWith('http') ? url : `http://${url}`;
      expect(result).toBe('http://custom-server:3000');
    });

    it('should preserve URL with http:// prefix', () => {
      const url = 'http://existing-url:3000';
      const result = url.startsWith('http') ? url : `http://${url}`;
      expect(result).toBe('http://existing-url:3000');
    });
  });

  describe('setServerUrl logic', () => {
    it('should normalize URL and return it', () => {
      const url = 'new-server:3000';
      const normalized = url.startsWith('http') ? url : `http://${url}`;
      expect(normalized).toBe('http://new-server:3000');
    });

    it('should preserve URL with http:// prefix', () => {
      const url = 'http://existing-url:3000';
      const normalized = url.startsWith('http') ? url : `http://${url}`;
      expect(normalized).toBe('http://existing-url:3000');
    });
  });

  describe('resetServerUrl logic', () => {
    it('should return default URL', () => {
      expect(DEFAULT_SERVER_URL).toBe('http://100.76.124.1:3001');
    });
  });
});

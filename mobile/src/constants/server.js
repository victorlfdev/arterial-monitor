import AsyncStorage from '@react-native-async-storage/async-storage';

const SERVER_URL_STORAGE_KEY = '@pressao_arterial_server_url';
const DEFAULT_SERVER_URL = 'http://100.109.39.19:3001';

export async function getServerUrl() {
  const savedUrl = process.env.EXPO_PUBLIC_SERVER_URL
    ? `http://${process.env.EXPO_PUBLIC_SERVER_URL}`
    : await AsyncStorage.getItem(SERVER_URL_STORAGE_KEY);

  return savedUrl || DEFAULT_SERVER_URL;
}

export async function setServerUrl(url) {
  const normalizedUrl = url.startsWith('http') ? url : `http://${url}`;
  await AsyncStorage.setItem(SERVER_URL_STORAGE_KEY, normalizedUrl);
  return normalizedUrl;
}

export async function resetServerUrl() {
  await AsyncStorage.removeItem(SERVER_URL_STORAGE_KEY);
  return DEFAULT_SERVER_URL;
}

export { DEFAULT_SERVER_URL };

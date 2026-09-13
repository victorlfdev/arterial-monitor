import { getServerUrl } from '../constants/server';

async function fetchAPI(endpoint, options = {}) {
  const url = `${await getServerUrl()}/api${endpoint}`;

  const defaultOptions = {
    headers: {
      'Content-Type': 'application/json',
    },
  };

  if (options.body) {
    options.body = JSON.stringify(options.body);
  }

  try {
    const response = await fetch(url, { ...defaultOptions, ...options });
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
}

export async function getReadings(since, limit = 100) {
  const params = new URLSearchParams({ limit });
  if (since) params.append('since', since);

  return fetchAPI(`/readings?${params.toString()}`);
}

export async function getReading(id) {
  return fetchAPI(`/readings/${id}`);
}

export async function createReading(reading) {
  return fetchAPI('/readings', {
    method: 'POST',
    body: reading,
  });
}

export async function updateReading(id, reading) {
  return fetchAPI(`/readings/${id}`, {
    method: 'PUT',
    body: reading,
  });
}

export async function deleteReading(id) {
  return fetchAPI(`/readings/${id}`, {
    method: 'DELETE',
  });
}

export async function getMedications() {
  return fetchAPI('/medications');
}

export async function createMedication(name) {
  return fetchAPI('/medications', {
    method: 'POST',
    body: { name },
  });
}

export async function updateMedication(id, name) {
  return fetchAPI(`/medications/${id}`, {
    method: 'PUT',
    body: { name },
  });
}

export async function deleteMedication(id) {
  return fetchAPI(`/medications/${id}`, {
    method: 'DELETE',
  });
}

export async function checkHealth() {
  try {
    const response = await fetch(`${await getServerUrl()}/health`);
    const data = await response.json();
    return data.status === 'ok';
  } catch (error) {
    return false;
  }
}

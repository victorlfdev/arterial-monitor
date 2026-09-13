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

export async function getReadings(since, limit = 100, filters = {}) {
  const params = new URLSearchParams({ limit: String(limit) });
  if (since) params.append('since', since);
  if (filters.medication_name) params.append('medication_name', filters.medication_name);
  if (filters.arm) params.append('arm', filters.arm);
  if (filters.date_from) params.append('date_from', filters.date_from);
  if (filters.date_to) params.append('date_to', filters.date_to);
  if (filters.pressure_order) params.append('pressure_order', filters.pressure_order);

  return fetchAPI(`/readings?${params.toString()}`);
}

export async function getReadingsStats(filters = {}) {
  const params = new URLSearchParams();
  if (filters.date_from) params.append('date_from', filters.date_from);
  if (filters.date_to) params.append('date_to', filters.date_to);

  const queryString = params.toString();
  return fetchAPI(`/readings/stats${queryString ? `?${queryString}` : ''}`);
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
  } catch {
    return false;
  }
}

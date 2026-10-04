import {
  WaterQualityParams, PredictionResponse, StationItem,
  TrendsResponse, AlertItem, DemoScenario
} from '../types';

// Dynamic API base URL: Reads VITE_API_URL if defined (e.g. https://hydroguard-api.onrender.com),
// otherwise falls back to relative '/api' (for local Vite proxy or unified static serving).
// Robust against whether the user enters a trailing slash or appends '/api' in Vercel settings.
const RAW_ENV_URL = (import.meta.env.VITE_API_URL || '').trim().replace(/\/+$/, '');
const API_BASE = RAW_ENV_URL 
  ? (RAW_ENV_URL.endsWith('/api') ? RAW_ENV_URL : `${RAW_ENV_URL}/api`)
  : '/api';

export async function predictWaterQuality(
  params: WaterQualityParams,
  location: string = 'Sample River'
): Promise<PredictionResponse> {
  try {
    const res = await fetch(`${API_BASE}/predict`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...params, location })
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: 'Prediction failed' }));
      throw new Error(err.detail || `Prediction failed with HTTP ${res.status}`);
    }
    return res.json();
  } catch (err: any) {
    if (err.message && err.message.includes('Failed to fetch')) {
      throw new Error('Unable to connect to the prediction backend service. Please check your internet connection or verify the backend server is running.');
    }
    throw err;
  }
}

export async function fetchStations(): Promise<StationItem[]> {
  try {
    const res = await fetch(`${API_BASE}/stations`);
    if (!res.ok) {
      throw new Error(`Failed to load monitoring stations (HTTP ${res.status})`);
    }
    return res.json();
  } catch (err: any) {
    console.warn('Backend stations fetch warning:', err);
    throw err;
  }
}

export async function fetchTrends(
  location: string,
  range: '7d' | '30d' | '90d' = '30d'
): Promise<TrendsResponse> {
  const res = await fetch(`${API_BASE}/trends/${encodeURIComponent(location)}?range=${range}`);
  if (!res.ok) {
    throw new Error(`Failed to load trends for ${location} (HTTP ${res.status})`);
  }
  return res.json();
}

export async function fetchAlerts(): Promise<AlertItem[]> {
  const res = await fetch(`${API_BASE}/alerts`);
  if (!res.ok) {
    throw new Error(`Failed to load alerts (HTTP ${res.status})`);
  }
  return res.json();
}

export async function fetchScenarios(): Promise<DemoScenario[]> {
  const res = await fetch(`${API_BASE}/scenarios`);
  if (!res.ok) {
    throw new Error(`Failed to load demo scenarios (HTTP ${res.status})`);
  }
  return res.json();
}

export async function simulateStreamStep(stationId: string = 'cauvery'): Promise<PredictionResponse & { stream_reading: WaterQualityParams }> {
  const res = await fetch(`${API_BASE}/simulate-stream?station_id=${stationId}`, {
    method: 'POST'
  });
  if (!res.ok) {
    throw new Error(`Failed to simulate stream step (HTTP ${res.status})`);
  }
  return res.json();
}

export async function checkBackendHealth(): Promise<{ status: string; version: string; metrics: any }> {
  const res = await fetch(`${API_BASE}/health`);
  if (!res.ok) {
    throw new Error(`Backend health check failed (HTTP ${res.status})`);
  }
  return res.json();
}

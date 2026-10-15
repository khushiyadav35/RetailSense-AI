import {
  OverviewData,
  ForecastResponse,
  SegmentationResponse,
  AnomalyResponse
} from './types';

const API_BASE = '/api';

export async function fetchHealth(): Promise<{ status: string; records_count: number }> {
  const res = await fetch(`${API_BASE}/health`);
  if (!res.ok) throw new Error('Failed to fetch health status');
  return res.json();
}

export async function fetchOverview(): Promise<OverviewData> {
  const res = await fetch(`${API_BASE}/overview`);
  if (!res.ok) throw new Error('Failed to fetch overview metrics');
  return res.json();
}

export async function fetchForecast(params: {
  horizon_days: number;
  granularity: string;
  category: string;
  price_change_pct: number;
  marketing_boost_pct: number;
}): Promise<ForecastResponse> {
  const res = await fetch(`${API_BASE}/forecast`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.detail || 'Failed to fetch demand forecast');
  }
  return res.json();
}

export async function fetchCustomers(): Promise<SegmentationResponse> {
  const res = await fetch(`${API_BASE}/customers`);
  if (!res.ok) throw new Error('Failed to fetch customer segmentation data');
  return res.json();
}

export async function fetchAnomalies(): Promise<AnomalyResponse> {
  const res = await fetch(`${API_BASE}/anomalies`);
  if (!res.ok) throw new Error('Failed to fetch anomaly analytics');
  return res.json();
}

export async function sendChatMessage(message: string): Promise<{ reply: string }> {
  const res = await fetch(`${API_BASE}/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message }),
  });
  if (!res.ok) throw new Error('Failed to send AI chat message');
  return res.json();
}

export async function loadSampleData(): Promise<{ success: boolean; rows_count: number }> {
  const res = await fetch(`${API_BASE}/load-sample`, { method: 'POST' });
  if (!res.ok) throw new Error('Failed to load sample dataset');
  return res.json();
}

export async function uploadDataset(file: File): Promise<any> {
  const formData = new FormData();
  formData.append('file', file);
  const res = await fetch(`${API_BASE}/upload`, {
    method: 'POST',
    body: formData,
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.detail || 'Upload failed');
  }
  return res.json();
}

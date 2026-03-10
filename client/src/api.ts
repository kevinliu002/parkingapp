import type { ParkingSpot, CreateSpotPayload, PublicParkingSpot } from './types';

const BASE = '/api';

export async function getSpots(): Promise<ParkingSpot[]> {
  const res = await fetch(`${BASE}/spots`);
  if (!res.ok) throw new Error('Failed to fetch spots');
  return res.json();
}

export async function createSpot(payload: CreateSpotPayload): Promise<ParkingSpot> {
  const res = await fetch(`${BASE}/spots`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error('Failed to create spot');
  return res.json();
}

export async function updateSpot(
  id: number,
  payload: Partial<Pick<ParkingSpot, 'name' | 'address' | 'notes' | 'is_paid' | 'price'>>
): Promise<ParkingSpot> {
  const res = await fetch(`${BASE}/spots/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error('Failed to update spot');
  return res.json();
}

export async function deleteSpot(id: number): Promise<void> {
  const res = await fetch(`${BASE}/spots/${id}`, { method: 'DELETE' });
  if (!res.ok) throw new Error('Failed to delete spot');
}

function withTimeout(ms: number): AbortSignal {
  return AbortSignal.timeout(ms);
}

export async function reverseGeocode(lat: number, lng: number): Promise<string> {
  try {
    const res = await fetch(`${BASE}/geocode?lat=${lat}&lng=${lng}`, { signal: withTimeout(6000) });
    if (!res.ok) return '';
    const data = await res.json() as { address: string };
    return data.address ?? '';
  } catch {
    return '';
  }
}

export async function forwardGeocode(query: string): Promise<{ lat: number; lng: number; address: string } | null> {
  try {
    const res = await fetch(`${BASE}/geocode/search?q=${encodeURIComponent(query)}`, { signal: withTimeout(6000) });
    if (!res.ok) return null;
    return res.json() as Promise<{ lat: number; lng: number; address: string }>;
  } catch {
    return null;
  }
}

export async function getSuggestions(query: string): Promise<Array<{ lat: number; lng: number; address: string }>> {
  try {
    const res = await fetch(`${BASE}/geocode/search?q=${encodeURIComponent(query)}&limit=5`, { signal: withTimeout(6000) });
    if (!res.ok) return [];
    return res.json() as Promise<Array<{ lat: number; lng: number; address: string }>>;
  } catch {
    return [];
  }
}

export async function getNearbyPublicParking(lat: number, lng: number, radius = 1500): Promise<PublicParkingSpot[]> {
  try {
    const res = await fetch(`${BASE}/osm/parking?lat=${lat}&lng=${lng}&radius=${radius}`, { signal: withTimeout(20000) });
    if (!res.ok) return [];
    return res.json() as Promise<PublicParkingSpot[]>;
  } catch {
    return [];
  }
}

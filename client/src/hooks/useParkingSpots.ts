import { useState, useEffect, useCallback } from 'react';
import type { ParkingSpot, CreateSpotPayload } from '../types';
import { getSpots, createSpot, deleteSpot as apiDeleteSpot, updateSpot as apiUpdateSpot } from '../api';

interface PendingPin {
  lat: number;
  lng: number;
}

export function useParkingSpots() {
  const [spots, setSpots] = useState<ParkingSpot[]>([]);
  const [pendingPin, setPendingPin] = useState<PendingPin | null>(null);
  const [selectedSpotId, setSelectedSpotId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getSpots()
      .then(setSpots)
      .finally(() => setLoading(false));
  }, []);

  const addSpot = useCallback(async (payload: CreateSpotPayload) => {
    const spot = await createSpot(payload);
    setSpots((prev) => [spot, ...prev]);
    setPendingPin(null);
    setSelectedSpotId(spot.id);
    return spot;
  }, []);

  const removeSpot = useCallback(async (id: number) => {
    await apiDeleteSpot(id);
    setSpots((prev) => prev.filter((s) => s.id !== id));
    if (selectedSpotId === id) setSelectedSpotId(null);
  }, [selectedSpotId]);

  const editSpot = useCallback(async (
    id: number,
    payload: Partial<Pick<ParkingSpot, 'name' | 'address' | 'notes' | 'is_paid' | 'price'>>
  ) => {
    const updated = await apiUpdateSpot(id, payload);
    setSpots((prev) => prev.map((s) => (s.id === id ? updated : s)));
    return updated;
  }, []);

  return {
    spots,
    loading,
    pendingPin,
    setPendingPin,
    selectedSpotId,
    setSelectedSpotId,
    addSpot,
    removeSpot,
    editSpot,
  };
}

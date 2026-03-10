export interface ParkingSpot {
  id: number;
  name: string;
  address: string;
  notes: string;
  lat: number;
  lng: number;
  is_paid: number;   // 0 = free, 1 = paid (SQLite integer)
  price: string;     // e.g. "$2/hr", "$15 flat"
  created_at: string;
}

export type CreateSpotPayload = Omit<ParkingSpot, 'id' | 'created_at'>;

export interface PublicParkingSpot {
  id: number;
  lat: number;
  lng: number;
  name: string;
  fee: 'paid' | 'free' | 'unknown';
  capacity?: number;
  parkingType?: string;
  operator?: string;
  access?: string;
}

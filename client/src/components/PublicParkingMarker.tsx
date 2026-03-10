import { Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import type { PublicParkingSpot, CreateSpotPayload } from '../types';

const blueIcon = L.divIcon({
  className: '',
  html: '<div class="map-pin map-pin-blue">P</div>',
  iconSize: [30, 30],
  iconAnchor: [15, 15],
  popupAnchor: [0, -16],
});

interface Props {
  spot: PublicParkingSpot;
  onSave: (payload: CreateSpotPayload) => Promise<void>;
}

const PARKING_TYPE_LABEL: Record<string, string> = {
  'multi-storey': 'Multi-storey garage',
  underground: 'Underground garage',
  surface: 'Surface lot',
  rooftop: 'Rooftop',
  street_side: 'Street parking',
};

export function PublicParkingMarker({ spot, onSave }: Props) {
  async function handleSave() {
    await onSave({
      name: spot.name,
      address: '',
      notes: [
        spot.parkingType ? PARKING_TYPE_LABEL[spot.parkingType] ?? spot.parkingType : '',
        spot.operator ? `Operated by ${spot.operator}` : '',
        spot.capacity ? `${spot.capacity} spaces` : '',
      ].filter(Boolean).join(' · '),
      lat: spot.lat,
      lng: spot.lng,
      is_paid: spot.fee === 'paid' ? 1 : 0,
      price: '',
    });
  }

  const feeLabel = spot.fee === 'paid' ? 'Paid' : spot.fee === 'free' ? 'Free' : 'Fee unknown';

  return (
    <Marker position={[spot.lat, spot.lng]} icon={blueIcon}>
      <Popup>
        <div className="popup-content">
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
            <h3 style={{ margin: 0 }}>{spot.name}</h3>
            <span className={`parking-badge ${spot.fee === 'paid' ? 'badge-paid' : spot.fee === 'free' ? 'badge-free' : 'badge-unknown'}`}>
              {feeLabel}
            </span>
          </div>
          {spot.parkingType && (
            <div className="popup-address">🏗️ {PARKING_TYPE_LABEL[spot.parkingType] ?? spot.parkingType}</div>
          )}
          {spot.operator && (
            <div className="popup-address">🏢 {spot.operator}</div>
          )}
          {spot.capacity && (
            <div className="popup-address">🚗 {spot.capacity} spaces</div>
          )}
          <div style={{ marginTop: 8 }}>
            <button
              className="btn-primary"
              style={{ padding: '5px 12px', fontSize: '0.78rem', width: '100%' }}
              onClick={handleSave}
            >
              + Save to my spots
            </button>
          </div>
        </div>
      </Popup>
    </Marker>
  );
}

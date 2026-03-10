import { Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import type { ParkingSpot } from '../types';

const redIcon = L.divIcon({
  className: '',
  html: '<div class="map-pin map-pin-red">P</div>',
  iconSize: [30, 30],
  iconAnchor: [15, 15],
  popupAnchor: [0, -16],
});

interface Props {
  spot: ParkingSpot;
  isSelected: boolean;
  onSelect: (id: number) => void;
  onDelete: (id: number) => void;
  onEdit: (spot: ParkingSpot) => void;
}

export function ParkingMarker({ spot, isSelected, onSelect, onDelete, onEdit }: Props) {
  return (
    <Marker
      position={[spot.lat, spot.lng]}
      icon={redIcon}
      eventHandlers={{ click: () => onSelect(spot.id) }}
    >
      <Popup>
        <div className="popup-content">
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
            <h3 style={{ margin: 0 }}>{spot.name}</h3>
            <span className={`parking-badge ${spot.is_paid ? 'badge-paid' : 'badge-free'}`}>
              {spot.is_paid ? 'Paid' : 'Free'}
            </span>
          </div>
          {spot.is_paid && spot.price && (
            <div className="popup-price">💰 {spot.price}</div>
          )}
          {spot.address && (
            <div className="popup-address">📍 {spot.address}</div>
          )}
          {spot.notes && (
            <div className="popup-notes">{spot.notes}</div>
          )}
          <div style={{ display: 'flex', gap: 6, marginTop: 8 }}>
            <button
              className="btn-secondary"
              style={{ padding: '5px 12px', fontSize: '0.78rem' }}
              onClick={() => onEdit(spot)}
            >
              Edit
            </button>
            <button
              className="btn-danger"
              onClick={() => {
                if (confirm(`Delete "${spot.name}"?`)) onDelete(spot.id);
              }}
            >
              Delete
            </button>
          </div>
        </div>
      </Popup>
    </Marker>
  );
}

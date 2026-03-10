import type { ParkingSpot } from '../types';

interface Props {
  spots: ParkingSpot[];
  selectedSpotId: number | null;
  onSelectSpot: (spot: ParkingSpot) => void;
  onDeleteSpot: (id: number) => void;
  onEditSpot: (spot: ParkingSpot) => void;
}

export function Sidebar({ spots, selectedSpotId, onSelectSpot, onDeleteSpot, onEditSpot }: Props) {
  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <h1>Parking Spots</h1>
        <p>Click anywhere on the map to add a spot</p>
        {spots.length > 0 && (
          <div className="sidebar-count">{spots.length} spot{spots.length !== 1 ? 's' : ''} saved</div>
        )}
      </div>

      <div className="spot-list">
        {spots.length === 0 ? (
          <div className="empty-state">
            <div className="icon">🅿️</div>
            <p>No parking spots yet.<br />Click on the map to add your first spot.</p>
          </div>
        ) : (
          spots.map((spot) => (
            <div
              key={spot.id}
              className={`spot-item ${selectedSpotId === spot.id ? 'active' : ''}`}
              onClick={() => onSelectSpot(spot)}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <div className="spot-item-name">{spot.name}</div>
                <span className={`parking-badge ${spot.is_paid ? 'badge-paid' : 'badge-free'}`}>
                  {spot.is_paid ? (spot.price || 'Paid') : 'Free'}
                </span>
              </div>
              {spot.address && (
                <div className="spot-item-address">📍 {spot.address}</div>
              )}
              {spot.notes && (
                <div className="spot-item-notes">💬 {spot.notes}</div>
              )}
              <div className="spot-item-actions" onClick={(e) => e.stopPropagation()}>
                <button
                  className="btn-secondary"
                  style={{ padding: '4px 12px', fontSize: '0.78rem' }}
                  onClick={() => onEditSpot(spot)}
                >
                  Edit
                </button>
                <button
                  className="btn-danger"
                  onClick={() => {
                    if (confirm(`Delete "${spot.name}"?`)) onDeleteSpot(spot.id);
                  }}
                >
                  Delete
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

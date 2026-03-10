import { useState, useEffect, useRef, useCallback } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents, useMap } from 'react-leaflet';
import L from 'leaflet';
import type { Map as LeafletMap } from 'leaflet';
import type { ParkingSpot, PublicParkingSpot, CreateSpotPayload } from '../types';
import { ParkingMarker } from './ParkingMarker';
import { PublicParkingMarker } from './PublicParkingMarker';
import { getNearbyPublicParking } from '../api';

const locationIcon = L.divIcon({
  className: '',
  html: '<div class="map-pin map-pin-green map-pin-location">📍</div>',
  iconSize: [44, 44],
  iconAnchor: [22, 22],
  popupAnchor: [0, -24],
});

function MapClickHandler({ onMapClick }: { onMapClick: (lat: number, lng: number) => void }) {
  useMapEvents({
    click(e) { onMapClick(e.latlng.lat, e.latlng.lng); },
  });
  return null;
}

function PublicParkingLayer({
  onSpotsLoaded,
  onLoadingChange,
}: {
  onSpotsLoaded: (spots: PublicParkingSpot[]) => void;
  onLoadingChange: (v: boolean) => void;
}) {
  const map = useMap();
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const fetchParking = useCallback(async () => {
    const { lat, lng } = map.getCenter();
    onLoadingChange(true);
    const spots = await getNearbyPublicParking(lat, lng, 1500);
    onSpotsLoaded(spots);
    onLoadingChange(false);
  }, [map, onSpotsLoaded, onLoadingChange]);

  useEffect(() => { fetchParking(); }, [fetchParking]);

  useMapEvents({
    moveend() {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(fetchParking, 800);
    },
  });

  return null;
}

interface Props {
  spots: ParkingSpot[];
  selectedSpotId: number | null;
  initialCenter: [number, number];
  initialZoom?: number;
  searchCenter?: [number, number] | null;
  onMapClick: (lat: number, lng: number) => void;
  onSelectSpot: (id: number) => void;
  onDeleteSpot: (id: number) => void;
  onEditSpot: (spot: ParkingSpot) => void;
  onSavePublicSpot: (payload: CreateSpotPayload) => Promise<void>;
  mapRef: React.MutableRefObject<LeafletMap | null>;
}

export function MapView({
  spots, selectedSpotId, initialCenter, initialZoom = 14, searchCenter,
  onMapClick, onSelectSpot, onDeleteSpot, onEditSpot, onSavePublicSpot, mapRef,
}: Props) {
  const [showSaved, setShowSaved] = useState(true);
  const [showPublic, setShowPublic] = useState(false);
  const [publicSpots, setPublicSpots] = useState<PublicParkingSpot[]>([]);
  const [loadingPublic, setLoadingPublic] = useState(false);

  return (
    <div style={{ flex: 1, position: 'relative', height: '100%' }}>
      <MapContainer
        center={initialCenter}
        zoom={initialZoom}
        style={{ width: '100%', height: '100%' }}
        ref={mapRef}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <MapClickHandler onMapClick={onMapClick} />

        {searchCenter && (
          <Marker position={searchCenter} icon={locationIcon}>
            <Popup>
              <div className="popup-content">
                <strong>Your searched location</strong>
              </div>
            </Popup>
          </Marker>
        )}

        {showSaved && spots.map((spot) => (
          <ParkingMarker
            key={spot.id}
            spot={spot}
            isSelected={selectedSpotId === spot.id}
            onSelect={onSelectSpot}
            onDelete={onDeleteSpot}
            onEdit={onEditSpot}
          />
        ))}

        {showPublic && (
          <PublicParkingLayer
            onSpotsLoaded={setPublicSpots}
            onLoadingChange={setLoadingPublic}
          />
        )}

        {showPublic && publicSpots.map((spot) => (
          <PublicParkingMarker key={spot.id} spot={spot} onSave={onSavePublicSpot} />
        ))}
      </MapContainer>

      <div className="map-layer-toggles">
        <button
          className={`layer-toggle-btn ${showSaved ? 'active-red' : ''}`}
          onClick={() => setShowSaved((v) => !v)}
        >
          🔴 {showSaved ? 'Hide My Spots' : 'Show My Spots'}
        </button>
        <button
          className={`layer-toggle-btn ${showPublic ? 'active-blue' : ''}`}
          onClick={() => { setShowPublic((v) => !v); if (showPublic) setPublicSpots([]); }}
        >
          {loadingPublic ? '⏳' : '🔵'} {showPublic ? 'Hide Public' : 'Show Public'}
        </button>
      </div>
    </div>
  );
}

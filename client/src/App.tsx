import { useRef, useState } from 'react';
import type { Map as LeafletMap } from 'leaflet';
import { MapView } from './components/MapView';
import { Sidebar } from './components/Sidebar';
import { AddPinModal } from './components/AddPinModal';
import { EditPinModal } from './components/EditPinModal';
import { HomePage } from './components/HomePage';
import { useParkingSpots } from './hooks/useParkingSpots';
import type { ParkingSpot } from './types';

const DEFAULT_CENTER: [number, number] = [37.7749, -122.4194];

export default function App() {
  const mapRef = useRef<LeafletMap | null>(null);
  const [editingSpot, setEditingSpot] = useState<ParkingSpot | null>(null);
  const [view, setView] = useState<'home' | 'map'>('home');
  const [initialCenter, setInitialCenter] = useState<[number, number]>(DEFAULT_CENTER);
  const [initialZoom, setInitialZoom] = useState(14);
  const [searchCenter, setSearchCenter] = useState<[number, number] | null>(null);

  const {
    spots,
    loading,
    pendingPin,
    setPendingPin,
    selectedSpotId,
    setSelectedSpotId,
    addSpot,
    removeSpot,
    editSpot,
  } = useParkingSpots();

  function handleSearch(lat: number, lng: number) {
    setInitialCenter([lat, lng]);
    setSearchCenter([lat, lng]);
    setInitialZoom(16);
    setView('map');
  }

  function handleAddSpot(lat: number, lng: number) {
    setInitialCenter([lat, lng]);
    setSearchCenter(null);
    setInitialZoom(15);
    setView('map');
  }

  function handleMapClick(lat: number, lng: number) {
    setPendingPin({ lat, lng });
  }

  function handleSelectSpot(spot: ParkingSpot) {
    setSelectedSpotId(spot.id);
    mapRef.current?.flyTo([spot.lat, spot.lng], 16, { duration: 0.8 });
  }

  function handleSelectSpotById(id: number) {
    setSelectedSpotId(id);
  }

  async function handleEdit(
    id: number,
    payload: Pick<ParkingSpot, 'name' | 'address' | 'notes' | 'is_paid' | 'price'>
  ) {
    await editSpot(id, payload);
    setEditingSpot(null);
  }

  if (view === 'home') {
    return <HomePage onSearch={handleSearch} onAddSpot={handleAddSpot} />;
  }

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#888' }}>
        Loading...
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', height: '100vh', position: 'relative' }}>
      <button
        className="back-btn"
        onClick={() => setView('home')}
        title="Back to home"
      >
        ← Home
      </button>

      <MapView
        spots={spots}
        selectedSpotId={selectedSpotId}
        initialCenter={initialCenter}
        initialZoom={initialZoom}
        onMapClick={handleMapClick}
        onSelectSpot={handleSelectSpotById}
        onDeleteSpot={removeSpot}
        onEditSpot={setEditingSpot}
        searchCenter={searchCenter}
        onSavePublicSpot={(payload) => addSpot(payload).then(() => {})}
        mapRef={mapRef}
      />

      <Sidebar
        spots={spots}
        selectedSpotId={selectedSpotId}
        onSelectSpot={handleSelectSpot}
        onDeleteSpot={removeSpot}
        onEditSpot={setEditingSpot}
      />

      {!pendingPin && (
        <div className="hint-bar">Click anywhere on the map to add a parking spot</div>
      )}

      {pendingPin && (
        <AddPinModal
          lat={pendingPin.lat}
          lng={pendingPin.lng}
          onSave={addSpot}
          onClose={() => setPendingPin(null)}
        />
      )}

      {editingSpot && (
        <EditPinModal
          spot={editingSpot}
          onSave={(payload) => handleEdit(editingSpot.id, payload)}
          onClose={() => setEditingSpot(null)}
        />
      )}
    </div>
  );
}

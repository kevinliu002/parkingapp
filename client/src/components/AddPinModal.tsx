import { useState, useEffect, FormEvent } from 'react';
import type { CreateSpotPayload } from '../types';
import { reverseGeocode } from '../api';

interface Props {
  lat: number;
  lng: number;
  onSave: (payload: CreateSpotPayload) => Promise<void>;
  onClose: () => void;
}

export function AddPinModal({ lat, lng, onSave, onClose }: Props) {
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [notes, setNotes] = useState('');
  const [isPaid, setIsPaid] = useState(false);
  const [price, setPrice] = useState('');
  const [geocoding, setGeocoding] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setGeocoding(true);
    reverseGeocode(lat, lng)
      .then((addr) => setAddress(addr))
      .finally(() => setGeocoding(false));
  }, [lat, lng]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    setSaving(true);
    try {
      await onSave({
        name: name.trim(),
        address,
        notes,
        lat,
        lng,
        is_paid: isPaid ? 1 : 0,
        price: isPaid ? price : '',
      });
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <h2>Add Parking Spot</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Name *</label>
            <input
              type="text"
              placeholder="e.g. Street Parking on Main St"
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoFocus
              required
            />
          </div>

          <div className="form-group">
            <label>Address {geocoding && <span className="geocoding-spinner">Fetching…</span>}</label>
            <input
              type="text"
              placeholder={geocoding ? '' : 'Enter address manually'}
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              disabled={geocoding}
              style={geocoding ? { background: '#f5f5f5', color: '#aaa' } : {}}
            />
            <span className="address-hint">📍 {lat.toFixed(5)}, {lng.toFixed(5)}</span>
          </div>

          <div className="form-group">
            <label>Parking Type</label>
            <div className="toggle-group">
              <button
                type="button"
                className={`toggle-btn ${!isPaid ? 'active-free' : ''}`}
                onClick={() => setIsPaid(false)}
              >
                Free
              </button>
              <button
                type="button"
                className={`toggle-btn ${isPaid ? 'active-paid' : ''}`}
                onClick={() => setIsPaid(true)}
              >
                Paid
              </button>
            </div>
          </div>

          {isPaid && (
            <div className="form-group">
              <label>Rate / Cost</label>
              <input
                type="text"
                placeholder="e.g. $2/hr, $15 flat rate, $3 first hour"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
              />
            </div>
          )}

          <div className="form-group">
            <label>Notes</label>
            <textarea
              placeholder="e.g. 2-hour limit, free on weekends, covered parking..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>

          <div className="modal-actions">
            <button type="button" className="btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button
              type="submit"
              className="btn-primary"
              disabled={!name.trim() || saving}
            >
              {saving ? 'Saving...' : 'Save Spot'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

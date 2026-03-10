import { useState, FormEvent } from 'react';
import type { ParkingSpot } from '../types';

interface Props {
  spot: ParkingSpot;
  onSave: (payload: Pick<ParkingSpot, 'name' | 'address' | 'notes' | 'is_paid' | 'price'>) => Promise<void>;
  onClose: () => void;
}

export function EditPinModal({ spot, onSave, onClose }: Props) {
  const [name, setName] = useState(spot.name);
  const [address, setAddress] = useState(spot.address);
  const [notes, setNotes] = useState(spot.notes);
  const [isPaid, setIsPaid] = useState(!!spot.is_paid);
  const [price, setPrice] = useState(spot.price);
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    setSaving(true);
    try {
      await onSave({
        name: name.trim(),
        address,
        notes,
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
        <h2>Edit Parking Spot</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Name *</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoFocus
              required
            />
          </div>

          <div className="form-group">
            <label>Address</label>
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
            />
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
                placeholder="e.g. $2/hr, $15 flat rate"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
              />
            </div>
          )}

          <div className="form-group">
            <label>Notes</label>
            <textarea
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
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

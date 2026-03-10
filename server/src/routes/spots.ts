import { Router, Request, Response } from 'express';
import db from '../db.js';

const router = Router();

// GET /api/spots
router.get('/', (_req: Request, res: Response) => {
  const spots = db.prepare('SELECT * FROM spots ORDER BY created_at DESC').all();
  res.json(spots);
});

// POST /api/spots
router.post('/', (req: Request, res: Response) => {
  const { name, address, notes, lat, lng, is_paid, price } = req.body;

  if (!name || lat == null || lng == null) {
    res.status(400).json({ error: 'name, lat, and lng are required' });
    return;
  }

  const result = db
    .prepare('INSERT INTO spots (name, address, notes, lat, lng, is_paid, price) VALUES (?, ?, ?, ?, ?, ?, ?)')
    .run(name, address ?? '', notes ?? '', lat, lng, is_paid ? 1 : 0, is_paid ? (price ?? '') : '');

  const spot = db.prepare('SELECT * FROM spots WHERE id = ?').get(result.lastInsertRowid);
  res.status(201).json(spot);
});

// DELETE /api/spots/:id
router.delete('/:id', (req: Request, res: Response) => {
  db.prepare('DELETE FROM spots WHERE id = ?').run(req.params.id);
  res.status(204).send();
});

// PUT /api/spots/:id
router.put('/:id', (req: Request, res: Response) => {
  const { name, address, notes, is_paid, price } = req.body;
  const { id } = req.params;

  db.prepare('UPDATE spots SET name = ?, address = ?, notes = ?, is_paid = ?, price = ? WHERE id = ?').run(
    name,
    address ?? '',
    notes ?? '',
    is_paid ? 1 : 0,
    is_paid ? (price ?? '') : '',
    id
  );

  const spot = db.prepare('SELECT * FROM spots WHERE id = ?').get(id);
  if (!spot) {
    res.status(404).json({ error: 'Spot not found' });
    return;
  }
  res.json(spot);
});

export default router;

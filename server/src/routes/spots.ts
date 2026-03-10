import { Router, Request, Response } from 'express';
import db from '../db.js';

const router = Router();

// GET /api/spots
router.get('/', async (_req: Request, res: Response) => {
  const result = await db.execute('SELECT * FROM spots ORDER BY created_at DESC');
  res.json(result.rows);
});

// POST /api/spots
router.post('/', async (req: Request, res: Response) => {
  const { name, address, notes, lat, lng, is_paid, price } = req.body;

  if (!name || lat == null || lng == null) {
    res.status(400).json({ error: 'name, lat, and lng are required' });
    return;
  }

  const result = await db.execute({
    sql: 'INSERT INTO spots (name, address, notes, lat, lng, is_paid, price) VALUES (?, ?, ?, ?, ?, ?, ?)',
    args: [name, address ?? '', notes ?? '', lat, lng, is_paid ? 1 : 0, is_paid ? (price ?? '') : ''],
  });

  const id = result.lastInsertRowid != null ? Number(result.lastInsertRowid) : null;
  const spot = await db.execute({ sql: 'SELECT * FROM spots WHERE id = ?', args: [id] });
  res.status(201).json(spot.rows[0]);
});

// DELETE /api/spots/:id
router.delete('/:id', async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  await db.execute({ sql: 'DELETE FROM spots WHERE id = ?', args: [id] });
  res.status(204).send();
});

// PUT /api/spots/:id
router.put('/:id', async (req: Request, res: Response) => {
  const { name, address, notes, is_paid, price } = req.body;
  const id = Number(req.params.id);

  await db.execute({
    sql: 'UPDATE spots SET name = ?, address = ?, notes = ?, is_paid = ?, price = ? WHERE id = ?',
    args: [name, address ?? '', notes ?? '', is_paid ? 1 : 0, is_paid ? (price ?? '') : '', id],
  });

  const spot = await db.execute({ sql: 'SELECT * FROM spots WHERE id = ?', args: [id] });
  if (!spot.rows[0]) {
    res.status(404).json({ error: 'Spot not found' });
    return;
  }
  res.json(spot.rows[0]);
});

export default router;

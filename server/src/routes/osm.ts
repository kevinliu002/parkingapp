import { Router, Request, Response } from 'express';

const router = Router();

interface OverpassElement {
  type: 'node' | 'way' | 'relation';
  id: number;
  lat?: number;
  lon?: number;
  center?: { lat: number; lon: number };
  tags?: {
    name?: string;
    fee?: string;
    capacity?: string;
    parking?: string;
    operator?: string;
    access?: string;
  };
}

// GET /api/osm/parking?lat=...&lng=...&radius=...
router.get('/parking', async (req: Request, res: Response) => {
  const { lat, lng, radius = '1500' } = req.query;

  if (!lat || !lng) {
    res.status(400).json({ error: 'lat and lng are required' });
    return;
  }

  const r = Math.min(parseInt(String(radius), 10) || 1500, 3000);

  const query = `
    [out:json][timeout:15];
    (
      node["amenity"="parking"](around:${r},${lat},${lng});
      way["amenity"="parking"](around:${r},${lat},${lng});
      relation["amenity"="parking"](around:${r},${lat},${lng});
    );
    out center tags;
  `.trim();

  try {
    const response = await fetch('https://overpass-api.de/api/interpreter', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'User-Agent': 'ParkingApp/1.0 (parking-app@example.com)',
      },
      body: `data=${encodeURIComponent(query)}`,
      signal: AbortSignal.timeout(18000),
    });

    if (!response.ok) {
      res.status(502).json({ error: 'OSM service unavailable' });
      return;
    }

    const data = await response.json() as { elements: OverpassElement[] };

    const spots = data.elements
      .map((el) => {
        const lat = el.lat ?? el.center?.lat;
        const lng = el.lon ?? el.center?.lon;
        if (!lat || !lng) return null;

        const tags = el.tags ?? {};
        return {
          id: el.id,
          lat,
          lng,
          name: tags.name ?? 'Parking',
          fee: tags.fee === 'yes' ? 'paid' : tags.fee === 'no' ? 'free' : 'unknown',
          capacity: tags.capacity ? parseInt(tags.capacity, 10) : undefined,
          parkingType: tags.parking,
          operator: tags.operator,
          access: tags.access,
        };
      })
      .filter(Boolean);

    res.json(spots);
  } catch {
    res.status(502).json({ error: 'Failed to reach OSM service' });
  }
});

export default router;

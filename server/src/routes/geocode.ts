import { Router, Request, Response } from 'express';

const router = Router();
const PHOTON_HEADERS = { 'User-Agent': 'ParkingApp/1.0 (parking-app@example.com)' };
const TIMEOUT_MS = 5000;

// Photon (komoot) feature properties
interface PhotonProps {
  name?: string;
  housenumber?: string;
  street?: string;
  city?: string;
  state?: string;
  country?: string;
  postcode?: string;
}

function buildAddress(p: PhotonProps): string {
  const parts: string[] = [];
  if (p.housenumber && p.street) parts.push(`${p.housenumber} ${p.street}`);
  else if (p.street) parts.push(p.street);
  else if (p.name) parts.push(p.name);
  if (p.city) parts.push(p.city);
  if (p.state) parts.push(p.state);
  if (p.postcode) parts.push(p.postcode);
  if (p.country) parts.push(p.country);
  return parts.join(', ');
}

// GET /api/geocode/search?q=...&limit=N
// Uses Photon (komoot) which supports partial/prefix autocomplete
router.get('/search', async (req: Request, res: Response) => {
  const { q, limit: limitParam } = req.query;

  if (!q) {
    res.status(400).json({ error: 'q query param is required' });
    return;
  }

  const limit = Math.min(parseInt(String(limitParam ?? '1'), 10) || 1, 5);

  try {
    const url = `https://photon.komoot.io/api/?q=${encodeURIComponent(String(q))}&limit=${limit}&lang=en`;
    const response = await fetch(url, {
      headers: PHOTON_HEADERS,
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });

    if (!response.ok) {
      res.status(502).json({ error: 'Geocoding service unavailable' });
      return;
    }

    const data = await response.json() as {
      features: Array<{
        geometry: { coordinates: [number, number] };
        properties: PhotonProps;
      }>;
    };

    if (!data.features?.length) {
      res.status(404).json({ error: 'Address not found' });
      return;
    }

    const results = data.features.map((f) => ({
      lat: f.geometry.coordinates[1],
      lng: f.geometry.coordinates[0],
      address: buildAddress(f.properties),
    }));

    res.json(limit === 1 ? results[0] : results);
  } catch {
    res.status(502).json({ error: 'Failed to reach geocoding service' });
  }
});

// GET /api/geocode?lat=...&lng=... — reverse geocoding via Photon
router.get('/', async (req: Request, res: Response) => {
  const { lat, lng } = req.query;

  if (!lat || !lng) {
    res.status(400).json({ error: 'lat and lng query params are required' });
    return;
  }

  try {
    const url = `https://photon.komoot.io/reverse?lat=${lat}&lon=${lng}&limit=1`;
    const response = await fetch(url, {
      headers: PHOTON_HEADERS,
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });

    if (!response.ok) {
      res.status(502).json({ error: 'Geocoding service unavailable' });
      return;
    }

    const data = await response.json() as {
      features: Array<{
        geometry: { coordinates: [number, number] };
        properties: PhotonProps;
      }>;
    };

    const address = data.features?.length
      ? buildAddress(data.features[0].properties)
      : '';

    res.json({ address });
  } catch {
    res.status(502).json({ error: 'Failed to reach geocoding service' });
  }
});

export default router;

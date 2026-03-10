import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import spotsRouter from './routes/spots.js';
import geocodeRouter from './routes/geocode.js';
import osmRouter from './routes/osm.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT ?? 3001;
const IS_PROD = process.env.NODE_ENV === 'production';

if (!IS_PROD) {
  app.use(cors({ origin: 'http://localhost:5173' }));
}

app.use(express.json());

app.use('/api/spots', spotsRouter);
app.use('/api/geocode', geocodeRouter);
app.use('/api/osm', osmRouter);

// Serve built React app in production
if (IS_PROD) {
  const clientDist = path.join(__dirname, '../../client/dist');
  app.use(express.static(clientDist));
  app.get('*', (_req, res) => {
    res.sendFile(path.join(clientDist, 'index.html'));
  });
}

app.listen(PORT, () => {
  console.log(`Parking app server running at http://localhost:${PORT}`);
});

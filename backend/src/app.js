import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import mongoose from 'mongoose';
import articleRoutes from './routes/articleRoutes.js';
import sourceRoutes from './routes/sourceRoutes.js';
import syncRoutes from './routes/syncRoutes.js';
import assistantRoutes from './routes/assistantRoutes.js';
import ricePriceRoutes from './routes/ricePriceRoutes.js';
import footballRoutes from './routes/footballRoutes.js';
import { errorHandler, notFound } from './middleware/errorHandler.js';

dotenv.config();

const app = express();

function buildAllowedOrigins() {
  const configuredOrigins = (process.env.CLIENT_URL || '')
    .split(',')
    .map((origin) => {
      const value = origin.trim();
      if (!value) return '';

      try {
        return new URL(value).origin;
      } catch {
        return value;
      }
    })
    .filter(Boolean);

  return configuredOrigins.length ? configuredOrigins : '*';
}

app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
app.use(cors({ origin: buildAllowedOrigins(), credentials: true }));
app.use(express.json({ limit: '1mb' }));
app.use(morgan('dev'));

app.get('/api/health', (req, res) => {
  res.json({
    ok: true,
    name: 'Tin Tuc 247 API',
    time: new Date().toISOString(),
    database: {
      connected: mongoose.connection.readyState === 1,
      state: mongoose.connection.readyState
    }
  });
});

app.use('/api/articles', articleRoutes);
app.use('/api/sources', sourceRoutes);
app.use('/api/sync', syncRoutes);
app.use('/api/assistant', assistantRoutes);
app.use('/api/rice-prices', ricePriceRoutes);
app.use('/api/football', footballRoutes);

app.use(notFound);
app.use(errorHandler);

export default app;

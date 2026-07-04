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

const app = express();

function normalizeOrigin(origin) {
  const value = origin.trim();
  if (!value) return '';

  try {
    return new URL(value).origin;
  } catch {
    return value.replace(/\/$/, '');
  }
}

const allowedOrigins = [
  ...(process.env.CLIENT_URL || '').split(','),
  'https://danhhehehe.github.io',
  'http://localhost:5173',
  'http://localhost:3000'
]
  .map(normalizeOrigin)
  .filter(Boolean);

app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
app.use(cors({
  origin(origin, callback) {
    if (!origin || allowedOrigins.includes(normalizeOrigin(origin))) {
      return callback(null, true);
    }

    return callback(new Error('Not allowed by CORS'));
  },
  credentials: true
}));
app.use(express.json({ limit: '1mb' }));
app.use(morgan('dev'));

function healthCheck(req, res) {
  res.json({
    status: 'ok',
    service: 'tin-tuc-247-backend',
    database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
  });
}

app.get('/health', healthCheck);
app.get('/api/health', healthCheck);

app.use('/api/articles', articleRoutes);
app.use('/api/sources', sourceRoutes);
app.use('/api/sync', syncRoutes);
app.use('/api/assistant', assistantRoutes);
app.use('/api/rice-prices', ricePriceRoutes);
app.use('/api/football', footballRoutes);

app.use(notFound);
app.use(errorHandler);

export default app;

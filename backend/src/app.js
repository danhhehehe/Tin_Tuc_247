import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import articleRoutes from './routes/articleRoutes.js';
import sourceRoutes from './routes/sourceRoutes.js';
import syncRoutes from './routes/syncRoutes.js';
import assistantRoutes from './routes/assistantRoutes.js';
import ricePriceRoutes from './routes/ricePriceRoutes.js';
import footballRoutes from './routes/footballRoutes.js';
import { errorHandler, notFound } from './middleware/errorHandler.js';

dotenv.config();

const app = express();

app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
app.use(cors({ origin: process.env.CLIENT_URL || '*', credentials: true }));
app.use(express.json({ limit: '1mb' }));
app.use(morgan('dev'));

app.get('/api/health', (req, res) => {
  res.json({
    ok: true,
    name: 'Tin Tức 247 API',
    time: new Date().toISOString(),
    mongo: process.env.MONGODB_URI || process.env.MONGO_URI || 'mongodb://localhost:27017/tin_tuc_247'
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

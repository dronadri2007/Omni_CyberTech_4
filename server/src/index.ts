import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import path from 'path';

import { env, corsOrigins, usePersistentDb } from './config/env';
import { optionalAuth } from './middleware/auth';
import { errorHandler, notFoundHandler } from './middleware/errorHandler';
import { activeAnalyzerName } from './services/analysisEngine';

import authRoutes from './routes/authRoutes';
import analyzeRoutes from './routes/analyzeRoutes';
import casesRoutes from './routes/casesRoutes';
import reviewsRoutes from './routes/reviewsRoutes';
import reportsRoutes from './routes/reportsRoutes';
import statsRoutes from './routes/statsRoutes';

const app = express();
app.disable('x-powered-by');
app.set('trust proxy', 1);

app.use(helmet());
app.use(
  cors({
    origin: (origin, cb) => {
      // Allow non-browser clients (no Origin) and any explicitly allow-listed origin.
      if (!origin || corsOrigins.includes(origin) || corsOrigins.includes('*')) return cb(null, true);
      return cb(new Error(`Origin ${origin} not allowed by CORS`));
    },
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-API-Key'],
  }),
);

// JSON bodies are small; large media goes through multer, not the JSON parser.
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

app.use(
  rateLimit({
    windowMs: 60 * 1000,
    max: 120,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: 'Rate limit exceeded', code: 'ERR_RATE_LIMIT' },
  }),
);

// Attach identity when a token is present without forcing auth on read-only routes.
app.use(optionalAuth);

app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

app.get('/api/health', (_req, res) => {
  res.status(200).json({
    status: 'ONLINE',
    platform: 'VERIFRAME Multimodal Deepfake Verification Platform',
    version: '2.5.0',
    analyzer: activeAnalyzerName,
    store: usePersistentDb ? 'postgres' : 'memory',
    timestamp: new Date().toISOString(),
  });
});

app.use('/api/auth', authRoutes);
app.use('/api/analyze', analyzeRoutes);
app.use('/api/cases', casesRoutes);
app.use('/api/reviews', reviewsRoutes);
app.use('/api/reports', reportsRoutes);
app.use('/api', statsRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

if (require.main === module) {
  app.listen(env.PORT, () => {
    // eslint-disable-next-line no-console
    console.log('=======================================================');
    console.log(`⚡ VERIFRAME SOC Backend  http://localhost:${env.PORT}`);
    console.log(`🛡️  Analyzer: ${activeAnalyzerName.toUpperCase()}   Store: ${usePersistentDb ? 'PostgreSQL' : 'in-memory'}`);
    console.log('=======================================================');
  });
}

export { app };

import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';

import authRoutes from './routes/authRoutes';
import analyzeRoutes from './routes/analyzeRoutes';
import casesRoutes from './routes/casesRoutes';
import reviewsRoutes from './routes/reviewsRoutes';
import reportsRoutes from './routes/reportsRoutes';
import statsRoutes from './routes/statsRoutes';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-API-Key']
}));

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Static uploads directory (for sample assets if needed)
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Health Check
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'ONLINE',
    platform: 'VERIFRAME Multimodal Deepfake Verification Platform',
    version: '2.4.0',
    timestamp: new Date().toISOString()
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/analyze', analyzeRoutes);
app.use('/api/cases', casesRoutes);
app.use('/api/reviews', reviewsRoutes);
app.use('/api/reports', reportsRoutes);
app.use('/api', statsRoutes);

// Global Error Handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('[VERIFRAME Server Error]:', err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal Server Error',
    code: err.code || 'ERR_INTERNAL'
  });
});

app.listen(PORT, () => {
  console.log(`=======================================================`);
  console.log(`⚡ VERIFRAME SOC Backend running on http://localhost:${PORT}`);
  console.log(`🛡️  MediaAnalyzer Engine: MOCK ENSEMBLE ACTIVE`);
  console.log(`=======================================================`);
});

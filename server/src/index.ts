import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import swaggerUi from 'swagger-ui-express';
import { swaggerSpec } from './config/swagger.js';

import authRoutes from './routes/authRoutes.js';
import kycRoutes from './routes/kycRoutes.js';
import digilockerRoutes from './routes/digilockerRoutes.js';
import amlRoutes from './routes/amlRoutes.js';
import fraudRoutes from './routes/fraudRoutes.js';
import ledgerRoutes from './routes/ledgerRoutes.js';
import insuranceRoutes from './routes/insuranceRoutes.js';
import piiRoutes from './routes/piiRoutes.js';
import kafkaRoutes from './routes/kafkaRoutes.js';
import webhookRoutes from './routes/webhookRoutes.js';
import systemRoutes from './routes/systemRoutes.js';

const app = express();
const PORT = process.env.PORT || 5001;

// Middlewares
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Idempotency-Key', 'X-Requested-With']
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Swagger OpenAPI Documentation
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  customSiteTitle: 'ITFreeSource Academy FinTech API Docs',
  customCss: '.swagger-ui .topbar { background-color: #0b0f17; } .swagger-ui .topbar .topbar-wrapper img { content: url("https://img.shields.io/badge/ITFreeSource-Academy-4f46e5"); }'
}));
app.get('/api/swagger.json', (_req: Request, res: Response) => {
  res.setHeader('Content-Type', 'application/json');
  res.send(swaggerSpec);
});

// Mount All Microservices Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/kyc', kycRoutes);
app.use('/api/v1/digilocker', digilockerRoutes);
app.use('/api/v1/aml', amlRoutes);
app.use('/api/v1/fraud', fraudRoutes);
app.use('/api/v1/ledger', ledgerRoutes);
app.use('/api/v1/insurance', insuranceRoutes);
app.use('/api/v1/pii', piiRoutes);
app.use('/api/v1/kafka', kafkaRoutes);
app.use('/api/v1/webhooks', webhookRoutes);
app.use('/api/v1/system', systemRoutes);

// Root Welcome Route
app.get('/', (_req: Request, res: Response) => {
  res.json({
    message: 'Welcome to ITFreeSource Academy Enterprise FinTech Platform API',
    version: '1.0.0',
    documentation: '/api/docs',
    swaggerJson: '/api/swagger.json',
    health: '/api/v1/system/health',
    stats: '/api/v1/system/stats'
  });
});

// Global Error Handler
app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  console.error('Unhandled API Error:', err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal Server Error',
    timestamp: new Date().toISOString()
  });
});

if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`================================================================`);
    console.log(`🚀 ITFreeSource Academy FinTech Platform running on port ${PORT}`);
    console.log(`📖 Swagger OpenAPI 3.0 Documentation: http://localhost:${PORT}/api/docs`);
    console.log(`🩺 Healthcheck: http://localhost:${PORT}/api/v1/system/health`);
    console.log(`================================================================`);
  });
}

export default app;

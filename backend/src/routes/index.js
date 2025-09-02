import { Router } from 'express';
import clientRoutes from './clientRoutes.js';

const router = Router();

// Health check route
router.get('/health', (req, res) => {
  res.json({ status: 'OK', service: 'Letter Craft API' });
});

// API version route
router.get('/version', (req, res) => {
  res.json({ 
    version: '1.0.0',
    name: 'Letter Craft API',
    environment: process.env.NODE_ENV || 'development',
  });
});

// Client routes
router.use('/clients', clientRoutes);

export default router; 
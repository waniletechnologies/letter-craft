import { Router } from 'express';
import recentActivityController from '../controllers/recentActivity.controller.js';

const router = Router();

// Get recent activities
router.get('/recent-activities', recentActivityController.getRecentActivities);

export default router;

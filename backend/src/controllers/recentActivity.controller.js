import recentActivityService from '../services/recentActivity.service.js';
import asyncHandler from '../middlewares/asyncHandler.js';

class RecentActivityController {
  /**
   * Get recent activities
   */
  getRecentActivities = asyncHandler(async (req, res) => {
    try {
      const { limit = 4 } = req.query;
      const limitNumber = parseInt(limit, 4);
      
      // Validate limit
      if (isNaN(limitNumber) || limitNumber < 1 || limitNumber > 50) {
        return res.status(400).json({
          success: false,
          message: 'Limit must be a number between 1 and 50'
        });
      }

      const activities = await recentActivityService.getRecentActivities(limitNumber);
      
      // Format activities for frontend
      const formattedActivities = activities.map(activity => ({
        id: activity.id,
        initials: activity.initials,
        name: activity.user?.name || activity.description,
        action: activity.title,
        time: recentActivityService.formatTimeAgo(activity.timestamp),
        type: activity.type,
        metadata: activity.metadata
      }));

      res.status(200).json({
        success: true,
        message: 'Recent activities retrieved successfully',
        data: formattedActivities
      });

    } catch (error) {
      console.error('Error in getRecentActivities controller:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch recent activities'
      });
    }
  });
}

export default new RecentActivityController();

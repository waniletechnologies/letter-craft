export class HealthController {
  /**
   * Get system health status
   */
  static async getHealth(req, res) {
    try {
      const healthData = {
        status: 'OK',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        memory: process.memoryUsage(),
        environment: process.env.NODE_ENV || 'development',
        version: '1.0.0',
      };

      res.status(200).json(healthData);
    } catch (error) {
      res.status(500).json({
        status: 'ERROR',
        message: 'Failed to get health status',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  /**
   * Get API version information
   */
  static async getVersion(req, res) {
    try {
      const versionData = {
        name: 'Letter Craft API',
        version: '1.0.0',
        description: 'Backend API for Letter Craft application',
        environment: process.env.NODE_ENV || 'development',
        timestamp: new Date().toISOString(),
      };

      res.status(200).json(versionData);
    } catch (error) {
      res.status(500).json({
        error: 'Failed to get version information',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }
} 
import { useState, useEffect } from 'react';
import { fetchRecentActivities, RecentActivity } from '@/lib/recentActivityApi';

interface UseRecentActivitiesReturn {
  activities: RecentActivity[];
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
}

/**
 * Custom hook to manage recent activities data
 * @param limit - Number of activities to fetch (default: 10)
 * @returns UseRecentActivitiesReturn
 */
export function useRecentActivities(limit: number = 4): UseRecentActivitiesReturn {
  const [activities, setActivities] = useState<RecentActivity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchActivities = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await fetchRecentActivities(limit);
      
      if (response.success) {
        setActivities(response.data);
      } else {
        setError(response.message || 'Failed to fetch activities');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred';
      setError(errorMessage);
      console.error('Error in useRecentActivities:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const refetch = () => {
    fetchActivities();
  };

  useEffect(() => {
    fetchActivities();
  }, [limit]);

  return {
    activities,
    isLoading,
    error,
    refetch,
  };
}

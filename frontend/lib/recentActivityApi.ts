import { apiFetch } from './api';

export interface RecentActivity {
  id: string;
  initials: string;
  name: string;
  action: string;
  time: string;
  type: string;
  metadata?: {
    clientId?: string;
    letterId?: string;
    disputeId?: string;
    reportId?: string;
    bureau?: string;
    round?: number;
    status?: string;
    email?: string;
    provider?: string;
    itemsCount?: number;
  };
}

export interface RecentActivitiesResponse {
  success: boolean;
  message: string;
  data: RecentActivity[];
}

/**
 * Fetch recent activities from the backend
 * @param limit - Number of activities to fetch (default: 10)
 * @returns Promise<RecentActivitiesResponse>
 */
export async function fetchRecentActivities(limit: number = 10): Promise<RecentActivitiesResponse> {
  try {
    const response = await apiFetch(`/recent-activities?limit=${limit}`, {
      method: 'GET',
    });
    
    return response;
  } catch (error) {
    console.error('Error fetching recent activities:', error);
    throw error;
  }
}

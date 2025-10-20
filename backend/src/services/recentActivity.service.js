import Client from '../models/Client.js';
import Letter from '../models/Letter.js';
import Dispute from '../models/dispute.model.js';
import CreditReport from '../models/creditReport.model.js';
import User from '../models/User.js';

class RecentActivityService {
  /**
   * Get recent activities from all sources
   * @param {number} limit - Number of activities to return (default: 10)
   * @returns {Promise<Array>} Array of recent activities
   */
  async getRecentActivities(limit = 10) {
    try {
      const activities = [];

      // Get recent client activities
      const recentClients = await Client.find()
        .populate('createdBy', 'firstName lastName')
        .sort({ createdAt: -1 })
        .limit(5);

      recentClients.forEach(client => {
        activities.push({
          id: `client_${client._id}`,
          type: 'client_created',
          title: 'New client added',
          description: `${client.firstName} ${client.lastName}`,
          initials: this.getInitials(client.firstName, client.lastName),
          timestamp: client.createdAt,
          user: client.createdBy ? {
            name: `${client.createdBy.firstName} ${client.createdBy.lastName}`,
            initials: this.getInitials(client.createdBy.firstName, client.createdBy.lastName)
          } : null,
          metadata: {
            clientId: client._id,
            email: client.email,
            status: client.status
          }
        });
      });

      // Get recent letter activities
      const recentLetters = await Letter.find()
        .populate('clientId', 'firstName lastName email')
        .populate('createdBy', 'firstName lastName')
        .sort({ createdAt: -1 })
        .limit(5);

      recentLetters.forEach(letter => {
        const clientName = letter.clientId 
          ? `${letter.clientId.firstName} ${letter.clientId.lastName}`
          : letter.email || 'Unknown Client';
        
        activities.push({
          id: `letter_${letter._id}`,
          type: 'letter_created',
          title: 'Dispute letter created',
          description: `${letter.letterName} for ${clientName}`,
          initials: this.getInitials(letter.clientId?.firstName || 'U', letter.clientId?.lastName || 'C'),
          timestamp: letter.createdAt,
          user: letter.createdBy ? {
            name: `${letter.createdBy.firstName} ${letter.createdBy.lastName}`,
            initials: this.getInitials(letter.createdBy.firstName, letter.createdBy.lastName)
          } : null,
          metadata: {
            letterId: letter._id,
            bureau: letter.bureau,
            round: letter.round,
            status: letter.status,
            clientId: letter.clientId?._id
          }
        });
      });

      // Get recent dispute activities
      const recentDisputes = await Dispute.find()
        .sort({ createdAt: -1 })
        .limit(5);

      recentDisputes.forEach(dispute => {
        activities.push({
          id: `dispute_${dispute._id}`,
          type: 'dispute_created',
          title: 'Dispute initiated',
          description: `${dispute.clientName} - ${dispute.bureau} Round ${dispute.round}`,
          initials: this.getInitials(dispute.clientName.split(' ')[0], dispute.clientName.split(' ')[1] || ''),
          timestamp: dispute.createdAt,
          user: null, // Disputes don't have createdBy field in current model
          metadata: {
            disputeId: dispute._id,
            bureau: dispute.bureau,
            round: dispute.round,
            status: dispute.status,
            itemsCount: dispute.items?.length || 0
          }
        });
      });

      // Get recent credit report activities
      const recentReports = await CreditReport.find()
        .sort({ createdAt: -1 })
        .limit(5);

      recentReports.forEach(report => {
        activities.push({
          id: `report_${report._id}`,
          type: 'credit_report_imported',
          title: 'Credit report imported',
          description: report.email,
          initials: this.getInitials(report.email.split('@')[0], ''),
          timestamp: report.createdAt,
          user: null, // Credit reports don't have createdBy field in current model
          metadata: {
            reportId: report._id,
            email: report.email,
            provider: report.provider
          }
        });
      });

      // Sort all activities by timestamp (most recent first)
      activities.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

      // Return only the requested number of activities
      return activities.slice(0, limit);

    } catch (error) {
      console.error('Error fetching recent activities:', error);
      throw new Error('Failed to fetch recent activities');
    }
  }

  /**
   * Get initials from first and last name
   * @param {string} firstName 
   * @param {string} lastName 
   * @returns {string} Initials
   */
  getInitials(firstName, lastName) {
    const first = firstName ? firstName.charAt(0).toUpperCase() : '';
    const last = lastName ? lastName.charAt(0).toUpperCase() : '';
    return first + last;
  }

  /**
   * Format time ago string
   * @param {Date} timestamp 
   * @returns {string} Formatted time string
   */
  formatTimeAgo(timestamp) {
    const now = new Date();
    const diff = now - new Date(timestamp);
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 60) {
      return minutes <= 1 ? '1 minute ago' : `${minutes} minutes ago`;
    } else if (hours < 24) {
      return hours === 1 ? '1 hour ago' : `${hours} hours ago`;
    } else if (days < 7) {
      return days === 1 ? '1 day ago' : `${days} days ago`;
    } else {
      return new Date(timestamp).toLocaleDateString();
    }
  }
}

export default new RecentActivityService();

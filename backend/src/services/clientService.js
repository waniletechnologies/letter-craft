import Client from '../models/Client.js';

class ClientService {
  /**
   * Create a new client
   * @param {Object} clientData - Client data
   * @param {string} createdBy - Authenticated user ID
   * @returns {Promise<Object>} Created client
   */
  async createClient(clientData, createdBy) {
    try {
      if (!clientData || typeof clientData !== 'object') {
        throw new Error('Invalid request body');
      }
      if (!clientData.email) {
        throw new Error('Email is required');
      }
      if (!clientData.ssn) {
        throw new Error('SSN is required');
      }
      // Check if client with same email already exists
      const existingClient = await Client.findOne({ email: clientData.email });
      if (existingClient) {
        throw new Error('Client with this email already exists');
      }

      // Check if client with same SSN already exists
      const existingSSN = await Client.findOne({ ssn: clientData.ssn });
      if (existingSSN) {
        throw new Error('Client with this SSN already exists');
      }

      const client = new Client({
        ...clientData,
        createdBy,
        lastModifiedBy: createdBy
      });

      const savedClient = await client.save();
      return savedClient;
    } catch (error) {
      if (error.code === 11000) {
        // MongoDB duplicate key error
        const field = Object.keys(error.keyPattern)[0];
        throw new Error(`Client with this ${field} already exists`);
      }
      throw error;
    }
  }

  /**
   * Get all clients with pagination and filtering
   * @param {Object} queryParams - Query parameters
   * @returns {Promise<Object>} Paginated clients data
   */
  async getAllClients(queryParams) {
    try {
      const {
        page = 1,
        limit = 10,
        search = '',
        status = '',
        sortBy = 'createdAt',
        sortOrder = 'desc'
      } = queryParams;

      // Build filter object
      const filter = {};
      
      if (status) {
        filter.status = status;
      }

      if (search) {
        filter.$or = [
          { firstName: { $regex: search, $options: 'i' } },
          { lastName: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } },
          { fullName: { $regex: search, $options: 'i' } }
        ];
      }

      // Calculate pagination
      const skip = (page - 1) * limit;

      // Build sort object
      const sort = {};
      sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

      // Execute query
      const [clients, totalCount] = await Promise.all([
        Client.find(filter)
          .select('-ssn') // Exclude SSN from list view
          .sort(sort)
          .skip(skip)
          .limit(limit),
        Client.countDocuments(filter)
      ]);

      // Calculate pagination info
      const totalPages = Math.ceil(totalCount / limit);
      const hasNextPage = page < totalPages;
      const hasPrevPage = page > 1;

      return {
        clients,
        pagination: {
          currentPage: page,
          totalPages,
          totalCount,
          limit,
          hasNextPage,
          hasPrevPage
        }
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get client by ID
   * @param {string} clientId - Client ID
   * @param {boolean} includeSSN - Whether to include SSN in response
   * @returns {Promise<Object>} Client data
   */
  async getClientById(clientId, includeSSN = false) {
    try {
      const selectFields = includeSSN ? '' : '-ssn';
      const client = await Client.findById(clientId)
        .select(selectFields);

      if (!client) {
        throw new Error('Client not found');
      }

      return client;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Update client by ID
   * @param {string} clientId - Client ID
   * @param {Object} updateData - Data to update
   * @param {string} modifiedBy - Authenticated user ID
   * @returns {Promise<Object>} Updated client
   */
  async updateClient(clientId, updateData, modifiedBy) {
    try {
      const existingClient = await Client.findById(clientId);
      if (!existingClient) {
        throw new Error('Client not found');
      }

      if (updateData.email && updateData.email !== existingClient.email) {
        const emailExists = await Client.findOne({ 
          email: updateData.email, 
          _id: { $ne: clientId } 
        });
        if (emailExists) {
          throw new Error('Client with this email already exists');
        }
      }

      // Check for SSN conflicts (if SSN is being updated)
      if (updateData.ssn && updateData.ssn !== existingClient.ssn) {
        const ssnExists = await Client.findOne({ 
          ssn: updateData.ssn, 
          _id: { $ne: clientId } 
        });
        if (ssnExists) {
          throw new Error('Client with this SSN already exists');
        }
      }

      const updatedClient = await Client.findByIdAndUpdate(
        clientId,
        {
          ...updateData,
          lastModifiedBy: modifiedBy
        },
        { 
          new: true, 
          runValidators: true,
          select: '-ssn' // Exclude SSN from response by default
        }
      );

      return updatedClient;
    } catch (error) {
      if (error.code === 11000) {
        const field = Object.keys(error.keyPattern)[0];
        throw new Error(`Client with this ${field} already exists`);
      }
      throw error;
    }
  }

  /**
   * Delete client by ID
   * @param {string} clientId - Client ID
   * @returns {Promise<Object>} Deletion result
   */
  async deleteClient(clientId) {
    try {
      const client = await Client.findById(clientId);
      if (!client) {
        throw new Error('Client not found');
      }

      await Client.findByIdAndDelete(clientId);
      return { message: 'Client deleted successfully' };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Update client status
   * @param {string} clientId - Client ID
   * @param {string} status - New status
   * @param {string} modifiedBy - Authenticated user ID
   * @returns {Promise<Object>} Updated client
   */
  async updateClientStatus(clientId, status, modifiedBy) {
    try {
      const validStatuses = ['active', 'inactive', 'pending', 'archived'];
      if (!validStatuses.includes(status)) {
        throw new Error('Invalid status. Must be one of: active, inactive, pending, archived');
      }

      const updatedClient = await Client.findByIdAndUpdate(
        clientId,
        { 
          status,
          lastModifiedBy: modifiedBy
        },
        { 
          new: true, 
          runValidators: true,
          select: '-ssn'
        }
      );

      if (!updatedClient) {
        throw new Error('Client not found');
      }

      return updatedClient;
    } catch (error) {
      throw error;
    }
  }

  // Note: Document upload functionality removed for now
  // Will be implemented later when needed

  /**
   * Get client statistics
   * @returns {Promise<Object>} Client statistics
   */
  async getClientStatistics() {
    try {
      const [
        totalClients,
        activeClients,
        pendingClients,
        inactiveClients,
        archivedClients,
        recentClients
      ] = await Promise.all([
        Client.countDocuments(),
        Client.countDocuments({ status: 'active' }),
        Client.countDocuments({ status: 'pending' }),
        Client.countDocuments({ status: 'inactive' }),
        Client.countDocuments({ status: 'archived' }),
        Client.countDocuments({
          createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } // Last 30 days
        })
      ]);

      return {
        total: totalClients,
        active: activeClients,
        pending: pendingClients,
        inactive: inactiveClients,
        archived: archivedClients,
        recent: recentClients
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Search clients by various criteria
   * @param {string} searchTerm - Search term
   * @param {number} limit - Maximum number of results
   * @returns {Promise<Array>} Search results
   */
  async searchClients(searchTerm, limit = 10) {
    try {
      const clients = await Client.find({
        $or: [
          { firstName: { $regex: searchTerm, $options: 'i' } },
          { lastName: { $regex: searchTerm, $options: 'i' } },
          { email: { $regex: searchTerm, $options: 'i' } },
          { fullName: { $regex: searchTerm, $options: 'i' } }
        ]
      })
      .select('-ssn')
      .limit(limit)
      .sort({ createdAt: -1 });

      return clients;
    } catch (error) {
      throw error;
    }
  }
}

export default new ClientService();
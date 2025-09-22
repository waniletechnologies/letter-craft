// controllers/clientController.js
import clientService from "../services/clientService.js";
import asyncHandler from "../middlewares/asyncHandler.js";
import multer from "multer";

// Configure multer for memory storage
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    // Accept images, PDFs, and common document formats
    const allowedMimes = [
      "image/jpeg",
      "image/png",
      "image/gif",
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "text/plain",
    ];

    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Invalid file type"), false);
    }
  },
});

class ClientController {
  createClient = asyncHandler(async (req, res) => {
    const clientData = req.body;
    const createdBy = req.user?.id;
    const client = await clientService.createClient(clientData, createdBy);

    res.status(201).json({
      status: true,
      message: "Client created successfully",
      data: client,
    });
  });

  getAllClients = asyncHandler(async (req, res) => {
    const queryParams = req.validatedQuery || req.query;
    const result = await clientService.getAllClients(queryParams);

    res.status(200).json({
      status: true,
      message: "Clients retrieved successfully",
      data: result.clients,
      pagination: result.pagination,
    });
  });

  getClientById = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const client = await clientService.getClientById(id);

    res.status(200).json({
      status: true,
      message: "Client retrieved successfully",
      data: client,
    });
  });

  updateClient = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const updateData = req.body;
    const modifiedBy = req.user?.id;
    const client = await clientService.updateClient(id, updateData, modifiedBy);

    res.status(200).json({
      status: true,
      message: "Client updated successfully",
      data: client,
    });
  });

  deleteClient = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const modifiedBy = req.user?.id;
    await clientService.deleteClient(id);

    res.status(200).json({
      status: true,
      message: "Client deleted successfully",
    });
  });

  updateClientStatus = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;
    const modifiedBy = req.user?.id;
    const client = await clientService.updateClientStatus(
      id,
      status,
      modifiedBy
    );

    res.status(200).json({
      status: true,
      message: "Client status updated successfully",
      data: client,
    });
  });

  getClientStatistics = asyncHandler(async (req, res) => {
    const statistics = await clientService.getClientStatistics();

    res.status(200).json({
      status: true,
      message: "Client statistics retrieved successfully",
      data: statistics,
    });
  });

  searchClients = asyncHandler(async (req, res) => {
    const { q: searchTerm, limit = 10 } = req.query;

    if (!searchTerm || searchTerm.trim().length < 2) {
      return res.status(400).json({
        status: false,
        message: "Search term must be at least 2 characters long",
      });
    }

    const clients = await clientService.searchClients(
      searchTerm.trim(),
      parseInt(limit)
    );

    res.status(200).json({
      status: true,
      message: "Search completed successfully",
      data: clients,
    });
  });

  bulkUpdateStatus = asyncHandler(async (req, res) => {
    const { clientIds, status } = req.body;

    if (!Array.isArray(clientIds) || clientIds.length === 0) {
      return res.status(400).json({
        status: false,
        message: "Client IDs array is required",
      });
    }

    const validStatuses = ["active", "inactive", "pending", "archived"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        status: false,
        message:
          "Invalid status. Must be one of: active, inactive, pending, archived",
      });
    }

    const results = [];
    const errors = [];

    for (const clientId of clientIds) {
      try {
        const client = await clientService.updateClientStatus(clientId, status);
        results.push({ id: clientId, status: "success", data: client });
      } catch (error) {
        errors.push({ id: clientId, status: "error", message: error.message });
      }
    }

    res.status(200).json({
      status: true,
      message: "Bulk status update completed",
      data: {
        successful: results,
        failed: errors,
        summary: {
          total: clientIds.length,
          successful: results.length,
          failed: errors.length,
        },
      },
    });
  });
  uploadFile = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { field } = req.body;
    const uploadedBy = req.user?.id;

    if (!req.file) {
      return res.status(400).json({
        status: false,
        message: "No file uploaded",
      });
    }

    const validFields = [
      "driversLicense",
      "proofOfSS",
      "proofOfAddress",
      "ftcReport",
    ];
    if (!validFields.includes(field)) {
      return res.status(400).json({
        status: false,
        message: "Invalid field name",
      });
    }

    const client = await clientService.uploadFile(
      id,
      field,
      req.file,
      uploadedBy
    );

    res.status(200).json({
      status: true,
      message: "File uploaded successfully",
      data: client,
    });
  });

  /**
   * Get file URL
   */
  getFileUrl = asyncHandler(async (req, res) => {
    const { id, field, fileId } = req.params;

    const fileInfo = await clientService.getFileUrl(id, field, fileId);

    res.status(200).json({
      status: true,
      message: "File URL generated successfully",
      data: fileInfo,
    });
  });

  /**
   * Delete file
   */
  deleteFile = asyncHandler(async (req, res) => {
    const { id, field, fileId } = req.params;

    const client = await clientService.deleteFile(id, field, fileId);

    res.status(200).json({
      status: true,
      message: "File deleted successfully",
      data: client,
    });
  });

  /**
   * Get all files for a client
   */
  getClientFiles = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const files = await clientService.getClientFiles(id);

    res.status(200).json({
      status: true,
      message: "Client files retrieved successfully",
      data: files,
    });
  });

  /**
   * Middleware for file upload
   */
  uploadMiddleware = (req, res, next) => {
    upload.single("file")(req, res, (err) => {
      if (err instanceof multer.MulterError) {
        if (err.code === "LIMIT_FILE_SIZE") {
          return res.status(400).json({
            status: false,
            message: "File too large. Maximum size is 10MB",
          });
        }
        return res.status(400).json({
          status: false,
          message: err.message,
        });
      } else if (err) {
        return res.status(400).json({
          status: false,
          message: err.message,
        });
      }
      next();
    });
  };
}

export default new ClientController();

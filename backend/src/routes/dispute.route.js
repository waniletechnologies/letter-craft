import express from "express";
import {
  createDisputeController,
  getDisputesController,
  getDisputeByIdController,
  updateDisputeController,
  deleteDisputeController,
  getDisputeStatsController,
} from "../controllers/dispute.controller.js";

const router = express.Router();

router.post("/", createDisputeController); // Create a new dispute
router.get("/", getDisputesController); // Get all disputes
router.get("/stats", getDisputeStatsController);
router.get("/:id", getDisputeByIdController); // Get dispute by ID
router.put("/:id", updateDisputeController); // Update dispute
router.delete("/:id", deleteDisputeController); // Delete dispute

export default router;

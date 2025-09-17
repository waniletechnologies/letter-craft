import {
  createDispute,
  getAllDisputes,
  getDisputeById,
  updateDispute,
  deleteDispute,
} from "../services/dispute.service.js";

// Create
export const createDisputeController = async (req, res) => {
  try {
    const dispute = await createDispute(req.body);
    res.status(201).json({ success: true, data: dispute });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Get all
export const getDisputesController = async (req, res) => {
  try {
    const disputes = await getAllDisputes();
    res.json({ success: true, data: disputes });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Get by ID
export const getDisputeByIdController = async (req, res) => {
  try {
    const dispute = await getDisputeById(req.params.id);
    if (!dispute)
      return res
        .status(404)
        .json({ success: false, message: "Dispute not found" });
    res.json({ success: true, data: dispute });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Update
export const updateDisputeController = async (req, res) => {
  try {
    const dispute = await updateDispute(req.params.id, req.body);
    if (!dispute)
      return res
        .status(404)
        .json({ success: false, message: "Dispute not found" });
    res.json({ success: true, data: dispute });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Delete
export const deleteDisputeController = async (req, res) => {
  try {
    const dispute = await deleteDispute(req.params.id);
    if (!dispute)
      return res
        .status(404)
        .json({ success: false, message: "Dispute not found" });
    res.json({ success: true, message: "Dispute deleted successfully" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getDisputeStatsController = async (req, res) => {
  try {
    console.log("📊 [getDisputeStats] Fetching dispute stats...");
    const disputes = await getAllDisputes(); // Should return all disputes with createdAt

    // Month names for display
    const monthNames = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];
    const monthlyCounts = monthNames.map((m) => ({ month: m, disputes: 0 }));

    disputes.forEach((d) => {
      const date = new Date(d.createdAt || d.createdDate);
      const idx = date.getMonth();
      if (idx >= 0 && idx < 12) monthlyCounts[idx].disputes++;
    });

    res.json({
      success: true,
      total: disputes.length,
      monthlyCounts,
    });
  } catch (err) {
    console.error("🔥 Error fetching dispute stats:", err.message);
    res.status(500).json({ success: false, message: err.message });
  }
};
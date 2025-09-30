import { Router } from 'express';
import { 
  listLetters, 
  getLetter, 
  saveLetter, 
  getClientLetters, 
  getLetterById, 
  updateLetterStatus, 
  deleteLetter,
  sendLetterEmail 
} from "../controllers/letter.controller.js";
import { requireAuth } from "../middlewares/auth.middleware.js";

const router = Router();

// Public routes for letter templates
router.get("/letters", listLetters);
router.get("/letters/:category/:name", getLetter);

// Protected routes for letter management
router.post("/letters", requireAuth, saveLetter);
router.get("/letters/client/:clientId", requireAuth, getClientLetters);
router.get("/letters/letter/:letterId", requireAuth, getLetterById);
router.put("/letters/:letterId/status", requireAuth, updateLetterStatus);
router.delete("/letters/:letterId", requireAuth, deleteLetter);

// Get all letters (for dashboard)
router.get("/letters-all", requireAuth, async (req, res) => {
  try {
    const letters = await (await import("../models/Letter.js")).default
      .find({})
      .populate("clientId", "firstName lastName email")
      .sort({ createdAt: -1 });
    res.json({ success: true, data: letters });
  } catch (e) {
    console.error("Error fetching all letters:", e);
    res.status(500).json({ success: false, message: "Failed to fetch letters" });
  }
});

// Send letter via email (localmail/cloudmail)
router.post("/letters/:letterId/send", requireAuth, sendLetterEmail);

export default router;
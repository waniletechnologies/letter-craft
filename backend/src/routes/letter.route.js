import { Router } from 'express';
import { 
  listLetters, 
  getLetter, 
  saveLetter, 
  getClientLetters, 
  getLetterById, 
  updateLetterStatus, 
  deleteLetter, 
  rewriteLetter
} from "../controllers/letter.controller.js";
import { requireAuth } from "../middlewares/auth.middleware.js";

const router = Router();

// Public routes for letter templates
router.get("/letters", listLetters);
router.get("/letters/:category/:name", getLetter);

// AI rewrite endpoint
router.post("/letters/rewrite", rewriteLetter);

// Protected routes for letter management
router.post("/letters", requireAuth, saveLetter);
router.get("/letters/client/:clientId", requireAuth, getClientLetters);
router.get("/letters/letter/:letterId", requireAuth, getLetterById);
router.put("/letters/:letterId/status", requireAuth, updateLetterStatus);
router.delete("/letters/:letterId", requireAuth, deleteLetter);

export default router;
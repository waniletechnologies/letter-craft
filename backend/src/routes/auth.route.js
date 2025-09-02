// routes/authRoutes.js
import express from "express";
import {
  loginHandler,
  requestResetHandler,
  verifyCodeHandler,
  resetPasswordHandler,
  meHandler,
} from "../controllers/auth.controller.js";

const router = express.Router();

// POST /api/auth/login
router.post("/login", loginHandler);

// POST /api/auth/request-reset
router.post("/request-reset", requestResetHandler);

// POST /api/auth/verify-code
router.post("/verify-code", verifyCodeHandler);

// POST /api/auth/reset-password
router.post("/reset-password", resetPasswordHandler);

router.get("/me", meHandler);

export default router;

import express from "express";
import {
  getCreditReport,
  getStoredCreditReport,
  getAllStoredCreditReports,
  getCreditReportStats,
  updateAccountInfo,
  createAccount,
} from "../controllers/creditReport.controller.js";

const router = express.Router();

router.post("/credit-report", getCreditReport);
router.get("/credit-report", getAllStoredCreditReports);
router.get("/credit-report/stats", getCreditReportStats);
router.put("/credit-report/account", updateAccountInfo);
router.post("/credit-report/account", createAccount);
router.get("/credit-report/:email", getStoredCreditReport);

export default router;

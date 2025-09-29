import express from "express";
import {
  getCreditReport,
  getStoredCreditReport,
  getAllStoredCreditReports,
  getCreditReportStats,
  updateAccountInfo,
} from "../controllers/creditReport.controller.js";

const router = express.Router();

router.post("/credit-report", getCreditReport);
router.get("/credit-report", getAllStoredCreditReports);
router.get("/credit-report/stats", getCreditReportStats);
router.put("/credit-report/account", updateAccountInfo);
router.get("/credit-report/:email", getStoredCreditReport);

export default router;

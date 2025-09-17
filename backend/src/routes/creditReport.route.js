import express from "express";
import {
  getCreditReport,
  getStoredCreditReport,
  getAllStoredCreditReports,
  getCreditReportStats
} from "../controllers/creditReport.controller.js";

const router = express.Router();

router.post("/credit-report", getCreditReport);
router.get("/credit-report", getAllStoredCreditReports); // 👈 Add the new route for all reports
router.get("/credit-report/stats", getCreditReportStats);
router.get("/credit-report/:email", getStoredCreditReport);

export default router;

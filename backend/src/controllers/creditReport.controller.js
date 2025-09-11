import CreditReport from "../models/creditReport.model.js";
import {
  fetchApiToken,
  fetchMemberReport,
} from "../services/creditReport.service.js";
import {
  extractNegativeAccounts,
  extractInquiries,
  extractAccountInfo,
  extractPersonalInfo,
  extractCreditSummary,
  extractPublicRecords,
} from "../utils/index.js";

export const getCreditReport = async (req, res) => {
  const { username, password, provider, notes } = req.body;

  
    console.log("Report: ", username, password);
  try {
    // 🔎 Check if report for this email already exists
    const existingReport = await CreditReport.findOne({ email: username });
    if (existingReport) {
      return res.json({
        success: true,
        message: "Credit report already exists for this member",
        data: existingReport,
      });
    }

    // 🛠 Fetch and parse report if not already stored
    const token = await fetchApiToken();
    const reportData = await fetchMemberReport(token, username, password);

    const negatives = extractNegativeAccounts(reportData);
    const inquiries = extractInquiries(reportData);
    const accountInfoRaw = extractAccountInfo(reportData);
    const creditSummary = extractCreditSummary(reportData);
    const personalInfo = extractPersonalInfo(reportData);
    const publicRecords = extractPublicRecords(reportData);

    // 👉 Add status flag to accounts
    const accountInfo = {};
    for (const bureau of ["Experian", "TransUnion", "Equifax"]) {
      accountInfo[bureau] = accountInfoRaw[bureau].map((acc) => ({
        ...acc,
        status: "Negative",
      }));
    }

    // 💾 Save new report
    const report = await CreditReport.create({
      email: username,
      provider: provider || "myfreescorenow",
      notes,
      negatives,
      inquiries,
      accountInfo,
      creditSummary,
      personalInfo,
      publicRecords,
    });
    await report.save();

    res.json({
      success: true,
      message: "Credit report saved and fetched successfully",
      data: report,
    });
  } catch (err) {
    console.error("Error saving credit report:", err.message);
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getStoredCreditReport = async (req, res) => {
  const { email } = req.params;

  try {
    const report = await CreditReport.findOne({ email });

    if (!report) {
      return res
        .status(404)
        .json({ success: false, message: "Credit report not found" });
    }

    res.json({
      success: true,
      message: "Credit report fetched successfully",
      data: report,
    });
  } catch (err) {
    console.error("Error fetching credit report:", err.message);
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getAllStoredCreditReports = async (req, res) => {
  try {
    const reports = await CreditReport.find({}); // Fetches all documents

    if (!reports || reports.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: "No credit reports found" });
    }

    res.json({
      success: true,
      message: "Credit reports fetched successfully",
      data: reports,
    });
  } catch (err) {
    console.error("Error fetching credit reports:", err.message);
    res.status(500).json({ success: false, message: err.message });
  }
};
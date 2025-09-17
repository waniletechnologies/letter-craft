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

  console.log("📩 [getCreditReport] Incoming request body:", {
    username,
    password: password ? "***MASKED***" : "❌ MISSING",
    provider,
    notes,
  });

  if (!username) {
    console.warn("⚠️ [getCreditReport] No username/email provided.");
    return res
      .status(400)
      .json({ success: false, message: "Username/email is required" });
  }

  try {
    console.log(
      "🔎 [getCreditReport] Checking for existing report for:",
      username
    );
    const existingReport = await CreditReport.findOne({ email: username });

    if (existingReport) {
      console.info(
        "ℹ️ [getCreditReport] Existing report found:",
        existingReport._id
      );
      return res.json({
        success: true,
        message: "Credit report already exists for this member",
        data: existingReport,
      });
    }

    console.log(
      "📡 [getCreditReport] No existing report. Fetching API token..."
    );
    const token = await fetchApiToken();
    if (!token) {
      console.error("❌ [getCreditReport] Failed to fetch API token.");
      return res
        .status(500)
        .json({ success: false, message: "Failed to retrieve API token" });
    }
    console.log(
      "✅ [getCreditReport] Token fetched:",
      token ? "Token received" : token
    );

    console.log(`📥 [getCreditReport] Fetching member report for ${username}`);
    const reportData = await fetchMemberReport(token, username, password);
    if (!reportData) {
      console.error("❌ [getCreditReport] No report data returned from API.");
      return res
        .status(502)
        .json({ success: false, message: "Failed to fetch member report" });
    }
    console.log(
      "📑 [getCreditReport] Raw report data length:",
      JSON.stringify(reportData).length
    );

    // Extract and log potential issues with report sections
    console.log("🔧 [getCreditReport] Extracting negative accounts...");
    const negatives = extractNegativeAccounts(reportData);
    console.log(
      "🔧 [getCreditReport] Negatives extracted:",
      negatives?.length ?? 0
    );

    console.log("🔧 [getCreditReport] Extracting inquiries...");
    const inquiries = extractInquiries(reportData);
    console.log(
      "🔧 [getCreditReport] Inquiries extracted:",
      inquiries?.length ?? 0
    );

    console.log("🔧 [getCreditReport] Extracting account info...");
    const accountInfoRaw = extractAccountInfo(reportData);
    console.log(
      "🔧 [getCreditReport] Raw account info keys:",
      Object.keys(accountInfoRaw || {})
    );

    console.log("🔧 [getCreditReport] Extracting credit summary...");
    const creditSummary = extractCreditSummary(reportData);
    console.log("🔧 [getCreditReport] Credit summary:", creditSummary);

    console.log("🔧 [getCreditReport] Extracting personal info...");
    const personalInfo = extractPersonalInfo(reportData);
    console.log("🔧 [getCreditReport] Personal info:", personalInfo);

    console.log("🔧 [getCreditReport] Extracting public records...");
    const publicRecords = extractPublicRecords(reportData);
    console.log(
      "🔧 [getCreditReport] Public records extracted:",
      publicRecords?.length ?? 0
    );

    // Add status flags to accounts
    const accountInfo = {};
    for (const bureau of ["Experian", "TransUnion", "Equifax"]) {
      const accounts = accountInfoRaw?.[bureau] || [];
      accountInfo[bureau] = accounts.map((acc, idx) => {
        if (!acc)
          console.warn(
            `⚠️ [getCreditReport] Empty account entry at index ${idx} for ${bureau}`
          );
        return {
          ...acc,
          status: "Negative",
        };
      });
      console.log(
        `📊 [getCreditReport] ${bureau} accounts processed:`,
        accountInfo[bureau].length
      );
    }

    console.log("💾 [getCreditReport] Saving new report for:", username);
    const report = new CreditReport({
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
    await report.save({ writeConcern: { w: "majority" } });

    console.log("✅ [getCreditReport] Report saved with _id:", report._id);

    // Confirm write
    const confirmWrite = await CreditReport.collection.findOne({
      _id: report._id,
    });
    if (!confirmWrite) {
      console.error(
        "❌ [getCreditReport] MongoDB write confirmation failed for:",
        report._id
      );
      return res
        .status(500)
        .json({ success: false, message: "Failed to confirm report storage" });
    }
    console.log("✅ [getCreditReport] MongoDB write confirmed.");

    res.json({
      success: true,
      message: "Credit report saved and fetched successfully",
      data: report,
    });
  } catch (err) {
    console.error("🔥 [getCreditReport] Error saving credit report:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};


export const getStoredCreditReport = async (req, res) => {
  // Decode in case the frontend sent %40 for '@'
  const email = decodeURIComponent(req.params.email);
  console.log("🔎 Decoded email param:", email);

  try {
    const report = await CreditReport.findOne({ email });
    if (!report) {
      console.log("⚠️ Report not found for:", email);
      return res
        .status(404)
        .json({ success: false, message: "Credit report not found" });
    }
    console.log("✅ Report found for:", email);
    res.json({
      success: true,
      message: "Credit report fetched successfully",
      data: report,
    });
  } catch (err) {
    console.error("🔥 Error fetching credit report:", err.message);
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

// 📊 Credit report monthly stats
export const getCreditReportStats = async (req, res) => {
  try {
    const allReports = await CreditReport.find({}, { createdAt: 1 }).lean();

    // Group counts by month (Jan, Feb, ...)
    const monthNames = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
    const monthlyCounts = monthNames.map((m) => ({ month: m, reports: 0 }));

    allReports.forEach((r) => {
      const date = new Date(r.createdAt);
      const month = monthNames[date.getMonth()];
      const idx = monthlyCounts.findIndex((m) => m.month === month);
      if (idx !== -1) monthlyCounts[idx].reports += 1;
    });

    const total = allReports.length;
    res.json({
      success: true,
      total,
      monthlyCounts,
    });
  } catch (err) {
    console.error("🔥 Error fetching credit report stats:", err.message);
    res.status(500).json({ success: false, message: err.message });
  }
};

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

// controllers/creditReport.controller.js - Add this new function
// controllers/creditReport.controller.js
// controllers/creditReport.controller.js
// Update account information
export const updateAccountInfo = async (req, res) => {
  const { email, bureau, accountId, updates } = req.body;

  try {
    console.log("📧 Email:", email);
    console.log("🏢 Bureau:", bureau);
    console.log("🔍 Account ID:", accountId);
    console.log("🔄 Updates:", JSON.stringify(updates, null, 2));

    // Find the credit report for this email
    const creditReport = await CreditReport.findOne({ email });
    if (!creditReport) {
      return res.status(404).json({
        success: false,
        message: "Credit report not found for this email",
      });
    }

    // Check if accountInfo exists and has the bureau
    if (!creditReport.accountInfo || !creditReport.accountInfo[bureau]) {
      return res.status(404).json({
        success: false,
        message: `No accounts found for bureau: ${bureau}`,
      });
    }

    // Find the account to update
    const accounts = creditReport.accountInfo[bureau];
    const accountIndex = accounts.findIndex(
      (acc) => acc.accountNumber === accountId
    );

    if (accountIndex === -1) {
      return res.status(404).json({
        success: false,
        message: `Account not found in ${bureau} bureau`,
      });
    }

    // Update the account fields
    const accountToUpdate = accounts[accountIndex];
    
    // Apply updates to the account
    Object.keys(updates).forEach((key) => {
      if (updates[key] !== undefined) {
        accountToUpdate[key] = updates[key];
      }
    });

    // Mark the accountInfo field as modified
    creditReport.markModified('accountInfo');
    
    // Save the entire document
    await creditReport.save();

    console.log("✅ Account updated successfully in database");
    console.log("📊 Updated account:", accountToUpdate);

    res.json({
      success: true,
      message: "Account updated successfully",
      data: accountToUpdate,
    });
  } catch (err) {
    console.error("❌ Error updating account info:", err);
    res.status(500).json({ 
      success: false, 
      message: err.message 
    });
  }
};

// Create a new account in credit report
export const createAccount = async (req, res) => {
  const { email, bureau, accountData } = req.body;

  try {
    console.log("📧 Email:", email);
    console.log("🏢 Bureau:", bureau);
    console.log("📊 Account Data:", JSON.stringify(accountData, null, 2));

    // Validate required fields
    if (!email || !bureau || !accountData) {
      return res.status(400).json({
        success: false,
        message: "Email, bureau, and account data are required",
      });
    }

    const { accountName, accountNumber, balance, dateOpened } = accountData;

    if (!accountName || !accountNumber) {
      return res.status(400).json({
        success: false,
        message: "Account name and account number are required",
      });
    }

    // Find the credit report for this email
    const creditReport = await CreditReport.findOne({ email });
    if (!creditReport) {
      return res.status(404).json({
        success: false,
        message: "Credit report not found for this email",
      });
    }

    // Initialize accountInfo if it doesn't exist
    if (!creditReport.accountInfo) {
      creditReport.accountInfo = {
        Experian: [],
        Equifax: [],
        TransUnion: []
      };
    }

    // Initialize bureau array if it doesn't exist
    if (!creditReport.accountInfo[bureau]) {
      creditReport.accountInfo[bureau] = [];
    }

    // Check if account with same number already exists
    const existingAccount = creditReport.accountInfo[bureau].find(
      (acc) => acc.accountNumber === accountNumber
    );

    if (existingAccount) {
      return res.status(409).json({
        success: false,
        message: `Account with number ${accountNumber} already exists in ${bureau} bureau`,
      });
    }

    // Normalize balance (accept numbers or formatted strings like "$1,234.56")
    const parsedBalance =
      typeof balance === "number"
        ? balance
        : parseFloat(String(balance ?? "").replace(/[^0-9.-]/g, ""));
    const safeBalance = Number.isFinite(parsedBalance) ? parsedBalance : 0;
    
    // Format balance as string like extracted accounts (e.g., "$1,234")
    const formattedHighBalance = safeBalance > 0 ? `$${safeBalance.toLocaleString()}` : "$0";

    // Create new account object
    const newAccount = {
      accountName: accountName.trim(),
      accountNumber: accountNumber.trim(),
      highBalance: formattedHighBalance,
      currentBalance: formattedHighBalance, // Use same value for both fields
      dateOpened: dateOpened || new Date().toISOString().split('T')[0],
      status: "Negative",
      createdAt: new Date(),
      updatedAt: new Date()
    };

    // Add the new account to the bureau
    creditReport.accountInfo[bureau].push(newAccount);

    // Mark the accountInfo field as modified
    creditReport.markModified('accountInfo');
    
    // Save the entire document
    await creditReport.save();

    console.log("✅ Account created successfully in database");
    console.log("📊 New account:", newAccount);

    // Also insert/update this account into Account Groups (newest-first regrouping)
    try {
      const accountGroupModule = await import("./accountGroup.controller.js");
      const AccountGroup = (await import("../models/accountGroup.model.js")).default;

      // Load or create AccountGroup document
      let accountGroupDoc = await AccountGroup.findOne({ email });
      if (!accountGroupDoc) {
        // If no groups exist, initialize groups from the report
        if (typeof accountGroupModule.createAccountGroups === "function") {
          // Mimic req/res for internal call
          await accountGroupModule.createAccountGroups(
            { body: { email } },
            { json: () => {}, status: () => ({ json: () => {} }) }
          );
          accountGroupDoc = await AccountGroup.findOne({ email });
        }
      }

      if (accountGroupDoc) {
        // Pull all existing accounts from groups
        const allExisting = Array.from(accountGroupDoc.groups.entries()).flatMap(
          ([groupName, accounts]) =>
            (accounts || []).map((acc, idx) => ({ ...acc.toObject?.() ?? acc, groupName, order: idx }))
        );

        // Push new account with bureau and default fields
        const enrichedNew = {
          ...newAccount,
          bureau,
          originalIndex: allExisting.length,
          groupName: "",
          order: 0,
        };

        // Merge and dedupe by bureau + accountNumber
        const byKey = new Map();
        const keyOf = (a) => `${a?.bureau || ""}:${(a?.accountNumber || "").trim()}`;
        for (const a of [...allExisting, enrichedNew]) {
          const k = keyOf(a);
          if (!k) continue;
          if (!byKey.has(k)) byKey.set(k, a);
        }
        const merged = Array.from(byKey.values());

        // Sort newest to oldest by dateOpened
        const parseDate = (d) => {
          if (!d) return new Date(0);
          const iso = new Date(d);
          if (!isNaN(iso.getTime())) return iso;
          const mmYyyy = /^(\d{1,2})\/(\d{4})$/.exec(String(d));
          if (mmYyyy) {
            const m = parseInt(mmYyyy[1], 10) - 1;
            const y = parseInt(mmYyyy[2], 10);
            return new Date(y, m, 1);
          }
          return new Date(0);
        };
        merged.sort((a, b) => parseDate(b.dateOpened) - parseDate(a.dateOpened));

        // Re-slice into groups of 5
        const newGroups = new Map();
        const newOrder = [];
        for (let i = 0; i < merged.length; i += 5) {
          const groupName = `Group${Math.floor(i / 5) + 1}`;
          const chunk = merged.slice(i, i + 5).map((acc, idx) => ({ ...acc, groupName, order: idx }));
          newGroups.set(groupName, chunk);
          newOrder.push(groupName);
        }

        accountGroupDoc.groups = newGroups;
        accountGroupDoc.groupOrder = newOrder;
        await accountGroupDoc.save();
      }
    } catch (e) {
      console.warn("⚠ Failed to update account groups after account creation:", e?.message || e);
    }

    res.json({
      success: true,
      message: "Account created successfully",
      data: newAccount,
    });
  } catch (err) {
    console.error("❌ Error creating account:", err);
    res.status(500).json({ 
      success: false, 
      message: err.message 
    });
  }
};
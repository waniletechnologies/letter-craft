// controllers/accountGroup.controller.js
import AccountGroup from "../models/accountGroup.model.js";
import CreditReport from "../models/creditReport.model.js";

// Helper: parse various date formats
const parseDate = (d) => {
  if (!d) return new Date(0);
  const iso = new Date(d);
  if (!isNaN(iso.getTime())) return iso;
  const mmYyyyMatch = /^(\d{1,2})\/(\d{4})$/.exec(String(d));
  if (mmYyyyMatch) {
    const m = parseInt(mmYyyyMatch[1], 10) - 1;
    const y = parseInt(mmYyyyMatch[2], 10);
    return new Date(y, m, 1);
  }
  return new Date(0);
};

// Helper: unique key for an account
const accountKey = (acc) => `${acc?.bureau || ""}:${(acc?.accountNumber || "").trim()}`;

// Helper: dedupe by account key, keep first occurrence
const dedupeAccounts = (arr) => {
  const seen = new Set();
  const out = [];
  for (const a of arr || []) {
    const k = accountKey(a);
    if (!k) continue;
    if (seen.has(k)) continue;
    seen.add(k);
    out.push(a);
  }
  return out;
};

// Create initial groups from credit report
export const createAccountGroups = async (req, res) => {
  const { email } = req.body;

  try {
    // Check if groups already exist
    const existingGroups = await AccountGroup.findOne({ email });
    if (existingGroups) {
      return res.json({
        success: true,
        message: "Account groups already exist",
        data: existingGroups,
      });
    }

    // Get the credit report
    const creditReport = await CreditReport.findOne({ email });
    if (!creditReport) {
      return res.status(404).json({
        success: false,
        message: "Credit report not found for this email",
      });
    }

    // Extract all accounts from all bureaus
    let allAccounts = [];
    Object.entries(creditReport.accountInfo || {}).forEach(([bureau, accounts]) => {
      accounts.forEach((account, index) => {
        allAccounts.push({
          ...account,
          bureau,
          originalIndex: index,
          order: allAccounts.length,
        });
      });
    });

    // Dedupe accounts first
    allAccounts = dedupeAccounts(allAccounts);

    // Group accounts by bureau first, then by date within each bureau
    const bureauGroups = {
      Experian: [],
      Equifax: [],
      TransUnion: []
    };

    // Separate accounts by bureau
    allAccounts.forEach(account => {
      if (account.bureau && bureauGroups[account.bureau]) {
        bureauGroups[account.bureau].push(account);
      }
    });

    // Sort each bureau's accounts by newest to oldest
    Object.keys(bureauGroups).forEach(bureau => {
      bureauGroups[bureau].sort((a, b) => parseDate(b.dateOpened) - parseDate(a.dateOpened));
    });

    // Create groups of 5, prioritizing same bureau
    const groups = new Map();
    const groupOrder = [];
    let groupCounter = 1;

    // Process each bureau separately
    Object.entries(bureauGroups).forEach(([bureau, accounts]) => {
      if (accounts.length === 0) return;

      // Create groups of 5 for this bureau
      for (let i = 0; i < accounts.length; i += 5) {
        const groupName = `${bureau} Group ${groupCounter}`;
        const groupAccounts = accounts.slice(i, i + 5).map((acc, idx) => ({
          ...acc,
          groupName,
          order: idx,
        }));

        groups.set(groupName, groupAccounts);
        groupOrder.push(groupName);
        groupCounter++;
      }
    });

    // Create account group document
    const accountGroup = new AccountGroup({
      email,
      groups,
      groupOrder,
    });

    await accountGroup.save();

    res.json({
      success: true,
      message: "Account groups created successfully",
      data: accountGroup,
    });
  } catch (err) {
    console.error("Error creating account groups:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// Get account groups for a user
export const getAccountGroups = async (req, res) => {
  const email = decodeURIComponent(req.params.email);

  try {
    const accountGroups = await AccountGroup.findOne({ email });
    if (!accountGroups) {
      return res.status(404).json({
        success: false,
        message: "Account groups not found for this email",
      });
    }

    res.json({
      success: true,
      message: "Account groups fetched successfully",
      data: accountGroups,
    });
  } catch (err) {
    console.error("Error fetching account groups:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// Update account groups (drag and drop, manual grouping)
export const updateAccountGroups = async (req, res) => {
  const { email, groups, groupOrder } = req.body;

  try {
    const accountGroup = await AccountGroup.findOne({ email });
    if (!accountGroup) {
      return res.status(404).json({
        success: false,
        message: "Account groups not found for this email",
      });
    }

    // Update groups and order
    if (groups) {
      accountGroup.groups = groups;
    }
    if (groupOrder) {
      accountGroup.groupOrder = groupOrder;
    }

    await accountGroup.save();

    res.json({
      success: true,
      message: "Account groups updated successfully",
      data: accountGroup,
    });
  } catch (err) {
    console.error("Error updating account groups:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// Move account between groups
export const moveAccount = async (req, res) => {
  const { email, accountId, sourceGroup, targetGroup, newIndex } = req.body;

  try {
    const accountGroup = await AccountGroup.findOne({ email });
    if (!accountGroup) {
      return res.status(404).json({
        success: false,
        message: "Account groups not found for this email",
      });
    }

    // Find account in source group
    const sourceAccounts = accountGroup.groups.get(sourceGroup) || [];
    const accountIndex = sourceAccounts.findIndex(
      (acc) =>
        acc.accountNumber === accountId || acc._id.toString() === accountId
    );

    if (accountIndex === -1) {
      return res.status(404).json({
        success: false,
        message: "Account not found in source group",
      });
    }

    const [movedAccount] = sourceAccounts.splice(accountIndex, 1);
    movedAccount.groupName = targetGroup;

    // Update source group
    accountGroup.groups.set(sourceGroup, sourceAccounts);

    // Add to target group at specified position
    const targetAccounts = accountGroup.groups.get(targetGroup) || [];
    targetAccounts.splice(newIndex, 0, movedAccount);

    // Update order values
    targetAccounts.forEach((acc, index) => {
      acc.order = index;
    });

    accountGroup.groups.set(targetGroup, targetAccounts);

    await accountGroup.save();

    res.json({
      success: true,
      message: "Account moved successfully",
      data: accountGroup,
    });
  } catch (err) {
    console.error("Error moving account:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// Create new group
export const createGroup = async (req, res) => {
  const { email, groupName } = req.body;

  try {
    const accountGroup = await AccountGroup.findOne({ email });
    if (!accountGroup) {
      return res.status(404).json({
        success: false,
        message: "Account groups not found for this email",
      });
    }

    if (accountGroup.groups.has(groupName)) {
      return res.status(400).json({
        success: false,
        message: "Group already exists",
      });
    }

    // Add new empty group
    accountGroup.groups.set(groupName, []);
    accountGroup.groupOrder.push(groupName);

    await accountGroup.save();

    res.json({
      success: true,
      message: "Group created successfully",
      data: accountGroup,
    });
  } catch (err) {
    console.error("Error creating group:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// Rename group
export const renameGroup = async (req, res) => {
  const { email, oldGroupName, newGroupName } = req.body;

  try {
    const accountGroup = await AccountGroup.findOne({ email });
    if (!accountGroup) {
      return res.status(404).json({
        success: false,
        message: "Account groups not found for this email",
      });
    }

    if (!accountGroup.groups.has(oldGroupName)) {
      return res.status(404).json({
        success: false,
        message: "Source group not found",
      });
    }

    if (accountGroup.groups.has(newGroupName)) {
      return res.status(400).json({
        success: false,
        message: "New group name already exists",
      });
    }

    // Move accounts to new group name
    const accounts = accountGroup.groups.get(oldGroupName);
    accounts.forEach((acc) => {
      acc.groupName = newGroupName;
    });

    accountGroup.groups.set(newGroupName, accounts);
    accountGroup.groups.delete(oldGroupName);

    // Update group order
    const orderIndex = accountGroup.groupOrder.indexOf(oldGroupName);
    if (orderIndex !== -1) {
      accountGroup.groupOrder[orderIndex] = newGroupName;
    }

    await accountGroup.save();

    res.json({
      success: true,
      message: "Group renamed successfully",
      data: accountGroup,
    });
  } catch (err) {
    console.error("Error renaming group:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// Delete group (move accounts to another group first)
export const deleteGroup = async (req, res) => {
  const { email, groupName, targetGroup } = req.body;

  try {
    const accountGroup = await AccountGroup.findOne({ email });
    if (!accountGroup) {
      return res.status(404).json({
        success: false,
        message: "Account groups not found for this email",
      });
    }

    if (!accountGroup.groups.has(groupName)) {
      return res.status(404).json({
        success: false,
        message: "Group not found",
      });
    }

    if (targetGroup && !accountGroup.groups.has(targetGroup)) {
      return res.status(404).json({
        success: false,
        message: "Target group not found",
      });
    }

    const accountsToMove = accountGroup.groups.get(groupName);

    if (targetGroup) {
      // Move accounts to target group
      const targetAccounts = accountGroup.groups.get(targetGroup);
      accountsToMove.forEach((acc) => {
        acc.groupName = targetGroup;
        targetAccounts.push(acc);
      });
      accountGroup.groups.set(targetGroup, targetAccounts);
    }

    // Remove the group
    accountGroup.groups.delete(groupName);

    // Remove from group order
    accountGroup.groupOrder = accountGroup.groupOrder.filter(
      (name) => name !== groupName
    );

    await accountGroup.save();

    res.json({
      success: true,
      message: `Group deleted successfully${
        targetGroup ? `, accounts moved to ${targetGroup}` : ""
      }`,
      data: accountGroup,
    });
  } catch (err) {
    console.error("Error deleting group:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// controllers/accountGroup.controller.js
// Add this new function for custom group creation
// controllers/accountGroup.controller.js - Fix the createCustomGroup function
export const createCustomGroup = async (req, res) => {
  const { email, groupName, accounts } = req.body;

  try {
    const accountGroup = await AccountGroup.findOne({ email });
    if (!accountGroup) {
      return res.status(404).json({
        success: false,
        message: "Account groups not found for this email",
      });
    }

    // Flatten all accounts and remove any that match the incoming accounts (to avoid duplicates across groups)
    const incomingKeys = new Set((accounts || []).map(accountKey));
    const cleanedGroups = new Map();
    for (const [gName, accs] of accountGroup.groups.entries()) {
      if (gName === groupName) continue; // we'll overwrite this group below
      const filtered = (accs || []).filter((a) => !incomingKeys.has(accountKey(a)));
      cleanedGroups.set(gName, filtered);
    }

    // Ensure group exists and set provided accounts (deduped)
    const uniqueIncoming = dedupeAccounts((accounts || []).map((a, idx) => ({ ...a, groupName, order: idx })));
    cleanedGroups.set(groupName, uniqueIncoming);

    // Reassign groups and rebuild group order to include groupName (append if new)
    accountGroup.groups = cleanedGroups;
    if (!accountGroup.groupOrder.includes(groupName)) {
      accountGroup.groupOrder.push(groupName);
    }

    await accountGroup.save();

    res.json({
      success: true,
      message: "Custom group created successfully",
      data: accountGroup,
    });
  } catch (err) {
    console.error("Error creating custom group:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// New: globally reorder all groups by sort order ("oldest" | "newest")
export const reorderAllGroups = async (req, res) => {
  const { email, sortOrder } = req.body;

  try {
    console.log(`🔄 Reordering groups for ${email} with sortOrder: ${sortOrder}`);
    
    const accountGroup = await AccountGroup.findOne({ email });
    if (!accountGroup) {
      return res.status(404).json({
        success: false,
        message: "Account groups not found for this email",
      });
    }

    // Flatten all accounts from all groups
    const merged = Array.from(accountGroup.groups.entries()).flatMap(([g, accs]) =>
      (accs || []).map((a, idx) => ({ ...a.toObject?.() ?? a, groupName: g, order: idx }))
    );
    console.log(`📊 Total accounts before deduplication: ${merged.length}`);

    // Dedupe across all groups
    const unique = dedupeAccounts(merged);
    console.log(`✨ Unique accounts after deduplication: ${unique.length}`);

    // Log before sorting
    console.log('📅 Before sorting - First 3 dates:', unique.slice(0, 3).map(a => a.dateOpened));

    // Sort globally - explicit for clarity
    if (sortOrder === "oldest") {
      // Ascending: oldest dates first (2023, 2024, 2025, 2026)
      unique.sort((a, b) => parseDate(a.dateOpened) - parseDate(b.dateOpened));
      console.log('📅 OLDEST first sorting applied');
    } else {
      // Descending: newest dates first (2026, 2025, 2024, 2023)
      unique.sort((a, b) => parseDate(b.dateOpened) - parseDate(a.dateOpened));
      console.log('📅 NEWEST first sorting applied');
    }

    // Log after sorting
    console.log('📅 After sorting - First 3 dates:', unique.slice(0, 3).map(a => a.dateOpened));
    console.log('📅 After sorting - Last 3 dates:', unique.slice(-3).map(a => a.dateOpened));

    // Group by bureau first, then slice into groups of 5
    const bureauGroups = {
      Experian: [],
      Equifax: [],
      TransUnion: []
    };

    // Separate accounts by bureau
    unique.forEach(account => {
      if (account.bureau && bureauGroups[account.bureau]) {
        bureauGroups[account.bureau].push(account);
      }
    });

    // Create groups of 5, maintaining bureau separation
    const newGroups = new Map();
    const newOrder = [];
    let groupCounter = 1;

    // Process each bureau separately
    Object.entries(bureauGroups).forEach(([bureau, accounts]) => {
      if (accounts.length === 0) return;

      // Create groups of 5 for this bureau
      for (let i = 0; i < accounts.length; i += 5) {
        const gName = `${bureau} Group ${groupCounter}`;
        const chunk = accounts.slice(i, i + 5).map((acc, idx) => ({ ...acc, groupName: gName, order: idx }));
        newGroups.set(gName, chunk);
        newOrder.push(gName);
        console.log(`📁 ${gName}: ${chunk.length} accounts, dates: ${chunk.map(a => a.dateOpened).join(', ')}`);
        groupCounter++;
      }
    });

    accountGroup.groups = newGroups;
    accountGroup.groupOrder = newOrder;
    await accountGroup.save();

    console.log(`✅ Successfully reordered into ${newOrder.length} groups`);

    res.json({
      success: true,
      message: `Groups globally reordered (${sortOrder})`,
      data: accountGroup,
    });
  } catch (err) {
    console.error("❌ Error reordering groups:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};
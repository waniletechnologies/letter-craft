// controllers/accountGroup.controller.js
import AccountGroup from "../models/accountGroup.model.js";
import CreditReport from "../models/creditReport.model.js";

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
    Object.entries(creditReport.accountInfo || {}).forEach(
      ([bureau, accounts]) => {
        accounts.forEach((account, index) => {
          allAccounts.push({
            ...account,
            bureau,
            originalIndex: index,
            order: allAccounts.length,
          });
        });
      }
    );

    // Group accounts into groups of 5
    const groups = new Map();
    const groupOrder = [];

    for (let i = 0; i < allAccounts.length; i += 5) {
      const groupName = `Group${Math.floor(i / 5) + 1}`;
      const groupAccounts = allAccounts.slice(i, i + 5).map((acc, idx) => ({
        ...acc,
        groupName,
        order: idx,
      }));

      groups.set(groupName, groupAccounts);
      groupOrder.push(groupName);
    }

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

    // Convert groups Map to plain object for manipulation
    const groupsObj = Object.fromEntries(accountGroup.groups);
    
    // Add the new group
    groupsObj[groupName] = accounts;
    
    // Convert back to Map
    accountGroup.groups = new Map(Object.entries(groupsObj));
    
    // Add to group order if it's a new group
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
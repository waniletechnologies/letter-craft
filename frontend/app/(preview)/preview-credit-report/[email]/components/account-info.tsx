"use client";
import React, { useState, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import Image from "next/image";
import { Equifax, Experian, TransUnion } from "@/public/images";
import { useDispute } from "@/context/disputeContext";
import { Input } from "@/components/ui/input";
import { Edit, Save, X, CheckSquare, Square, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { updateAccountInfo, UpdateAccountRequest } from "@/lib/creditReportApi";
import {
  createAccountGroups,
  moveAccount,
  createCustomGroup,
} from "@/lib/accountGroupApi";

export type Bureau = "Experian" | "Equifax" | "TransUnion";

export interface AccountInfoRow {
  id: string;
  accountName: string;
  accountNumber: string;
  highBalance: string;
  lastVerified: string;
  status: string;
  values: Record<
    Bureau,
    {
      accountName: string;
      accountNumber: string;
      highBalance: string;
      lastVerified: string;
      status: string;
    }
  >;
}

export interface AccountInfoTableProps {
  rows: AccountInfoRow[];
  onAccountUpdate?: (
    accountId: string,
    updates: Partial<AccountInfoRow>
  ) => void;
  email: string;
}

const BureauHeader: React.FC<{
  src: string;
  alt: string;
  checked: boolean;
  onToggle: (checked: boolean) => void;
  disabled?: boolean;
}> = ({ src, alt, checked, onToggle, disabled = false }) => (
  <div className="flex items-center justify-center py-3 gap-2">
    <input
      type="checkbox"
      checked={checked}
      onChange={(e) => onToggle(e.target.checked)}
      disabled={disabled}
      className={`h-4 w-4 accent-[#2563EB] border-gray-300 rounded flex-shrink-0 ${
        disabled ? "opacity-50 cursor-not-allowed" : ""
      }`}
    />
    <Image
      src={src}
      alt={alt}
      width={90}
      height={24}
      className={disabled ? "opacity-50" : ""}
    />
  </div>
);

const ValueCell: React.FC<{
  value?: string;
  isEditable?: boolean;
  onEdit?: (newValue: string) => void;
}> = ({ value, isEditable = false, onEdit }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(value || "");

  const handleSave = () => {
    if (onEdit && editValue !== value) {
      onEdit(editValue);
    }
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditValue(value || "");
    setIsEditing(false);
  };

  if (isEditable && isEditing) {
    return (
      <div className="flex items-center gap-1 py-2">
        <Input
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          className="h-8 text-xs"
          autoFocus
        />
        <Button
          size="sm"
          variant="ghost"
          onClick={handleSave}
          className="h-6 w-6 p-0"
        >
          <Save className="h-3 w-3 text-green-600" />
        </Button>
        <Button
          size="sm"
          variant="ghost"
          onClick={handleCancel}
          className="h-6 w-6 p-0"
        >
          <X className="h-3 w-3 text-red-600" />
        </Button>
      </div>
    );
  }

  return (
    <div className="py-2 flex items-center justify-between">
      <div className="font-medium text-xs leading-[150%] -tracking-[0.03em] text-[#292524] flex-1">
        {value ?? ""}
      </div>
      {isEditable && (
        <Button
          size="sm"
          variant="ghost"
          onClick={() => setIsEditing(true)}
          className="h-6 w-6 p-0 ml-1"
        >
          <Edit className="h-3 w-3 text-gray-500" />
        </Button>
      )}
    </div>
  );
};


const AccountTable: React.FC<{
  account: AccountInfoRow;
  onAccountUpdate: (updates: Partial<AccountInfoRow>) => void;
  onSelectAccount: (
    accountId: string,
    bureau: Bureau,
    selected: boolean,
    bureauData: unknown
  ) => void;
  selectedBureaus: Record<string, boolean>;
}> = ({ account, onAccountUpdate, onSelectAccount, selectedBureaus }) => {
  const [editableAccount, setEditableAccount] = useState(account);
  const isAccountField = (field: string): field is keyof AccountInfoRow => {
    return [
      "accountName",
      "accountNumber",
      "highBalance",
      "lastVerified",
      "status",
    ].includes(field);
  };

  const { addOrUpdateDisputeItem, removeDisputeItem, disputeItems } =
    useDispute();

  // Check if a bureau has data for this account
  const hasBureauData = (bureau: Bureau): boolean => {
    const bureauData = editableAccount.values[bureau];
    return (
      !!bureauData &&
      !!bureauData.accountName &&
      bureauData.accountName.trim() !== "" &&
      bureauData.accountName !== "N/A"
    );
  };

  // In your AccountTable component, update the handleBureauToggle function
  const handleBureauToggle = (bureau: Bureau, checked: boolean) => {
    if (!hasBureauData(bureau)) return;

    const bureauData = editableAccount.values[bureau];
    const disputeId = `${editableAccount.id}-${bureau}`;

    if (checked) {
      addOrUpdateDisputeItem({
        id: disputeId,
        creditor: bureauData.accountName,
        account: bureauData.accountNumber,
        dateOpened: bureauData.lastVerified,
        balance: bureauData.highBalance,
        type: editableAccount.status,
        disputed: false,
        hasExperian: bureau === "Experian",
        hasEquifax: bureau === "Equifax",
        hasTransUnion: bureau === "TransUnion",
        bureau: bureau, // Add bureau information for group lookup
      });
    } else {
      removeDisputeItem(disputeId);
    }

    onSelectAccount(account.id, bureau, checked, {
      ...bureauData,
      bureau,
      accountId: account.id,
    });
  };

  const handleBureauDataUpdate = (
    bureau: Bureau,
    field: string,
    value: string
  ) => {
    const updatedAccount = {
      ...editableAccount,
      values: {
        ...editableAccount.values,
        [bureau]: {
          ...editableAccount.values[bureau],
          [field]: value,
        },
      },
    };
    setEditableAccount(updatedAccount);
    onAccountUpdate({ values: updatedAccount.values });
  };

  const handleAccountUpdate = (field: keyof AccountInfoRow, value: string) => {
    const updatedAccount = {
      ...editableAccount,
      [field]: value,
    };
    setEditableAccount(updatedAccount);
    onAccountUpdate({ [field]: value });
  };

  const isNegative = editableAccount.status === "Negative";

  return (
    <div className="rounded-xl border-2 border-[#E5E7EB] bg-white overflow-hidden mb-6">
      <Table>
        <TableHeader>
          <TableRow className="bg-[#FAFAFA] border-b-2 border-[#00000014]">
            <TableHead className="w-[22%] items-start p-0" />
            <TableHead className="w-[26%] p-0">
              <BureauHeader
                src={Experian}
                alt="Experian"
                checked={selectedBureaus[`${account.id}-Experian`] || false}
                onToggle={(c) => handleBureauToggle("Experian", c)}
                disabled={!hasBureauData("Experian")}
              />
            </TableHead>
            <TableHead className="w-[26%] p-0">
              <BureauHeader
                src={Equifax}
                alt="Equifax"
                checked={selectedBureaus[`${account.id}-Equifax`] || false}
                onToggle={(c) => handleBureauToggle("Equifax", c)}
                disabled={!hasBureauData("Equifax")}
              />
            </TableHead>
            <TableHead className="w-[26%] p-0">
              <BureauHeader
                src={TransUnion}
                alt="TransUnion"
                checked={selectedBureaus[`${account.id}-TransUnion`] || false}
                onToggle={(c) => handleBureauToggle("TransUnion", c)}
                disabled={!hasBureauData("TransUnion")}
              />
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {[
            ["ACCOUNT NAME:", "accountName", true],
            ["ACCOUNT #:", "accountNumber", true],
            ["HIGH BALANCE:", "highBalance", false],
            ["LAST VERIFIED", "lastVerified", false],
          ].map(([label, key, isEditable]) => (
            <TableRow key={label} className="border-b border-[#00000014]">
              <TableCell className="font-medium text-xs leading-[1.5] -tracking-[0.03em] text-right w-[22%] text-[#292524] border-r border-[#00000014] p-3">
                {label}
              </TableCell>
              {(["Experian", "Equifax", "TransUnion"] as Bureau[]).map(
                (bureau, i) => (
                  <TableCell
                    key={i}
                    className={`px-2 w-[26%] ${
                      i < 2 ? "border-r" : ""
                    } border-[#00000014] py-2 ${
                      isNegative ? "bg-[#FFE2E2]" : ""
                    } ${!hasBureauData(bureau) ? "bg-gray-100" : ""}`}
                  >
                    <ValueCell
                      value={
                        editableAccount.values[bureau][
                          key as keyof (typeof editableAccount.values)[Bureau]
                        ]
                      }
                      isEditable={
                        (isEditable as boolean) && hasBureauData(bureau)
                      }
                      onEdit={(newValue) =>
                        handleBureauDataUpdate(bureau, key as string, newValue)
                      }
                    />
                  </TableCell>
                )
              )}
            </TableRow>
          ))}
          <TableRow className="border-b border-[#00000014]">
            <TableCell className="font-medium text-xs leading-[1.5] -tracking-[0.03em] text-right w-[22%] text-[#292524] bg-[#F6F6F6] border-r border-[#00000014] p-3">
              STATUS
            </TableCell>
            {(["Experian", "Equifax", "TransUnion"] as Bureau[]).map(
              (bureau, i) => (
                <TableCell
                  key={i}
                  className={`px-2 w-[26%] border-r border-[#00000014] py-2 bg-[#F6F6F6] ${
                    !hasBureauData(bureau) ? "bg-gray-100" : ""
                  }`}
                >
                  <ValueCell value={editableAccount.values[bureau].status} />
                </TableCell>
              )
            )}
          </TableRow>
        </TableBody>
      </Table>
    </div>
  );
};

export const AccountInfoTable: React.FC<AccountInfoTableProps> = ({
  rows,
  onAccountUpdate,
  email,
}) => {
  const [selectedAccounts, setSelectedAccounts] = useState<Set<string>>(
    new Set()
  );
  const [isCreatingGroups, setIsCreatingGroups] = useState(false);
  const [customGroupName, setCustomGroupName] = useState("");
  const [selectedBureaus, setSelectedBureaus] = useState<
    Record<string, boolean>
  >({});
  const isAccountField = (field: string): field is keyof AccountInfoRow => {
    return [
      "accountName",
      "accountNumber",
      "highBalance",
      "lastVerified",
      "status",
    ].includes(field);
  };

  const handleAccountUpdate = async (
    accountId: string,
    updates: Partial<AccountInfoRow>
  ) => {
    console.log("🔄 Starting account update for:", accountId);
    console.log("📝 Updates:", updates);
    if (onAccountUpdate) {
      onAccountUpdate(accountId, updates);
    }

    const account = rows.find((acc) => acc.id === accountId);
    if (!account) {
      console.error("Account not found with ID:", accountId);
      toast.error("Failed to update account: account not found");
      return;
    }

    // Create a map of bureau-specific updates
    const bureauUpdates: Record<
      string,
      {
        updates: UpdateAccountRequest["updates"];
        accountNumber: string;
      }
    > = {};

    // Handle values updates (bureau-specific data)
    if (updates.values) {
      Object.entries(updates.values).forEach(([bureau, bureauData]) => {
        if (bureauData && Object.keys(bureauData).length > 0) {
          const bureauAccount = account.values[bureau as Bureau];
          if (bureauAccount && bureauAccount.accountName) {
            bureauUpdates[bureau] = {
              updates: bureauData,
              accountNumber: bureauAccount.accountNumber,
            };
          }
        }
      });
    }

    // Handle top-level field updates (apply to all bureaus that have data)
    const topLevelFields: (keyof AccountInfoRow)[] = [
      "accountName",
      "accountNumber",
      "highBalance",
      "lastVerified",
      "status",
    ];

    topLevelFields.forEach((field) => {
      if (field in updates && updates[field] !== undefined) {
        ["Experian", "Equifax", "TransUnion"].forEach((bureau) => {
          const bureauAccount = account.values[bureau as Bureau];
          // Only update bureaus that have data for this account
          if (bureauAccount && bureauAccount.accountName) {
            if (!bureauUpdates[bureau]) {
              bureauUpdates[bureau] = {
                updates: {},
                accountNumber: bureauAccount.accountNumber,
              };
            }

            // Add the field update - use type assertion for the field
            const updateValue = updates[field];
            if (updateValue !== undefined) {
              // Create a type-safe way to assign the update
              bureauUpdates[bureau].updates = {
                ...bureauUpdates[bureau].updates,
                [field]: updateValue as string,
              };
            }
          }
        });
      }
    });

    // Send updates to the server for each bureau that has updates
    const updatePromises = Object.entries(bureauUpdates).map(
      async ([bureau, { updates: bureauUpdate, accountNumber }]) => {
        if (Object.keys(bureauUpdate).length > 0) {
          try {
            console.log(
              "📤 Sending update to",
              bureau,
              "for account:",
              accountNumber
            );
            console.log("Updates:", bureauUpdate);

            const response = await updateAccountInfo({
              email: email,
              bureau: bureau as "Experian" | "Equifax" | "TransUnion",
              accountId: accountNumber,
              updates: bureauUpdate,
            });

            if (!response.success) {
              throw new Error(response.message || "Failed to update account");
            }

            return response;
          } catch (error) {
            console.error(`Error updating ${bureau} account:`, error);
            throw error;
          }
        }
        return null;
      }
    );

    try {
      const results = await Promise.all(updatePromises);
      const successfulUpdates = results.filter((result) => result !== null);

      if (successfulUpdates.length > 0) {
        toast.success("Account information updated successfully");
      }
    } catch (error) {
      console.error("Error updating account:", error);
      toast.error("Failed to update account information");
    }
  };

  const handleSelectAccount = (
    accountId: string,
    bureau: Bureau,
    selected: boolean,
    bureauData: unknown
  ) => {
    const key = `${accountId}-${bureau}`;
    setSelectedBureaus((prev) => ({
      ...prev,
      [key]: selected,
    }));
  };

  const handleSelectAll = () => {
    const allSelected: Record<string, boolean> = {};

    rows.forEach((row) => {
      (["Experian", "Equifax", "TransUnion"] as Bureau[]).forEach((bureau) => {
        const bureauData = row.values[bureau];
        if (
          bureauData &&
          bureauData.accountName &&
          bureauData.accountName.trim() !== "" &&
          bureauData.accountName !== "N/A"
        ) {
          allSelected[`${row.id}-${bureau}`] = true;
        }
      });
    });

    setSelectedBureaus(allSelected);
  };

  const handleCreateAutoGroups = async () => {
    const selectedCount = Object.values(selectedBureaus).filter(Boolean).length;
    if (selectedCount === 0) {
      toast.error("Please select at least one account to create groups");
      return;
    }

    setIsCreatingGroups(true);
    try {
      // Get selected account data from all bureaus
      const selectedAccountData = [];

      rows.forEach((row) => {
        (["Experian", "Equifax", "TransUnion"] as Bureau[]).forEach(
          (bureau) => {
            const key = `${row.id}-${bureau}`;
            if (selectedBureaus[key]) {
              const bureauData = row.values[bureau];
              selectedAccountData.push({
                accountName: bureauData.accountName,
                accountNumber: bureauData.accountNumber,
                highBalance: bureauData.highBalance,
                currentBalance: bureauData.highBalance,
                lastVerified: bureauData.lastVerified,
                status: bureauData.status,
                payStatus: bureauData.status,
                worstPayStatus: bureauData.status,
                dateOpened: bureauData.lastVerified,
                dateClosed: "",
                remarks: [],
                bureau: bureau,
              });
            }
          }
        );
      });

      // Create account groups in database
      const response = await createAccountGroups(email);

      if (response.success) {
        const groupCount = Math.ceil(selectedAccountData.length / 5);
        toast.success(
          `Created ${groupCount} groups with ${selectedAccountData.length} accounts`
        );
        setSelectedBureaus({});
      } else {
        throw new Error(response.message || "Failed to create groups");
      }
    } catch (error) {
      console.error("Error creating groups:", error);
      toast.error("Failed to create groups");
    } finally {
      setIsCreatingGroups(false);
    }
  };

  const handleCreateCustomGroup = async () => {
    const selectedCount = Object.values(selectedBureaus).filter(Boolean).length;

    if (selectedCount === 0) {
      toast.error(
        "Please select at least one account to create a custom group"
      );
      return;
    }

    if (selectedCount > 5) {
      toast.error("Custom groups can only contain up to 5 accounts");
      return;
    }

    if (!customGroupName.trim()) {
      toast.error("Please enter a name for your custom group");
      return;
    }

    setIsCreatingGroups(true);
    try {
      // Get selected account data
      const selectedAccountData: { accountName: string; accountNumber: string; highBalance: string; currentBalance: string; lastVerified: string; status: string; payStatus: string; worstPayStatus: string; dateOpened: string; dateClosed: string; remarks: never[]; bureau: Bureau; }[] = [];

      rows.forEach((row) => {
        (["Experian", "Equifax", "TransUnion"] as Bureau[]).forEach(
          (bureau) => {
            const key = `${row.id}-${bureau}`;
            if (selectedBureaus[key]) {
              const bureauData = row.values[bureau];
              selectedAccountData.push({
                accountName: bureauData.accountName,
                accountNumber: bureauData.accountNumber,
                highBalance: bureauData.highBalance,
                currentBalance: bureauData.highBalance,
                lastVerified: bureauData.lastVerified,
                status: bureauData.status,
                payStatus: bureauData.status,
                worstPayStatus: bureauData.status,
                dateOpened: bureauData.lastVerified,
                dateClosed: "",
                remarks: [],
                bureau: bureau,
              });
            }
          }
        );
      });

      // Create the custom group
      const groupAccounts = selectedAccountData.map((acc, idx) => ({
        ...acc,
        groupName: customGroupName,
        order: idx,
      }));

      const response = await createCustomGroup(
        email,
        customGroupName,
        groupAccounts
      );

      if (response.success) {
        toast.success(
          `Custom group "${customGroupName}" created with ${selectedAccountData.length} accounts`
        );
        setSelectedBureaus({});
        setCustomGroupName("");
      } else {
        throw new Error(response.message || "Failed to create custom group");
      }
    } catch (error) {
      console.error("Error creating custom group:", error);
      toast.error("Failed to create custom group");
    } finally {
      setIsCreatingGroups(false);
    }
  };

  const clearSelection = () => {
    setSelectedBureaus({});
  };

  const selectedCount = Object.values(selectedBureaus).filter(Boolean).length;

  return (
    <div className="space-y-6">
      {/* Group Creation Controls */}
      <div className="flex flex-col gap-4 p-4 bg-gray-50 rounded-lg">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-lg">Account Grouping</h3>
            <p className="text-sm text-gray-600">
              {selectedCount} account(s) selected
              {selectedCount > 0 && selectedCount <= 5 && " (Custom Group)"}
              {selectedCount > 5 && " (Auto Groups)"}
            </p>
          </div>

          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={handleSelectAll}
              disabled={rows.length === 0}
            >
              Select All
            </Button>

            <Button
              variant="outline"
              onClick={clearSelection}
              disabled={selectedCount === 0}
            >
              Clear Selection
            </Button>

            {selectedCount > 5 ? (
              <Button
                onClick={handleCreateAutoGroups}
                disabled={selectedCount === 0 || isCreatingGroups}
              >
                {isCreatingGroups
                  ? "Creating Auto Groups..."
                  : "Create Auto Groups"}
              </Button>
            ) : (
              <Button
                onClick={handleCreateCustomGroup}
                disabled={
                  selectedCount === 0 ||
                  isCreatingGroups ||
                  !customGroupName.trim()
                }
              >
                {isCreatingGroups
                  ? "Creating Custom Group..."
                  : "Create Custom Group"}
              </Button>
            )}
          </div>
        </div>

        {/* Custom Group Name Input (only show when 1-5 accounts selected) */}
        {selectedCount > 0 && selectedCount <= 5 && (
          <div className="flex items-center gap-2 p-3 bg-white rounded border">
            <Input
              placeholder="Enter custom group name"
              value={customGroupName}
              onChange={(e) => setCustomGroupName(e.target.value)}
              className="flex-1"
            />
          </div>
        )}

        {/* Selected Accounts Preview */}
        {selectedCount > 0 && (
          <div className="bg-white p-3 rounded border">
            <h4 className="font-medium mb-2">Selected Accounts:</h4>
            <div className="space-y-1">
              {rows.map((row) =>
                (["Experian", "Equifax", "TransUnion"] as Bureau[]).map(
                  (bureau) => {
                    const key = `${row.id}-${bureau}`;
                    if (selectedBureaus[key]) {
                      const bureauData = row.values[bureau];
                      return (
                        <div
                          key={key}
                          className="flex items-center justify-between text-sm"
                        >
                          <span>
                            {bureauData.accountName} ({bureau})
                          </span>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() =>
                              handleSelectAccount(
                                row.id,
                                bureau,
                                false,
                                bureauData
                              )
                            }
                          >
                            <Trash2 className="h-3 w-3 text-red-500" />
                          </Button>
                        </div>
                      );
                    }
                    return null;
                  }
                )
              )}
            </div>
          </div>
        )}
      </div>

      {/* Accounts List */}
      {rows.map((account) => (
        <AccountTable
          key={account.id}
          account={account}
          onAccountUpdate={(updates) =>
            handleAccountUpdate(account.id, updates)
          }
          onSelectAccount={handleSelectAccount}
          selectedBureaus={selectedBureaus}
        />
      ))}
    </div>
  );
};

export default AccountInfoTable;

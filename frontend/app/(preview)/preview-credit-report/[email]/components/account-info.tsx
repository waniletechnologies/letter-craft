"use client";
import {
  useState,
  useRef,
  Trash2,
  Calendar,
  Input,
  Button,
  toast,
  updateAccountInfo,
  UpdateAccountRequest,
  createAccountGroups,
  createCustomGroup,
} from "@/lib/import";
import { createAccount } from "@/lib/creditReportApi";

import { Bureau, AccountInfoRow, AccountInfoTableProps } from "@/lib/interface";
import { AccountTable } from "@/constants/account-info";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";

export const AccountInfoTable: React.FC<AccountInfoTableProps> = ({
  rows,
  onAccountUpdate,
  email,
}) => {
  const [isCreatingGroups, setIsCreatingGroups] = useState(false);
  const [customGroupName, setCustomGroupName] = useState("");
  const [selectedBureaus, setSelectedBureaus] = useState<
    Record<string, boolean>
  >({});
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [createGroupName, setCreateGroupName] = useState("");
  const [newAccountName, setNewAccountName] = useState("");
  const [newAccountNumber, setNewAccountNumber] = useState("");
  const [newBalance, setNewBalance] = useState("");
  const [newDateOpened, setNewDateOpened] = useState("");
  const [newBureau, setNewBureau] = useState("Experian");

  const handleCreateGroupDialogSubmit = async () => {
    if (!newAccountName.trim() || !newAccountNumber.trim()) {
      toast.error("Please provide account name and number");
      return;
    }
    setIsCreatingGroups(true);
    try {
      const sanitizedBalance = (() => {
        const raw = String(newBalance || "");
        const cleaned = raw.replace(/[^0-9.-]/g, "");
        const n = parseFloat(cleaned);
        return Number.isFinite(n) ? n : 0;
      })();

      const response = await createAccount({
        email,
        bureau: newBureau as "Experian" | "Equifax" | "TransUnion",
        accountData: {
          accountName: newAccountName,
          accountNumber: newAccountNumber,
          balance: sanitizedBalance,
          dateOpened: newDateOpened,
        },
      });

      if (!response.success) {
        throw new Error(response.message || "Failed to create group");
      }

      toast.success(`Account "${newAccountName}" created successfully`);
      setIsCreateDialogOpen(false);
      setCreateGroupName("");
      setNewAccountName("");
      setNewAccountNumber("");
      setNewBalance("");
      setNewDateOpened("");
      setNewBureau("Experian");
    } catch (err) {
      console.error(err);
      toast.error("Failed to create account");
    } finally {
      setIsCreatingGroups(false);
    }
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
      const selectedAccountData: {
        accountName: string;
        accountNumber: string;
        highBalance: string;
        currentBalance: string;
        lastVerified: string;
        status: string;
        payStatus: string;
        worstPayStatus: string;
        dateOpened: string;
        dateClosed: string;
        remarks: never[];
        bureau: Bureau;
      }[] = [];

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
            <Button onClick={() => setIsCreateDialogOpen(true)}>Create Group</Button>
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

      {/* Create Account Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Account</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <div className="space-y-1">
              <Label htmlFor="newAccountName">Account name</Label>
              <Input
                id="newAccountName"
                placeholder="Account name"
                value={newAccountName}
                onChange={(e) => setNewAccountName(e.target.value)}
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="newAccountNumber">Account number</Label>
              <Input
                id="newAccountNumber"
                placeholder="Account number"
                value={newAccountNumber}
                onChange={(e) => setNewAccountNumber(e.target.value)}
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="newBalance">Balance</Label>
              <Input
                id="newBalance"
                placeholder="Balance (e.g. 1234 or $1,234)"
                value={newBalance}
                onChange={(e) => setNewBalance(e.target.value)}
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="newDateOpened">Date opened</Label>
              <div className="relative">
                {(() => {
                  const ref = useRef<HTMLInputElement | null>(null)
                  const openPicker = () => {
                    try {
                      ref.current?.showPicker?.()
                    } catch {}
                  }
                  return (
                    <Input
                      ref={ref}
                      id="newDateOpened"
                      type="date"
                      placeholder="Date opened"
                      value={newDateOpened}
                      onChange={(e) => setNewDateOpened(e.target.value)}
                      onFocus={openPicker}
                      onClick={openPicker}
                      className="date-input pr-10 cursor-pointer"
                    />
                  )
                })()}
                <Calendar
                  aria-hidden
                  className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
                />
              </div>
            </div>
            <div className="space-y-1">
              <Label htmlFor="bureau">Select Bureau</Label>
              <Select value={newBureau} onValueChange={setNewBureau}>
                <SelectTrigger id="bureau" className="shadow-none w-full border-[#E4E4E7]">
                  <SelectValue placeholder="Bureau" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Experian">Experian</SelectItem>
                  <SelectItem value="Equifax">Equifax</SelectItem>
                  <SelectItem value="TransUnion">TransUnion</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleCreateGroupDialogSubmit} disabled={isCreatingGroups}>
              {isCreatingGroups ? "Creating..." : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AccountInfoTable;

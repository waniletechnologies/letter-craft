"use client";

import React, { useMemo, useState, useEffect, useCallback } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import Image from "next/image";
import { Equifax, Experian, TransUnion } from "@/public/images";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { fetchStoredCreditReport } from "@/lib/creditReportApi";
import { useDispute } from "@/context/disputeContext";

import {
  useSensor,
  useSensors,
  PointerSensor,
  DndContext,
  closestCenter,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import SortableItem from "./SortableItem";
import { toast } from "sonner";
import { formatDateForDisplay, parseMMYYYYToDate } from "@/lib/dateUtils";

// Add these imports for group functionality
import {
  createAccountGroups,
  getAccountGroups,
  moveAccount,
  reorderAllGroups,
} from "@/lib/accountGroupApi";

// Define proper interfaces for account data
interface AccountData {
  _id?: string;
  accountNumber: string;
  accountName: string;
  dateOpened: string;
  currentBalance: string;
  payStatus: string;
  disputed: boolean;
  bureau: string;
  order?: number;
  groupName?: string;
  // Add other properties that might exist in your account objects
  highBalance?: string;
  lastVerified?: string;
  status?: string;
  worstPayStatus?: string;
  remarks?: string[];
}

interface ItemRow {
  id: string;
  creditor: string;
  account: string;
  dateOpened: string;
  balance: string;
  type: string;
  disputed: boolean;
  hasExperian: boolean;
  hasEquifax: boolean;
  hasTransUnion: boolean;
  groupName: string;
  order: number;
  bureau: string;
}

export interface AddDisputeItemsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  email: string;
}

const AddDisputeItemsDialog: React.FC<AddDisputeItemsDialogProps> = ({
  open,
  onOpenChange,
  email,
}) => {
  const [selectedGroups, setSelectedGroups] = useState<string[]>([]);
  const [rows, setRows] = useState<ItemRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [groups, setGroups] = useState<Map<string, ItemRow[]>>(new Map());
  const [groupOrder, setGroupOrder] = useState<string[]>([]);
  const [dateSortOrder, setDateSortOrder] = useState<'newest' | 'oldest' | 'none'>('none');
  const { disputeItems, addMultipleDisputeItems } = useDispute();
  const decodedEmail = decodeURIComponent(email as string);

  

  useEffect(() => {
    if (open && rows.length) {
      // Pre-select groups that already have items in dispute
      const groupsWithDisputes = new Set<string>();
      disputeItems.forEach((item) => {
        if (item.groupName) {
          groupsWithDisputes.add(item.groupName);
        }
      });
      setSelectedGroups(Array.from(groupsWithDisputes));
    }
  }, [open, rows, disputeItems]);

  const loadAccountGroups = useCallback(async () => {
    try {
      setLoading(true);

      const groupsResponse = await getAccountGroups(decodedEmail);

      if (groupsResponse.success && groupsResponse.data) {
        const { groups: groupsObj, groupOrder } = groupsResponse.data;

        // ✅ Convert plain object to Map with proper typing
        const groupsMap = new Map<string, ItemRow[]>();
        Object.entries(groupsObj).forEach(([groupName, accounts]) => {
          // Cast accounts to the proper type
          const typedAccounts = accounts as AccountData[];
          groupsMap.set(
            groupName,
            typedAccounts.map((account) => ({
              id: `${account._id || account.accountNumber}-${account.bureau || ""}`,
              creditor: account.accountName || "",
              account: account.accountNumber || "",
              dateOpened: account.dateOpened || "",
              balance: account.currentBalance || account.highBalance || "",
              type: account.payStatus || account.status || "",
              disputed: account.disputed || false,
              hasExperian: account.bureau === "Experian",
              hasEquifax: account.bureau === "Equifax",
              hasTransUnion: account.bureau === "TransUnion",
              groupName,
              order: account.order || 0,
              bureau: account.bureau || "",
            }))
          );
        });

        setGroups(groupsMap);
        setGroupOrder(groupOrder);

        // ✅ Flatten all accounts for table rows
        const allAccounts = Array.from(groupsMap.entries()).flatMap(
          ([groupName, accounts]) => accounts.map((a) => ({ ...a, groupName }))
        );
        setRows(allAccounts);
      } else {
        await createAccountGroupsFromReport();
      }
    } catch (error) {
      console.error("Error loading account groups:", error);
      await createAccountGroupsFromReport();
    } finally {
      setLoading(false);
    }
  }, [decodedEmail]);

  useEffect(() => {
    if (open && decodedEmail) {
      loadAccountGroups();
    }
  }, [open, decodedEmail, loadAccountGroups]);

  const createAccountGroupsFromReport = async () => {
    try {
      const response = await fetchStoredCreditReport(email);
      if (response.success && response.data) {
        const createResponse = await createAccountGroups(decodedEmail);

        if (createResponse.success && createResponse.data) {
          // Use proper typing instead of any[]
          const groupsData = createResponse.data.groups as Record<
            string,
            AccountData[]
          >;
          const groupOrderData = createResponse.data.groupOrder || [];

          const groupsMap = new Map<string, ItemRow[]>();
          Object.entries(groupsData).forEach(([groupName, accounts]) => {
            groupsMap.set(
              groupName,
              accounts.map((account) => ({
                id: `${account._id || account.accountNumber}-${account.bureau || ""}`,
                creditor: account.accountName || "",
                account: account.accountNumber || "",
                dateOpened: account.dateOpened || "",
                balance: account.currentBalance || account.highBalance || "",
                type: account.payStatus || account.status || "",
                disputed: account.disputed || false,
                hasExperian: account.bureau === "Experian",
                hasEquifax: account.bureau === "Equifax",
                hasTransUnion: account.bureau === "TransUnion",
                groupName,
                order: account.order || 0,
                bureau: account.bureau || "",
              }))
            );
          });

          setGroups(groupsMap);
          setGroupOrder(groupOrderData);

          const allAccounts = Array.from(groupsMap.entries()).flatMap(
            ([groupName, accounts]) =>
              accounts.map((a) => ({ ...a, groupName }))
          );
          setRows(allAccounts);
        }
      }
    } catch (error) {
      console.error("Error creating account groups:", error);
    }
  };

  const allChecked = selectedGroups.length === groupOrder.length;
  const toggleAllGroups = (checked: boolean) =>
    setSelectedGroups(checked ? [...groupOrder] : []);

  const toggleGroup = (groupName: string, checked: boolean) =>
    setSelectedGroups((prev) =>
      checked ? [...prev, groupName] : prev.filter((name) => name !== groupName)
    );

  const countLabel = useMemo(() => {
    const totalAccounts = selectedGroups.reduce((total, groupName) => {
      return total + (groups.get(groupName)?.length || 0);
    }, 0);

    if (totalAccounts === 0) return "0 Selected Accounts";
    if (totalAccounts === 1) return "1 Selected Account";
    return `${totalAccounts} Selected Accounts from ${selectedGroups.length} Groups`;
  }, [selectedGroups, groups]);

  const handleAdd = () => {
    const selectedItems = rows.filter((r) =>
      selectedGroups.includes(r.groupName)
    );
    
    // Check if any group has more than 5 accounts
    const groupsWithTooManyAccounts = selectedGroups.filter(groupName => {
      const groupAccounts = selectedItems.filter(item => item.groupName === groupName);
      return groupAccounts.length > 5;
    });
    
    if (groupsWithTooManyAccounts.length > 0) {
      toast.error(`Groups ${groupsWithTooManyAccounts.join(', ')} have more than 5 accounts. Please reduce the number of accounts in these groups before submitting.`);
      return;
    }
    
    addMultipleDisputeItems(
      selectedItems.map((r) => ({
        id: r.id,
        creditor: r.creditor,
        account: r.account,
        dateOpened: r.dateOpened,
        balance: r.balance,
        type: r.type,
        disputed: r.disputed,
        hasExperian: r.hasExperian,
        hasEquifax: r.hasEquifax,
        hasTransUnion: r.hasTransUnion,
        groupName: r.groupName,
      }))
    );
    onOpenChange(false);
  };

  const sensors = useSensors(useSensor(PointerSensor));

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const [sourceGroup, accountId] = (active.id as string).split("::");
    const [targetGroup] = (over.id as string).split("::");

    // Allow dragging to groups with more than 5 accounts (validation happens on submit)
    if (sourceGroup !== targetGroup) {
      // Remove from source group and add to target group locally
      const updatedGroups = new Map(groups);
      const sourceAccounts = updatedGroups.get(sourceGroup) || [];
      const targetAccounts = updatedGroups.get(targetGroup) || [];

      const movedIdx = sourceAccounts.findIndex((acc) => acc.id === accountId);
      const [movedAcc] = sourceAccounts.splice(movedIdx, 1);
      movedAcc.groupName = targetGroup;

      targetAccounts.push(movedAcc);
      updatedGroups.set(sourceGroup, sourceAccounts);
      updatedGroups.set(targetGroup, targetAccounts);

      setGroups(updatedGroups);

      // Flatten to rows for table
      const allAccounts = Array.from(updatedGroups.entries()).flatMap(
        ([g, accs]) => accs.map((a) => ({ ...a, groupName: g }))
      );
      setRows(allAccounts);

      // Persist to DB
      try {
        await moveAccount(
          decodedEmail,
          accountId,
          sourceGroup,
          targetGroup,
          targetAccounts.length - 1
        );
        toast.success("Account moved successfully");
      } catch (err) {
        console.error("Failed to update DB:", err);
        toast.error("Failed to move account");
      }
    }
  };

  // Apply global sort via backend and refresh groups
  const applyGlobalSort = useCallback(
    async (order: 'newest' | 'oldest') => {
      try {
        console.log(`🔄 Applying global sort: ${order}`);
        setLoading(true);
        setDateSortOrder(order);
        
        const resp = await reorderAllGroups(decodedEmail, order);
        console.log('📦 Reorder response:', resp);
        
        if (resp.success && resp.data) {
          const groupsObj = resp.data.groups as Record<string, AccountData[]>;
          const groupOrderData = resp.data.groupOrder || [];

          console.log('📊 Groups received:', Object.keys(groupsObj));
          console.log('📋 Group order:', groupOrderData);

          const groupsMap = new Map<string, ItemRow[]>();
          Object.entries(groupsObj).forEach(([groupName, accounts]) => {
            const mappedAccounts = (accounts as AccountData[]).map((account) => ({
              id: `${account._id || account.accountNumber}-${account.bureau || ""}`,
              creditor: account.accountName || "",
              account: account.accountNumber || "",
              dateOpened: account.dateOpened || "",
              balance: account.currentBalance || account.highBalance || "",
              type: account.payStatus || account.status || "",
              disputed: account.disputed || false,
              hasExperian: account.bureau === "Experian",
              hasEquifax: account.bureau === "Equifax",
              hasTransUnion: account.bureau === "TransUnion",
              groupName,
              order: account.order || 0,
              bureau: account.bureau || "",
            }));
            groupsMap.set(groupName, mappedAccounts);
            console.log(`📁 ${groupName}: ${mappedAccounts.length} accounts, dates:`, mappedAccounts.map(a => a.dateOpened));
          });

          setGroups(groupsMap);
          setGroupOrder(groupOrderData);

          const allAccounts = Array.from(groupsMap.entries()).flatMap(
            ([groupName, accounts]) => accounts.map((a) => ({ ...a, groupName }))
          );
          setRows(allAccounts);
          
          toast.success(`Accounts sorted globally by ${order === 'newest' ? 'newest' : 'oldest'} first`);
        } else {
          toast.error('Failed to sort accounts');
        }
      } catch (e) {
        console.error('❌ Failed to apply global sort', e);
        toast.error('Failed to sort accounts');
      } finally {
        setLoading(false);
      }
    },
    [decodedEmail]
  );

  // Group rows by group name for display (no per-group sorting; sorting is global via backend)
  const groupedRows = useMemo(() => {
    const grouped = new Map<string, ItemRow[]>();
    rows.forEach((row) => {
      if (!grouped.has(row.groupName)) {
        grouped.set(row.groupName, []);
      }
      grouped.get(row.groupName)!.push(row);
    });
    return grouped;
  }, [rows]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[90vw] max-h-[92vh] overflow-y-auto bg-white">
        <DialogHeader>
          <DialogTitle className="text-[#111827]">
            Add saved/Pending items
          </DialogTitle>
        </DialogHeader>

        <div className="font-semibold text-sm leading-[20px] tracking-normal text-[#595858]">
          These are the negative items from your client&apos;s credit report
          grouped for easy selection. Select entire groups to add to dispute.
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <p>Loading account groups...</p>
          </div>
        ) : (
          <>
            <div className="mt-3 rounded-lg border border-[#E5E7EB] overflow-hidden">
              <Table>
                <TableHeader className="bg-[#F9FAFB] sticky top-0 z-10">
                  <TableRow>
                    <TableHead className="w-[80px]">
                      <div className="flex items-center gap-2">
                        <Checkbox
                          checked={allChecked}
                          onCheckedChange={(v) => toggleAllGroups(Boolean(v))}
                        />
                        Select
                      </div>
                    </TableHead>
                    <TableHead className="w-[200px]">Group</TableHead>
                    <TableHead className="w-[260px]">Account #</TableHead>
                    <TableHead className="w-[140px]">
                      <div className="flex items-center gap-1">
                        Date Opened
                        <div className="flex flex-col">
                          <button
                            onClick={() => applyGlobalSort('newest')}
                            disabled={loading}
                            className={`text-xs ${dateSortOrder === 'newest' ? 'text-blue-600 font-bold' : 'text-gray-400'} ${loading ? 'opacity-50 cursor-not-allowed' : 'hover:text-blue-500'}`}
                            title="Sort globally: Newest first (2026 → 2023)"
                          >
                            ↑
                          </button>
                          <button
                            onClick={() => applyGlobalSort('oldest')}
                            disabled={loading}
                            className={`text-xs ${dateSortOrder === 'oldest' ? 'text-blue-600 font-bold' : 'text-gray-400'} ${loading ? 'opacity-50 cursor-not-allowed' : 'hover:text-blue-500'}`}
                            title="Sort globally: Oldest first (2023 → 2026)"
                          >
                            ↓
                          </button>
                        </div>
                      </div>
                    </TableHead>
                    <TableHead className="w-[120px]">Balance</TableHead>
                    <TableHead className="w-[100px]">Type</TableHead>
                    <TableHead className="w-[90px]">Disputed</TableHead>
                    <TableHead className="text-center w-[90px]">
                      <Image
                        src={Experian}
                        alt="Experian"
                        width={54}
                        height={14}
                      />
                    </TableHead>
                    <TableHead className="text-center w-[90px]">
                      <Image
                        src={Equifax}
                        alt="Equifax"
                        width={54}
                        height={14}
                      />
                    </TableHead>
                    <TableHead className="text-center w-[90px]">
                      <Image
                        src={TransUnion}
                        alt="TransUnion"
                        width={54}
                        height={14}
                      />
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <DndContext
                    sensors={sensors}
                    collisionDetection={closestCenter}
                    onDragEnd={handleDragEnd}
                  >
                    {groupOrder.map((groupName) => {
                      const groupAccounts = groupedRows.get(groupName) || [];
                      const isGroupSelected =
                        selectedGroups.includes(groupName);
                      const isGroupFull = groupAccounts.length >= 5;

                      return (
                        <React.Fragment key={groupName}>
                          {/* Group Header */}
                          <TableRow className="bg-blue-50">
                            <TableCell>
                              <Checkbox
                                checked={isGroupSelected}
                                onCheckedChange={(v) =>
                                  toggleGroup(groupName, Boolean(v))
                                }
                              />
                            </TableCell>
                            <TableCell
                              colSpan={8}
                              className="font-bold text-blue-800"
                            >
                              📁 {groupName} ({groupAccounts.length}/5 accounts)
                              {isGroupFull && (
                                <span className="ml-2 text-xs text-green-600">
                                  ✓ Full
                                </span>
                              )}
                              {groupAccounts.length > 5 && (
                                <span className="ml-2 text-xs text-red-600">
                                  ⚠ Too many accounts
                                </span>
                              )}
                            </TableCell>
                          </TableRow>

                          <SortableContext
                            items={groupAccounts.map(
                              (r) => `${groupName}::${r.id}`
                            )}
                            strategy={verticalListSortingStrategy}
                          >
                            {groupAccounts.map((r) => (
                              <SortableItem
                                key={`${groupName}::${r.id}`}
                                id={`${groupName}::${r.id}`}
                              >
                                <>
                                  <TableCell></TableCell>{" "}
                                  {/* Empty for checkbox column */}
                                  <TableCell className="text-gray-500">
                                    {r.creditor}
                                  </TableCell>
                                  <TableCell className="whitespace-pre-line">
                                    <div className="max-w-[220px] truncate">
                                      {r.account}
                                    </div>
                                  </TableCell>
                                  <TableCell>{formatDateForDisplay(r.dateOpened)}</TableCell>
                                  <TableCell>{r.balance}</TableCell>
                                  <TableCell>{r.type}</TableCell>
                                  <TableCell>
                                    {r.disputed ? "YES" : "NO"}
                                  </TableCell>
                                  <TableCell className="text-center">
                                    {r.hasExperian ? "✓" : ""}
                                  </TableCell>
                                  <TableCell className="text-center">
                                    {r.hasEquifax ? "✓" : ""}
                                  </TableCell>
                                  <TableCell className="text-center">
                                    {r.hasTransUnion ? "✓" : ""}
                                  </TableCell>
                                </>
                              </SortableItem>
                            ))}
                          </SortableContext>
                        </React.Fragment>
                      );
                    })}
                  </DndContext>
                </TableBody>
              </Table>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between mt-3">
              <div className="text-xs text-[#2563EB] bg-[#EEF2FF] rounded px-2 py-1">
                {countLabel}
              </div>
              <div className="flex items-center gap-3">
                <Button variant="outline" onClick={() => onOpenChange(false)}>
                  Cancel
                </Button>
                <Button
                  className="bg-primary hover:bg-primary/90"
                  onClick={handleAdd}
                  disabled={selectedGroups.length === 0}
                >
                  Add Selected Groups to Dispute
                </Button>
              </div>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default AddDisputeItemsDialog;

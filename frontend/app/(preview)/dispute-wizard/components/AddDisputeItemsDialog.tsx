"use client";

import React, { useMemo, useState, useEffect } from "react";
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
import { CreditReportData } from "@/types/creditReport";

import { useDispute } from "@/context/disputeContext";

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
}

export interface AddDisputeItemsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAdd?: (ids: string[]) => void;
  email: string;
}

const AddDisputeItemsDialog: React.FC<AddDisputeItemsDialogProps> = ({
  open,
  onOpenChange,
  onAdd,
  email,
}) => {
  const [selected, setSelected] = useState<string[]>([]);
  const [rows, setRows] = useState<ItemRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (open && email) {
      loadCreditReportData();
    }
  }, [open, email]);
  const { disputeItems, addMultipleDisputeItems } = useDispute();

  useEffect(() => {
    if (open && rows.length) {
      const preSelected = rows
        .filter((r) => disputeItems.some((d) => d.id === r.id))
        .map((r) => r.id);
      setSelected(preSelected);
    }
  }, [open, rows, disputeItems]);

  const loadCreditReportData = async () => {
    try {
      setLoading(true);
      const response = await fetchStoredCreditReport(email);

      if (response.success && response.data) {
        const creditData = response.data as CreditReportData;
        const disputeRows = transformCreditDataToDisputeRows(creditData);
        setRows(disputeRows);
      }
    } catch (error) {
      console.error("Error loading credit report:", error);
    } finally {
      setLoading(false);
    }
  };

  const transformCreditDataToDisputeRows = (
    creditData: CreditReportData
  ): ItemRow[] => {
    const rows: ItemRow[] = [];

    // Add inquiries as dispute items

    // Add negative accounts as dispute items
    if (creditData.accountInfo) {
      // Experian accounts
      creditData.accountInfo.Experian?.forEach((account, index) => {
        if (account.status === "Negative") {
          rows.push({
            id: `exp_acc_${index}`,
            creditor: account.accountName || "",
            account: account.accountNumber || "N/A",
            dateOpened: account.dateOpened || "N/A",
            balance: account.currentBalance || "N/A",
            type: "---",
            disputed: false,
            hasExperian: true,
            hasEquifax: false,
            hasTransUnion: false,
          });
        }
      });

      // Equifax accounts
      creditData.accountInfo.Equifax?.forEach((account, index) => {
        if (account.status === "Negative") {
          rows.push({
            id: `equ_acc_${index}`,
            creditor: account.accountName || "",
            account: account.accountNumber || "N/A",
            dateOpened: account.dateOpened || "N/A",
            balance: account.currentBalance || "N/A",
            type: "---",
            disputed: false,
            hasExperian: false,
            hasEquifax: true,
            hasTransUnion: false,
          });
        }
      });

      // TransUnion accounts
      creditData.accountInfo.TransUnion?.forEach((account, index) => {
        if (account.status === "Negative") {
          rows.push({
            id: `tru_acc_${index}`,
            creditor: account.accountName || "",
            account: account.accountNumber || "N/A",
            dateOpened: account.dateOpened || "N/A",
            balance: account.currentBalance || "N/A",
            type: "---",
            disputed: false,
            hasExperian: false,
            hasEquifax: false,
            hasTransUnion: true,
          });
        }
      });
    }

    return rows;
  };

  const allChecked = selected.length === rows.length;
  const toggleAll = (checked: boolean) =>
    setSelected(checked ? rows.map((r) => r.id) : []);
  const toggle = (id: string, checked: boolean) =>
    setSelected((prev) =>
      checked ? [...prev, id] : prev.filter((x) => x !== id)
    );

  const countLabel = useMemo(() => {
    if (selected.length === 0) return "0 Selected Accounts";
    if (selected.length === 1) return "1 Selected Account";
    return `${selected.length} Selected Accounts`;
  }, [selected.length]);

  const handleAdd = () => {
  const selectedItems = rows.filter((r) => selected.includes(r.id));
  addMultipleDisputeItems(
    selectedItems.map((r) => ({
      id: r.id,
      creditor: r.creditor,
      account: r.account,
      dateOpened: r.dateOpened,
      balance: r.balance,
      type: r.type,
      disputed: r.disputed, // ✅ Include disputed field
      hasExperian: r.hasExperian,
      hasEquifax: r.hasEquifax,
      hasTransUnion: r.hasTransUnion,
    }))
  );
  onOpenChange(false);
};


  // const handleAdd = () => {
  //   onAdd?.(selected);
  //   onOpenChange(false);
  // };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[90vw] max-h-[92vh] overflow-y-auto bg-white">
        <DialogHeader>
          <DialogTitle className="text-[#111827]">
            Add saved/Pending items
          </DialogTitle>
        </DialogHeader>

        <div className="font-semibold text-sm leading-[20px] tracking-normal text-[#595858]">
          These are the negative items from your client&apos;s credit report. To
          see a list of all credit items and status, view the{" "}
          <span className="text-primary font-inter font-semibold text-sm leading-[20px] tracking-normal">
            dispute items tab{" "}
          </span>{" "}
          on the My Clients page.
          <br />
          Select the item(s) to include in your letter. On the next page you can
          choose which bureaus to include.
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <p>Loading dispute items...</p>
          </div>
        ) : (
          <>
            <div className="mt-3 rounded-lg border border-[#E5E7EB] overflow-hidden">
              <Table>
                <TableHeader className="bg-[#F9FAFB] sticky top-0 z-10">
                  <TableRow>
                    <TableHead className="w-[280px]">
                      <div className="flex items-center gap-2">
                        <Checkbox
                          checked={allChecked}
                          onCheckedChange={(v) => toggleAll(Boolean(v))}
                        />
                        Creditor/Furnisher
                      </div>
                    </TableHead>
                    <TableHead className="w-[260px]">Account #</TableHead>
                    <TableHead className="w-[140px]">Date Opened</TableHead>
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
                  {rows.map((r, idx) => {
                    const checked = selected.includes(r.id);
                    return (
                      <TableRow
                        key={r.id}
                        className={idx % 2 === 0 ? "bg-white" : "bg-[#FCFCFC]"}
                      >
                        <TableCell>
                          <div className="flex items-start gap-2">
                            <Checkbox
                              checked={checked}
                              onCheckedChange={(v) => toggle(r.id, Boolean(v))}
                            />
                            <div>
                              <div className="font-medium text-[#111827] leading-4">
                                {r.creditor}
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="whitespace-pre-line">
                          <div className="max-w-[220px] truncate leading-4">
                            {r.account}
                          </div>
                        </TableCell>
                        <TableCell>{r.dateOpened}</TableCell>
                        <TableCell>{r.balance}</TableCell>
                        <TableCell>{r.type}</TableCell>
                        <TableCell>{r.disputed ? "YES" : "NO"}</TableCell>
                        <TableCell className="text-center">
                          {r.hasExperian && (
                            <span
                              title="Remove Experian"
                              className="inline-flex p-0 h-8 w-8 items-center justify-center text-[#EF4444] text-[20px]"
                            >
                              ×
                            </span>
                          )}
                        </TableCell>
                        <TableCell className="text-center p-0">
                          {r.hasEquifax && (
                            <span
                              title="Remove Equifax"
                              className="inline-flex p-0 h-8 w-8 items-center justify-center text-[#EF4444] text-[20px]"
                            >
                              ×
                            </span>
                          )}
                        </TableCell>
                        <TableCell className="text-center p-0">
                          {r.hasTransUnion && (
                            <span
                              title="Remove TransUnion"
                              className="inline-flex p-0 h-8 w-8 items-center justify-center text-[#EF4444] text-[20px]"
                            >
                              ×
                            </span>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between mt-3">
              <div className="text-xs text-[#2563EB] bg-[#EEF2FF] rounded px-2 py-1">
                {countLabel} – Create Group
              </div>
              <div className="flex items-center gap-3">
                <Button variant="outline" onClick={() => onOpenChange(false)}>
                  Cancel
                </Button>
                <Button
                  className="bg-primary hover:bg-primary/90"
                  onClick={handleAdd}
                >
                  Add to Dispute
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

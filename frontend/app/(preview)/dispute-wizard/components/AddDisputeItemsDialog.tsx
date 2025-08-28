"use client"

import React, { useMemo, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import Image from "next/image";
import { Equifax, Experian, TransUnion } from "@/public/images";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface ItemRow {
  id: string;
  creditor: string;
  account: string;
  dateOpened: string;
  balance: string;
  type: string;
  disputed: boolean;
}

export interface AddDisputeItemsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAdd?: (ids: string[]) => void;
}

const MOCK_ROWS: ItemRow[] = [
  { id: "r0", creditor: "", account: "EQUIFAX:\nExperian:\nTransUnion:", dateOpened: "08/07/2021", balance: "$2,265", type: "---", disputed: false },
  { id: "r02", creditor: "", account: "EQUIFAX:\nExperian:\nTransUnion:", dateOpened: "08/07/2021", balance: "$2,265", type: "---", disputed: false },
  { id: "r1", creditor: "1ST INVESTOR", account: "EQUIFAX:\nExperian:\nTransUnion:", dateOpened: "08/07/2021", balance: "$2,265", type: "---", disputed: false },
  { id: "r2", creditor: "First INVST SVC/FIRST", account: "EQUIFAX:\nExperian:\nTransUnion:", dateOpened: "08/07/2021", balance: "$2,265", type: "---", disputed: false },
  { id: "r3", creditor: "WFBNA CARD", account: "EQUIFAX:\nExperian:\nTransUnion:", dateOpened: "08/07/2021", balance: "$2,265", type: "---", disputed: false },
  { id: "r4", creditor: "AMEX", account: "EQUIFAX:\nExperian:\nTransUnion:", dateOpened: "08/07/2021", balance: "$2,265", type: "---", disputed: false },
];

const AddDisputeItemsDialog: React.FC<AddDisputeItemsDialogProps> = ({ open, onOpenChange, onAdd }) => {
  const [selected, setSelected] = useState<string[]>([]);

  const allChecked = selected.length === MOCK_ROWS.length;
  const toggleAll = (checked: boolean) => setSelected(checked ? MOCK_ROWS.map((r) => r.id) : []);
  const toggle = (id: string, checked: boolean) => setSelected((prev) => (checked ? [...prev, id] : prev.filter((x) => x !== id)));

  const countLabel = useMemo(() => {
    if (selected.length === 0) return "0 Selected Accounts";
    if (selected.length === 1) return "1 Selected Account";
    return `${selected.length} Selected Accounts`;
  }, [selected.length]);

  const handleAdd = () => {
    onAdd?.(selected);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[90vw] max-h-[92vh] overflow-y-auto bg-white">
        <DialogHeader>
          <DialogTitle className="text-[#111827]">Add saved/Pending items</DialogTitle>
        </DialogHeader>

        <div className="font-semibold text-sm leading-[20px] tracking-normal text-[#595858]">
            These are the negative items from your client’s credit report. To see a list of all credit items and status, view the <span className="text-primary font-inter font-semibold text-sm leading-[20px] tracking-normal">dispute items tab </span> on the My Clients page.
            <br />
            Select the item(s) to include in your letter. On the next page you can choose which bureaus to include.
        </div>

        <div className="mt-3 rounded-lg border border-[#E5E7EB] overflow-hidden">
          <Table>
            <TableHeader className="bg-[#F9FAFB] sticky top-0 z-10">
              <TableRow>
                <TableHead className="w-[280px]">
                  <div className="flex items-center gap-2">
                    <Checkbox checked={allChecked} onCheckedChange={(v) => toggleAll(Boolean(v))} />
                    Creditor/Furnisher
                  </div>
                </TableHead>
                <TableHead className="w-[260px]">Account #</TableHead>
                <TableHead className="w-[140px]">Date Opened</TableHead>
                <TableHead className="w-[120px]">Balance</TableHead>
                <TableHead className="w-[100px]">Type</TableHead>
                <TableHead className="w-[90px]">Disputed</TableHead>
                <TableHead className="text-center w-[90px]"><Image src={Experian} alt="Experian" width={54} height={14} /></TableHead>
                <TableHead className="text-center w-[90px]"><Image src={Equifax} alt="Equifax" width={54} height={14} /></TableHead>
                <TableHead className="text-center w-[90px]"><Image src={TransUnion} alt="TransUnion" width={54} height={14} /></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {MOCK_ROWS.map((r, idx) => {
                const checked = selected.includes(r.id);
                return (
                  <TableRow key={r.id} className={idx % 2 === 0 ? "bg-white" : "bg-[#FCFCFC]"}>
                    <TableCell>
                      <div className="flex items-start gap-2">
                        <Checkbox checked={checked} onCheckedChange={(v) => toggle(r.id, Boolean(v))} />
                        <div>
                          <div className="font-medium text-[#111827] leading-4">{r.creditor}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="whitespace-pre-line">
                      <div className="max-w-[220px] truncate leading-4">{r.account.split("\n")[0]}</div>
                      <div className="max-w-[220px] truncate leading-4">{r.account.split("\n")[1]}</div>
                      <div className="max-w-[220px] truncate leading-4">{r.account.split("\n")[2]}</div>
                    </TableCell>
                    <TableCell>{r.dateOpened}</TableCell>
                    <TableCell>{r.balance}</TableCell>
                    <TableCell>{r.type}</TableCell>
                    <TableCell>{r.disputed ? "YES" : "NO"}</TableCell>
                    <TableCell className="text-center">
                      <span title="Remove Experian" className="inline-flex p-0 h-8 w-8 items-center justify-center text-[#EF4444] text-[20px]">×</span>
                    </TableCell>
                    <TableCell className="text-center p-0">
                      <span title="Remove Equifax" className="inline-flex p-0 h-8 w-8 items-center justify-center text-[#EF4444] text-[20px]">×</span>
                    </TableCell>
                    <TableCell className="text-center p-0">
                      <span title="Remove TransUnion" className="inline-flex p-0 h-8 w-8 items-center justify-center text-[#EF4444] text-[20px]">×</span>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between mt-3">
          <div className="text-xs text-[#2563EB] bg-[#EEF2FF] rounded px-2 py-1">{countLabel} – Create Group</div>
          <div className="flex items-center gap-3">
            <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button className="bg-primary hover:bg-primary/90" onClick={handleAdd}>Add to Dispute</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AddDisputeItemsDialog;
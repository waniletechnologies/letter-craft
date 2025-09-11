"use client";

import React from "react";
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
}

const BureauHeader: React.FC<{
  src: string;
  alt: string;
  checked: boolean;
  onToggle: (checked: boolean) => void;
}> = ({ src, alt, checked, onToggle }) => (
  <div className="flex items-center justify-center py-3 gap-2">
    <input
      type="checkbox"
      checked={checked}
      onChange={(e) => onToggle(e.target.checked)}
      className="h-4 w-4 accent-[#2563EB] border-gray-300 rounded flex-shrink-0"
    />
    <Image src={src} alt={alt} width={90} height={24} />
  </div>
);

const ValueCell: React.FC<{ value?: string }> = ({ value }) => (
  <div className="py-2">
    <div className="font-medium text-xs leading-[150%] -tracking-[0.03em] text-[#292524]">
      {value ?? ""}
    </div>
  </div>
);

const AccountTable: React.FC<{ account: AccountInfoRow }> = ({ account }) => {
  const [selectedBureaus, setSelectedBureaus] = React.useState<
    Record<Bureau, boolean>
  >({
    Experian: false,
    Equifax: false,
    TransUnion: false,
  });
  // Inside AccountTable component in AccountInfoTable.tsx

  const { addOrUpdateDisputeItem, removeDisputeItem, disputeItems } =
    useDispute();

  const handleBureauToggle = (bureau: Bureau, checked: boolean) => {
    setSelectedBureaus((prev) => ({ ...prev, [bureau]: checked }));

    const bureauData = account.values[bureau];
    const disputeId = `${account.id}-${bureau}`;

    if (checked) {
      addOrUpdateDisputeItem({
        id: disputeId,
        creditor: bureauData.accountName,
        account: bureauData.accountNumber,
        dateOpened: bureauData.lastVerified,
        balance: bureauData.highBalance,
        type: account.status,
        hasExperian: bureau === "Experian",
        hasEquifax: bureau === "Equifax",
        hasTransUnion: bureau === "TransUnion",
      });
    } else {
      removeDisputeItem(disputeId);
    }
  };

  // Pre-check if item already exists in context
  React.useEffect(() => {
    const existing = {
      Experian: disputeItems.some((i) => i.id === `${account.id}-Experian`),
      Equifax: disputeItems.some((i) => i.id === `${account.id}-Equifax`),
      TransUnion: disputeItems.some((i) => i.id === `${account.id}-TransUnion`),
    };
    setSelectedBureaus(existing);
  }, [disputeItems, account.id]);

  const isNegative = account.status === "Negative";

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
                checked={selectedBureaus.Experian}
                onToggle={(c) => handleBureauToggle("Experian", c)}
              />
            </TableHead>
            <TableHead className="w-[26%] p-0">
              <BureauHeader
                src={Equifax}
                alt="Equifax"
                checked={selectedBureaus.Equifax}
                onToggle={(c) => handleBureauToggle("Equifax", c)}
              />
            </TableHead>
            <TableHead className="w-[26%] p-0">
              <BureauHeader
                src={TransUnion}
                alt="TransUnion"
                checked={selectedBureaus.TransUnion}
                onToggle={(c) => handleBureauToggle("TransUnion", c)}
              />
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {[
            ["ACCOUNT NAME:", "accountName"],
            ["ACCOUNT #:", "accountNumber"],
            ["HIGH BALANCE:", "highBalance"],
            ["LAST VERIFIED", "lastVerified"],
          ].map(([label, key]) => (
            <TableRow key={label} className="border-b border-[#00000014]">
              <TableCell className="font-medium text-xs leading-[1.5] -tracking-[0.03em] text-right w-[22%] text-[#292524] border-r border-[#00000014] p-3">
                {label}
              </TableCell>
              {(["Experian", "Equifax", "TransUnion"] as Bureau[]).map(
                (b, i) => (
                  <TableCell
                    key={i}
                    className={`px-2 w-[26%] ${
                      i < 2 ? "border-r" : ""
                    } border-[#00000014] py-2 ${
                      isNegative ? "bg-[#FFE2E2]" : ""
                    }`}
                  >
                    <ValueCell
                      value={
                        (account.values[b] as any)[key as keyof typeof account]
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
            {(["Experian", "Equifax", "TransUnion"] as Bureau[]).map((b, i) => (
              <TableCell
                key={i}
                className="px-2 w-[26%] border-r border-[#00000014] py-2 bg-[#F6F6F6]"
              >
                <ValueCell value={account.values[b].status} />
              </TableCell>
            ))}
          </TableRow>
        </TableBody>
      </Table>
    </div>
  );
};

export const AccountInfoTable: React.FC<AccountInfoTableProps> = ({ rows }) => (
  <div className="space-y-6">
    {rows.map((account) => (
      <AccountTable key={account.id} account={account} />
    ))}
  </div>
);

export default AccountInfoTable;

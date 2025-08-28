"use client"

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

export type Bureau = "Experian" | "Equifax" | "TransUnion";

export interface CreditSummaryRow {
  id: string;
  label: string;
  values: Partial<Record<Bureau, string | number>>;
}

export interface CreditSummaryTableProps {
  rows: CreditSummaryRow[];
}

const BureauHeader: React.FC<{ src: string; alt: string }> = ({ src, alt }) => (
  <div className="flex items-center py-3">
    <Image src={src} alt={alt} width={90} height={24} />
  </div>
);

const ValueCell: React.FC<{ value?: string | number }> = ({ value }) => {
  return (
    <div className="font-medium text-xs leading-[150%] -tracking-[0.03em] text-[#292524] py-2">
      {value ?? ""}
    </div>
  );
};

export const CreditSummaryTable: React.FC<CreditSummaryTableProps> = ({ rows }) => {
  return (
    <div className="rounded-xl border-2 border-[#E5E7EB] bg-white overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-[#FAFAFA] border-b-2 border-[#E5E7EB]">
            <TableHead className="w-[22%] items-start p-0" />
            <TableHead className="w-[26%] p-0">
              <BureauHeader src={Experian} alt="Experian" />
            </TableHead>
            <TableHead className="w-[26%] p-0">
              <BureauHeader src={Equifax} alt="Equifax" />
            </TableHead>
            <TableHead className="w-[26%] p-0">
              <BureauHeader src={TransUnion} alt="TransUnion" />
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((r, idx) => (
            <TableRow
              key={r.id}
              className={`${idx % 2 === 0 ? "bg-white" : "bg-[#FCFCFC]"} border-b border-[#E5E7EB]`}
            >
              <TableCell className="font-medium text-xs leading-[1.5] -tracking-[0.03em] text-right w-[22%] text-[#292524] border-r border-[#00000014] p-3">
                {r.label}
              </TableCell>
              <TableCell className="px-2 w-[26%] border-r border-[#E5E7EB] py-0">
                <ValueCell value={r.values.Experian} />
              </TableCell>
              <TableCell className="px-2 w-[26%] border-r border-[#E5E7EB] py-0">
                <ValueCell value={r.values.Equifax} />
              </TableCell>
              <TableCell className="px-2 w-[26%] py-0">
                <ValueCell value={r.values.TransUnion} />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default CreditSummaryTable;

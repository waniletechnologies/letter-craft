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
import { FaCheck } from "react-icons/fa";

export type Bureau = "Experian" | "Equifax" | "TransUnion";

// Only two states now: dispute or empty
type InquiryCell = "dispute" | "";

export interface CreditInquiryRow {
  id: string;
  label: { name: string; date: string };
  values: Partial<Record<Bureau, InquiryCell>>;
}

export interface CreditInquiryTableProps {
  rows: CreditInquiryRow[];
}

const BureauHeader: React.FC<{ src: string; alt: string }> = ({ src, alt }) => (
  <div className="flex items-center py-3">
    <Image src={src} alt={alt} width={90} height={24} />
  </div>
);

const InquiryCellView: React.FC<{ status?: InquiryCell }> = ({ status }) => {
  if (status === "dispute") {
    return (
      <div className="flex flex-col items-center gap-2 py-2">
        <FaCheck className="text-[#00A650]" size={14} />
        <div className="flex items-center gap-2">
          <input type="checkbox" className="h-4 w-4 accent-[#2563EB] border-gray-300 rounded" />
          <span className="text-[12px] leading-[18px] text-[#292524]">Click To Dispute This Inquiry</span>
        </div>
      </div>
    );
  }
  return <div className="py-2" />;
};

const LabelCell: React.FC<{ name: string; date: string }> = ({ name, date }) => (
  <div className="flex flex-col py-2">
    <span className="font-medium text-xs leading-[1.5] -tracking-[0.03em] text-[#292524]">{name}</span>
    <span className="text-[11px] leading-[1.4] text-[#6B7280]">{date}</span>
  </div>
);

export const CreditInquiryTable: React.FC<CreditInquiryTableProps> = ({ rows }) => {
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
                <LabelCell name={r.label.name} date={r.label.date} />
              </TableCell>
              <TableCell className="px-2 w-[26%] border-r border-[#E5E7EB] py-0">
                <InquiryCellView status={r.values.Experian} />
              </TableCell>
              <TableCell className="px-2 w-[26%] border-r border-[#E5E7EB] py-0">
                <InquiryCellView status={r.values.Equifax} />
              </TableCell>
              <TableCell className="px-2 w-[26%] py-0">
                <InquiryCellView status={r.values.TransUnion} />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default CreditInquiryTable;
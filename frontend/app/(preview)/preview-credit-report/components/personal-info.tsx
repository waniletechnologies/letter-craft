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

export interface PersonalInfoRow {
  id: string;
  label: string;
  values: Partial<Record<Bureau, string | string[]>>;
  selectable?: boolean;
}

export interface PersonalInfoTableProps {
  rows: PersonalInfoRow[];
}

const BureauHeader: React.FC<{ src: string; alt: string }> = ({ src, alt }) => (
  <div className="flex items-center py-3">
    <Image src={src} alt={alt} width={90} height={24} />
  </div>
);

const ValueCell: React.FC<{ value?: string | string[]; selectable?: boolean }> = ({ value, selectable }) => {
  const content = Array.isArray(value) ? (
    <ul className="list-disc space-y-2">
      {value.map((v, i) => (
        <li key={i} className="leading-relaxed list-none flex items-start gap-1">
          {selectable && (
            <input 
              type="checkbox" 
              className="mt-1 h-4 w-4 accent-[#2563EB] border-gray-300 rounded flex-shrink-0" 
            />
          )}
          <span>{v}</span>
        </li>
      ))}
    </ul>
  ) : (
    <span className="leading-relaxed">{value ?? ""}</span>
  );
  
  // Only show checkbox if selectable AND there's content (for single values)
  const hasContent = Array.isArray(value) ? value.length > 0 : (value && value.trim() !== '');
  const shouldShowCheckbox = selectable && hasContent && !Array.isArray(value);
  
  return (
    <div className="flex items-start gap-3 py-2">
      {shouldShowCheckbox ? (
        <input 
          type="checkbox" 
          className="mt-1 h-4 w-4 accent-[#2563EB] border-gray-300 rounded" 
        />
      ) : null}
      <div className="font-medium text-xs leading-[150%] -tracking-[0.03em] text-[#292524] flex-1">{content}</div>
    </div>
  );
};

export const PersonalInfoTable: React.FC<PersonalInfoTableProps> = ({ rows }) => {
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
                <ValueCell value={r.values.Experian} selectable={r.selectable} />
              </TableCell>
              <TableCell className="px-2 w-[26%] border-r border-[#E5E7EB] py-0">
                <ValueCell value={r.values.Equifax} selectable={r.selectable} />
              </TableCell>
              <TableCell className="px-2 w-[26%] py-0">
                <ValueCell value={r.values.TransUnion} selectable={r.selectable} />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default PersonalInfoTable;

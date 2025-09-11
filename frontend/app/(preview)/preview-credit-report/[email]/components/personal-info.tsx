"use client";

import React, { useState } from "react";
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
    <Image
      src={src}
      alt={alt}
      width={90}
      height={24}
      className="w-16 md:w-20 lg:w-24"
    />
  </div>
);

const ValueCell: React.FC<{
  value?: string | string[];
  selectable?: boolean;
}> = ({ value, selectable }) => {
  const content = Array.isArray(value) ? (
    <ul className="list-disc space-y-1 md:space-y-2">
      {value.map((v, i) => (
        <li
          key={i}
          className="leading-relaxed list-none flex items-start gap-1 break-words"
        >
          {selectable && (
            <input
              type="checkbox"
              className="mt-0.5 md:mt-1 h-3 w-3 md:h-4 md:w-4 accent-[#2563EB] border-gray-300 rounded flex-shrink-0"
            />
          )}
          <span className="text-xs md:text-xs break-words whitespace-normal">
            {v}
          </span>
        </li>
      ))}
    </ul>
  ) : (
    <span className="leading-relaxed text-xs md:text-xs break-words whitespace-normal">
      {value ?? ""}
    </span>
  );

  const hasContent = Array.isArray(value)
    ? value.length > 0
    : value && value.trim() !== "";
  const shouldShowCheckbox = selectable && hasContent && !Array.isArray(value);

  return (
    <div className="flex items-start gap-2 md:gap-3 py-1 md:py-2">
      {shouldShowCheckbox ? (
        <input
          type="checkbox"
          className="mt-0.5 md:mt-1 h-3 w-3 md:h-4 md:w-4 accent-[#2563EB] border-gray-300 rounded flex-shrink-0"
        />
      ) : null}
      <div className="font-medium text-xs leading-[150%] -tracking-[0.03em] text-[#292524] flex-1 break-words whitespace-normal">
        {content}
      </div>
    </div>
  );
};

export const PersonalInfoTable: React.FC<PersonalInfoTableProps> = ({
  rows,
}) => {
  const [isMobileView, setIsMobileView] = useState(false);

  React.useEffect(() => {
    const checkMobile = () => {
      setIsMobileView(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);

    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  if (isMobileView) {
    return (
      <div className="rounded-xl border-2 border-[#E5E7EB] bg-white overflow-hidden">
        <div className="bg-[#FAFAFA] border-b-2 border-[#E5E7EB] p-3">
          <div className="flex justify-between items-center">
            <BureauHeader src={Experian} alt="Experian" />
            <BureauHeader src={Equifax} alt="Equifax" />
            <BureauHeader src={TransUnion} alt="TransUnion" />
          </div>
        </div>

        <div className="divide-y divide-[#E5E7EB]">
          {rows.map((row) => (
            <div key={row.id} className="p-3">
              <div className="font-medium text-xs leading-[1.5] -tracking-[0.03em] text-[#292524] mb-2 break-words">
                {row.label}
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div className="text-center">
                  <div className="mb-1">
                    <Image
                      src={Experian}
                      alt="Experian"
                      width={60}
                      height={16}
                      className="mx-auto"
                    />
                  </div>
                  <div className="min-h-[40px] flex items-center justify-center">
                    <ValueCell
                      value={row.values.Experian}
                      selectable={row.selectable}
                    />
                  </div>
                </div>

                <div className="text-center">
                  <div className="mb-1">
                    <Image
                      src={Equifax}
                      alt="Equifax"
                      width={60}
                      height={16}
                      className="mx-auto"
                    />
                  </div>
                  <div className="min-h-[40px] flex items-center justify-center">
                    <ValueCell
                      value={row.values.Equifax}
                      selectable={row.selectable}
                    />
                  </div>
                </div>

                <div className="text-center">
                  <div className="mb-1">
                    <Image
                      src={TransUnion}
                      alt="TransUnion"
                      width={60}
                      height={16}
                      className="mx-auto"
                    />
                  </div>
                  <div className="min-h-[40px] flex items-center justify-center">
                    <ValueCell
                      value={row.values.TransUnion}
                      selectable={row.selectable}
                    />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl border-2 border-[#E5E7EB] bg-white overflow-hidden w-full">
      <Table className="hidden md:table w-full">
        <TableHeader>
          <TableRow className="bg-[#FAFAFA] border-b-2 border-[#E5E7EB]">
            <TableHead className="w-[20%] max-w-[20%] p-3 text-right">
              {/* Label column header */}
            </TableHead>
            <TableHead className="w-[26%] max-w-[26%] p-0">
              <BureauHeader src={Experian} alt="Experian" />
            </TableHead>
            <TableHead className="w-[26%] max-w-[26%] p-0">
              <BureauHeader src={Equifax} alt="Equifax" />
            </TableHead>
            <TableHead className="w-[26%] max-w-[26%] p-0">
              <BureauHeader src={TransUnion} alt="TransUnion" />
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((r, idx) => (
            <TableRow
              key={r.id}
              className={`${
                idx % 2 === 0 ? "bg-white" : "bg-[#FCFCFC]"
              } border-b border-[#E5E7EB]`}
            >
              <TableCell className="font-medium text-xs leading-[1.5] -tracking-[0.03em] text-right w-[20%] max-w-[20%] text-[#292524] border-r border-[#00000014] p-3 break-words whitespace-normal">
                {r.label}
              </TableCell>
              <TableCell className="w-[26%] max-w-[26%] p-2 border-r border-[#E5E7EB] align-top">
                <ValueCell
                  value={r.values.Experian}
                  selectable={r.selectable}
                />
              </TableCell>
              <TableCell className="w-[26%] max-w-[26%] p-2 border-r border-[#E5E7EB] align-top">
                <ValueCell value={r.values.Equifax} selectable={r.selectable} />
              </TableCell>
              <TableCell className="w-[26%] max-w-[26%] p-2 align-top">
                <ValueCell
                  value={r.values.TransUnion}
                  selectable={r.selectable}
                />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default PersonalInfoTable;

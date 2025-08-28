"use client"

import React from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/card";
import { LuDownload, LuEye } from "react-icons/lu";

export type CreditBureau = "Equifax" | "Experian" | "TransUnion" | string;

export interface ReportCardProps {
  fullName: string;
  statusLabel?: string; 
  importedOn: string; 
  importedVia: string; 
  creditBureaus: CreditBureau[]; 
  accountsCount: number;
  negativeItemsCount: number;
  onView?: () => void;
  onExport?: () => void;
}


const getStatusBadge = (status: string) => {
  const baseClasses = 'text-[11px] font-normal rounded-full px-2';
  switch (status) {
    case 'Complete':
      return (
        <Badge className={`${baseClasses} bg-[#5881F0] text-[#FFFFFF] hover:bg-[#5881F0]`}>Complete</Badge>
      );
    case 'Partial':
      return (
        <Badge className={`${baseClasses} bg-[#F9FAFB] text-[#3D3D3D] hover:bg-[#F9FAFB]`}>Partial</Badge>
      );
    default:
      return (
        <Badge className={`${baseClasses} bg-[#f0f0f0] text-[#848484] hover:bg-[#f0f0f0]`}>{status}</Badge>
      );
  }
};

export const ReportCard: React.FC<ReportCardProps> = ({
  fullName,
  statusLabel = "Complete",
  importedOn,
  importedVia,
  creditBureaus,
  accountsCount,
  negativeItemsCount,
  onView,
  onExport,
}) => {
  return (
    <Card className="w-full rounded-2xl bg-white shadow-none border-none">
      <CardHeader className="pb-2">
        <div className="flex items-center gap-6">
          <h3 className="font-semibold text-[16px] leading-[17.84px] -tracking-[0.03em] text-[#3D3D3D]">
            {fullName}
          </h3>
          {statusLabel ? getStatusBadge(statusLabel) : null}
        </div>
        
        <p className="font-medium text-xs leading-[11px] -tracking-[0.03em] text-[#9F98AA]">
          Imported on {importedOn} via {importedVia}
        </p>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Credit Bureaus */}
        <div>
          <p className="mb-2 font-medium text-xs leading-[11px] -tracking-[0.03em] text-[#3D3D3D]">Credit Bureaus</p>
          <div className="flex flex-wrap gap-2">
            {creditBureaus.map((b) => (
              <Badge key={b} variant="outline" className="px-3 py-1 border border-[#676667] rounded-full font-normal text-[11px] leading-[100%] tracking-normal text-[#676667]">
                {b}
              </Badge>
            ))}
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-2">
          <div className="rounded-xl bg-[#F9FAFB] px-3 py-3 font-medium text-xs leading-[11px] -tracking-[0.03em] text-[#3D3D3D]">
            <span className="font-normal">Accounts :</span> <span className="ml-1">{accountsCount}</span>
          </div>
          <div className="rounded-xl bg-[#F9FAFB] px-3 py-3 font-medium text-xs leading-[11px] -tracking-[0.03em] text-[#3D3D3D]">
            <span className="font-normal">Negative Items :</span>{" "}
            <span className="ml-1 text-[#EF4444]">{negativeItemsCount}</span>
          </div>
        </div>
      </CardContent>

      <CardFooter>
        <div className="flex items-center gap-3 w-full">
          <Button
            variant="secondary"
            className="h-10 flex-1 bg-white text-[#3E3E3E] shadow-none border border-[#00000014] hover:bg-white/90"
            onClick={onView}
          >
            <LuEye className="mr-1 h-4 w-4" />
            View
          </Button>
          <Button
            className="h-10 flex-1 bg-white text-[#3E3E3E] shadow-none border border-[#00000014] hover:bg-white/90"
            onClick={onExport}
          >
            <LuDownload className="mr-1 h-4 w-4" />
            Export
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
};

export default ReportCard;



"use client"

import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Mail, Eye, Download } from "lucide-react";
import { cn } from "@/lib/utils";

export type LetterStatus = "Sent" | "Draft" | "Delivered";

export interface LetterCardProps {
  clientName: string;
  bureau: "Experian" | "Equifax" | "TransUnion";
  letterType: string; // e.g. Account Verification, Debt Validation
  round: number;      // Round number
  status: LetterStatus;
  sendMethod?: string; // e.g. Mail, Fax, Not selected
  dateSent?: string;   // e.g. 2024-06-15 or Not sent
  tracking?: string;   // tracking or confirmation text
  onPreview?: () => void;
  onDownload?: () => void;
}

const statusBadgeStyles: Record<LetterStatus, string> = {
  Sent: "bg-[#5881F0] text-[#FFFFFF]",
  Draft: "bg-[#EEEEEE] text-[#3D3D3D]",
  Delivered: "bg-[#00A650] text-[#FFFFFF]",
};

export const LetterCard: React.FC<LetterCardProps> = ({
  clientName,
  bureau,
  letterType,
  round,
  status,
  sendMethod = "Not selected",
  dateSent = "Not sent",
  tracking = "",
  onPreview,
  onDownload,
}) => {
  return (
    <Card className="bg-white border-none shadow-none p-0">
      <CardContent className="p-8">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <Mail className="h-5 w-5 text-[#000000]" />
            <h3 className="font-semibold text-[24px] leading-[17.84px] -tracking-[0.03em] text-[#3D3D3D]">
              {clientName} - {bureau}
            </h3>
          </div>
          <Badge className={cn("rounded-full px-3 py-1.5 items-center font-normal text-[11px] leading-none tracking-normal", statusBadgeStyles[status])}>{status}</Badge>
        </div>

        {/* Sub header */}
        <div className="mt-2 font-medium text-xs leading-[11px] -tracking-[0.03em] text-[#9F98AA]">
          {letterType} • Round {round}
        </div>

        {/* Meta grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 max-w-[300px] gap-6 mt-6">
          <div>
            <div className="font-medium text-[12px] leading-[11px] -tracking-[0.03em] text-[#3D3D3DB2]/70 mb-1">Send Method</div>
            <div className="font-medium text-[12px] leading-[11px] -tracking-[0.03em] text-[#3D3D3D]">{sendMethod}</div>
          </div>
          <div>
            <div className="font-medium text-[12px] leading-[11px] -tracking-[0.03em] text-[#3D3D3DB2]/70 mb-1">Date Sent</div>
            <div className="font-medium text-[12px] leading-[11px] -tracking-[0.03em] text-[#3D3D3D]">{dateSent}</div>
          </div>
        </div>

        {/* Tracking */}
        <div className="mt-6">
          <div className="font-medium text-xs leading-[11px] -tracking-[0.03em] text-[#000000] mb-2">Tracking/Confirmation</div>
          <div className="w-full rounded-md bg-[#F9FAFB] text-[#000000B2]/70 font-medium text-xs leading-[11px] -tracking-[0.03em] px-3 py-2">
            {tracking || "—"}
          </div>
        </div>

        {/* Actions */}
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-6">
          <Button variant="outline" onClick={onPreview} className="bg-white border-[#00000014] shadow-none text-[#3D3D3D] py-5">
            <Eye className="h-4 w-4 text-[#000000]" /> Preview
          </Button>
          <Button variant="outline" onClick={onDownload} className="bg-white border-[#00000014] shadow-none text-[#3D3D3D] py-5">
            <Download className="h-4 w-4 text-[#000000]" /> Download    
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default LetterCard;

"use client"

import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { LuClock, LuMapPinned } from "react-icons/lu";
import { FileText } from "lucide-react";
import { CiCalendar } from "react-icons/ci";

export type ItemStatus = "Pending" | "In Review" | "Resolved";

export interface DisputedItem {
  id: string;
  title: string;
  account: string;
  status: ItemStatus;
}

export interface ViewDisputeDetailsProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  clientName: string;
  bureau: "Experian" | "Equifax" | "TransUnion";
  round: number;
  status: "in-progress" | "completed" | "pending" | "failed";
  progress: number; // 0..100
  createdDate: string;
  expectedResponseDate: string;
  accountsCount: number;
  items: DisputedItem[];
}

const statusBadge = (status: ViewDisputeDetailsProps["status"]) => {
  const map: Record<string, string> = {
    "in-progress": "bg-[#5881F033] text-primary",
    completed: "bg-[#00A650] text-white",
    pending: "bg-[#FFA048] text-white",
    failed: "bg-red-600 text-white",
  };
  const label: Record<string, string> = {
    "in-progress": "In progress",
    completed: "Completed",
    pending: "Pending",
    failed: "Failed",
  };
  return <Badge className={cn("rounded-full px-3 py-1 text-xs", map[status])}>{label[status]}</Badge>;
};

export const ViewDisputeDetails: React.FC<ViewDisputeDetailsProps> = ({
  open,
  onOpenChange,
  clientName,
  bureau,
  round,  
  status,
  progress,
  createdDate,
  expectedResponseDate,
  accountsCount,
  items,
}) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[720px] max-h-[90vh] overflow-y-auto bg-white">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <span className="font-semibold text-[18px] text-[#111827]">Dispute Details - {clientName}</span>
          </DialogTitle>
        </DialogHeader>

        {/* Top summary */}
        <div className="flex items-center gap-4">
            {statusBadge(status)}
            <div className="text-xs text-[#6B7280]">Dispute ID: #1</div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div className="rounded-lg border border-[#00000014] p-4">
            <div className="flex items-center gap-2">
                <LuMapPinned className="h-4 w-4" />
                <div className="font-semibold text-[17px] leading-[100%] tracking-normal text-[#292524]">Bureau Information</div>
            </div>
            <div className="mt-4">
              <div className="font-medium text-[11px] leading-[100%] -tracking-[0.03em] text-[#292524B2]/70">{bureau}</div>
              <div className="font-medium text-sm leading-[100%] tracking-normal text-[#292524]">Round {round}</div>
            </div>
          </div>
          <div className="rounded-lg border border-[#00000014] p-4">
            <div className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                <div className="font-semibold text-[17px] leading-[100%] tracking-normal text-[#292524]">Accounts</div>
            </div>
            <div className="mt-4">
              <div className="font-medium text-[11px] leading-[100%] -tracking-[0.03em] text-[#292524B2]/70">{accountsCount} accounts</div>
              <div className="font-medium text-sm leading-[100%] tracking-normal text-[#292524]">Under dispute</div>
            </div>
          </div>
        </div>

        {/* Progress Overview */}
        <div className="rounded-lg border border-[#00000014] p-4 mb-4">
          <div className="text-[#292524] font-semibold text-[17px] leading-none tracking-normal mb-2">Progress Overview</div>
          <div className="font-medium text-[11px] leading-[100%] -tracking-[0.03em] text-[#292524B2]/70 mb-2">Overall Progress</div>
          <div className="w-full bg-[#D9D9D9] rounded-full h-2">
            <div className="h-2 rounded-full bg-[#5881F0]" style={{ width: `${progress}%` }} />
          </div>
          <div className="flex justify-between max-w-[300px] mt-3 text-xs text-[#6B7280]">
            <div className="flex items-center gap-2">
              <CiCalendar className="h-4 w-4" />
              <div className="flex flex-col gap-1">
                <span className="font-medium text-[11px] leading-[100%] -tracking-[0.03em]">Created</span>
                <div className="text-[#292524] font-medium text-sm leading-[100%] tracking-normal">{createdDate}</div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <LuClock className="h-4 w-4" />
              <div className="flex flex-col gap-1">
                <span className="font-medium text-[11px] leading-[100%] -tracking-[0.03em]">Expected Response</span>
                <div className="text-[#292524] font-medium text-sm leading-[100%] tracking-normal">{expectedResponseDate}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Disputed Items */}
        <div className="rounded-lg border border-[#00000014] p-4">
          <div className="font-semibold text-[17px] leading-[100%] tracking-normal text-[#292524] mb-1">Disputed Items</div>
          <div className="font-medium text-xs leading-[22px] -tracking-[0.03em] text-[#292524B2]/70 mb-3">Items being disputed with {bureau}</div>
          <div className="space-y-3">
            {items.map((it) => (
              <div key={it.id} className="flex items-center justify-between rounded-md bg-[#2196F30F] p-6">
                <div>
                  <div className="font-medium text-xs leading-[100%] tracking-normal text-[#292524] mb-2">{it.title}</div>
                  <div className="font-medium text-xs leading-[100%] tracking-normal text-[#292524]">Account #: {it.account}</div>
                </div>
                <div className="font-medium border rounded-full px-2 py-1.5 items-center border-[#3D3D3D] text-xs leading-[100%] tracking-normal text-[#292524]">{it.status}</div>
              </div>
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ViewDisputeDetails;
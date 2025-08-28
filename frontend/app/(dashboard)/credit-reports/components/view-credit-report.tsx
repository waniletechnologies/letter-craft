"use client"

import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { LuCircleCheckBig } from "react-icons/lu";
import { AlertTriangle } from "lucide-react";

type Account = {
  id: string;
  name: string;
  type: string;
  balance: string;
  status: "Current" | "30 Days Late" | string;
};

type NegativeItem = {
  id: string;
  label: string;
  bureau: string;
  date: string;
  impact?: "Low Impact" | "Medium Impact" | "High Impact" | "Very High Impact" | string;
};

export interface ViewCreditReportProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  fullName: string;
  status: string;
  importedOn: string;
  bureaus: string[];
  score?: number;
  accounts?: Account[];
  negativeItems?: NegativeItem[];
}

const ProgressBar: React.FC<{ label: string; value: number }> = ({ label, value }) => (
  <div className="space-y-1">
    <div className="flex items-center justify-between text-xs text-[#6B7280]"><span>{label}</span><span>{value}%</span></div>
    <div className="h-2 w-full rounded-full bg-[#F1F5F9]"><div className="h-2 rounded-full bg-[#2563EB]" style={{ width: `${Math.min(100, Math.max(0, value))}%` }} /></div>
  </div>
);

const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
  const styles =
    status === "Complete"
      ? "bg-[#5881F0] text-white"
      : status === "Partial"
      ? "bg-[#F3F4F6] text-[#3D3D3D]"
      : "bg-[#f0f0f0] text-[#848484]";
  return <Badge className={cn("text-[11px] rounded-full px-2", styles)}>{status}</Badge>;
};

const ImpactBadge: React.FC<{ impact?: string }> = ({ impact }) => {
  const label = impact || "High Impact";
  return (
    <Badge className={cn("rounded-full px-3 py-1 text-[11px] font-medium text-white bg-[#DD5858]")}>
      {label}
    </Badge>
  );
};

export const ViewCreditReport: React.FC<ViewCreditReportProps> = ({
  open,
  onOpenChange,
  fullName,
  status,
  importedOn,
  bureaus,
  score = 678,
  accounts = [],
  negativeItems = [],
}) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[760px] max-h-[90vh] overflow-y-auto bg-[#FFFFFF]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3 text-[#3D3D3D]">
            <span>Credit Report - {fullName}</span>
            <StatusBadge status={status} />
            <span className="text-xs font-medium text-[#9CA3AF]">Imported on {importedOn}</span>
          </DialogTitle>
        </DialogHeader>

        {/* Score overview */}
        <div className="rounded-xl bg-[#2196F30F] border-none p-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="rounded-lg bg-[#FFFFFF] p-4 text-center">
              <div className="text-xs text-[#6B7280]">Credit Score Overview</div>
              <div className="text-3xl font-semibold text-[#2563EB]">{score}</div>
              <div className="text-[11px] text-[#22C55E]">+12 points</div>
              <div className="text-[11px] text-[#6B7280]">FICO Score</div>
            </div>
            <div className="md:col-span-2 space-y-3">
              <ProgressBar label="Credit Utilization" value={36} />
              <ProgressBar label="Payment History" value={72} />
              <ProgressBar label="Credit Age" value={27} />
            </div>
          </div>
        </div>

        {/* Bureaus */}
        <div className="rounded-xl bg-[#FFFFFF0F] border border-[#00000014] p-4">
          <div className="mb-3 font-semibold text-[17px] leading-[100%] tracking-normal text-[#292524]">Credit Bureau Reports</div>
          <div className="flex flex-wrap gap-2">
            {bureaus.map((b) => (
              <Badge key={b} variant="outline" className="px-3 py-1 items-center rounded-full font-normal text-[11px] leading-[100%] tracking-normal text-[#676667] border-[#676667]">
                <LuCircleCheckBig className="h-3 w-3 mr-1" />
                {b}
              </Badge>
            ))}
          </div>
        </div>

        {/* Accounts */}
        <div className="rounded-xl bg-[#FFFFFF0F] border border-[#00000014] p-4">
          <div className="mb-3 font-semibold text-[17px] leading-none tracking-normal text-[#292524]">Credit Accounts ({accounts.length})</div>
          <div className="space-y-2">
            {accounts.map((a) => (
              <div key={a.id} className="flex items-center justify-between rounded-lg border border-[#00000014] bg-white p-3">
                <div>
                  <div className="font-semibold text-sm leading-none tracking-normal text-[#292524]">{a.name}</div>
                  <div className="font-medium text-[11px] leading-[100%] -tracking-[0.03em] text-[#292524B2]">{a.type}</div>
                </div>
                <div className="font-semibold text-sm leading-[100%] -tracking-[0.03em] text-[#292524]">{a.balance}</div>
                <Badge className={cn("rounded-full px-2 font-normal text-[11px] leading-[100%] tracking-normal", a.status === 'Current' ? 'bg-[#5881F0] text-white' : 'bg-[#DD5858] text-[#FFFFFF]')}>{a.status}</Badge>
              </div>
            ))}
            {accounts.length === 0 && (
              <div className="text-xs text-[#6B7280]">No accounts available</div>
            )}
          </div>
        </div>

        {/* Negative items */}
        <div className="rounded-xl border border-[#00000014] p-4">
          <div className="mb-3 font-semibold text-[17px] leading-[100%] tracking-normal text-[#DD5858]">Negative Items ({negativeItems.length})</div>
          <div className="space-y-3">
            {negativeItems.map((n) => (
              <div key={n.id} className="rounded-lg border border-[#FECACA] bg-[#DD58580F] p-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="h-[22px] w-[22px] text-[#DD5858]" />
                    <div>
                      <div className="text-sm font-medium text-[#DD5858]">{n.label}</div>
                      <div className="text-xs text-[#DD5858] mt-0.5">{n.bureau}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-xs text-[#DD5858]">{n.date}</div>
                    <ImpactBadge impact={n.impact} />
                  </div>
                </div>
              </div>
            ))}
            {negativeItems.length === 0 && (
              <div className="text-xs text-[#6B7280]">No negative items</div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ViewCreditReport;

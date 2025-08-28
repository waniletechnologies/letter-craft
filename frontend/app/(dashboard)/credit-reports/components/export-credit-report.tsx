"use client"

import React, { useMemo, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { FileText, Settings } from "lucide-react";

interface ExportCreditReportProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  fullName: string;
  status: string;
  importedOn: string;
  provider: string;
  bureaus: string[];
}

const Pill = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => (
  <span className={cn("inline-flex items-center rounded-full border px-2 py-0.5 text-[11px]", className)}>{children}</span>
);

const SectionHeader: React.FC<{ icon: React.ReactNode; title: string; right?: React.ReactNode }> = ({ icon, title, right }) => (
  <div className="mb-3 flex items-center justify-between">
    <div className="flex items-center gap-2">
      <span className="grid h-6 w-6 items-center text-[#374151]">{icon}</span>
      <span className="font-semibold text-[17px] leading-[100%] tracking-normal text-[#292524]">{title}</span>
    </div>
    {right}
  </div>
);

const InfoItem: React.FC<{ label: string; value: React.ReactNode; withDivider?: boolean }> = ({ label, value, withDivider }) => (
  <div className="relative rounded-md bg-transparent p-2">
    {withDivider && <span className="absolute right-0 top-1/2 hidden h-6 -translate-y-1/2 border-r border-[#E5E7EB] md:block" />}
    <div className="text-[11px] text-[#9CA3AF] mb-1">{label}</div>
    <div className="text-sm font-medium text-[#292524]">{value}</div>
  </div>
);

const SectionRow: React.FC<{
  label: string;
  hint?: string;
  required?: boolean;
  checked: boolean;
  onChange: (checked: boolean) => void;
}> = ({ label, hint, required, checked, onChange }) => (
  <label className="flex items-center justify-between rounded-lg bg-transparent px-1 py-2 cursor-pointer">
    <div className="flex items-center gap-3">
      <input
        type="checkbox"
        className="h-4 w-4 rounded border-[#D1D5DB] accent-[#2563EB] focus:ring-[#2563EB]"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
      />
      <div>
        <div className="flex items-center gap-2">
          <div className="text-sm font-medium text-[#292524]">{label}</div>
          {required && <Pill className="border-[#E5E7EB] text-[#6B7280]">Required</Pill>}
        </div>
        {hint ? <div className="text-[11px] text-[#9CA3AF]">{hint}</div> : null}
      </div>
    </div>
  </label>
);

export const ExportCreditReport: React.FC<ExportCreditReportProps> = ({
  open,
  onOpenChange,
  fullName,
  status,
  importedOn,
  provider,
  bureaus,
}) => {
  const [includeScore, setIncludeScore] = useState(true);
  const [includeAccounts, setIncludeAccounts] = useState(true);
  const [includeNegatives, setIncludeNegatives] = useState(true);
  const [includePayments, setIncludePayments] = useState(true);
  const [includeInquiries, setIncludeInquiries] = useState(false);
  const [includePersonal, setIncludePersonal] = useState(false);

  const selectedCount = useMemo(
    () => [includeScore, includeAccounts, includeNegatives, includePayments, includeInquiries, includePersonal].filter(Boolean).length,
    [includeScore, includeAccounts, includeNegatives, includePayments, includeInquiries, includePersonal]
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className=" sm:max-w-[760px] max-h-[90vh] overflow-y-auto bg-[#FFFFFF]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3 text-[#3D3D3D]">
            <span>Export Credit Report - {fullName}</span>
          </DialogTitle>
        </DialogHeader>

        {/* Report information */}
        <div className="rounded-xl border border-[#00000014] bg-white p-4">
          <SectionHeader icon={<FileText className="h-6 w-6" />} title="Report Information" />
          <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
            <InfoItem label="Client" value={fullName} withDivider />
            <InfoItem label="Import Date" value={importedOn} withDivider />
            <InfoItem label="Provider" value={provider} withDivider />
            <InfoItem label="Status" value={<Badge className="rounded-full px-2 text-[11px]">{status}</Badge>} />
          </div>
          <div className="mt-3">
            <div className="text-[11px] text-[#6B7280] mb-1">Credit Bureaus</div>
            <div className="flex flex-wrap gap-2">
              {bureaus.map((b) => (
                <Pill key={b} className="border-[#E5E7EB] text-[#374151]">{b}</Pill>
              ))}
            </div>
          </div>
        </div>

        {/* Export format */}
        <div className="rounded-xl border border-[#00000014] bg-white p-4">
          <SectionHeader icon={<FileText className="h-6 w-6" />} title="Export Format" />
          <div className="flex items-center justify-between rounded-lg border border-[#00000014] bg-white px-3 py-3">
            <div className="flex items-center gap-3">
              <FileText className="h-5 w-5 text-[#374151]" />
              <div>
                <div className="text-sm font-medium text-[#292524]">PDF Report</div>
                <div className="text-[11px] text-[#9CA3AF]">Professional formatted report</div>
              </div>
            </div>
            <Badge className="rounded-full px-2 text-[11px] bg-[#E5F0FF] text-[#2563EB]">Recommended</Badge>
          </div>
        </div>

        {/* Sections to include */}
        <div className="rounded-xl border border-[#00000014] bg-white p-4 space-y-3">
          <SectionHeader icon={<Settings className="h-6 w-6" />} title="Sections to Include" right={<Pill className="border-[#E5E7EB] text-white bg-[#5881F0]">{selectedCount} Selected</Pill>} />
          <div className="space-y-2">
            <SectionRow label="Credit Score Summary" required checked={includeScore} onChange={setIncludeScore} />
            <SectionRow label="Credit Accounts" required checked={includeAccounts} onChange={setIncludeAccounts} />
            <SectionRow label="Negative Items" checked={includeNegatives} onChange={setIncludeNegatives} />
            <SectionRow label="Payment History" checked={includePayments} onChange={setIncludePayments} />
            <SectionRow label="Credit Inquiries" checked={includeInquiries} onChange={setIncludeInquiries} />
            <SectionRow label="Personal Information" checked={includePersonal} onChange={setIncludePersonal} />
          </div>
        </div>

        {/* Export preview */}
        <div className="rounded-xl border border-[#00000014] bg-white p-4 space-y-3">
          <SectionHeader icon={<FileText className="h-6 w-6" />} title="Export Preview" />
          <div>
            <div className="font-semibold text-sm leading-[100%] tracking-normal text-[#292524]">File will include:</div>
            <ul className="mt-2 list-disc pl-5 font-medium text-xs leading-[22px] -tracking-[0.03em] text-[#292524B2] space-y-1">
              {includeScore && <li>Credit Score Summary</li>}
              {includeAccounts && <li>Credit Accounts</li>}
              {includeNegatives && <li>Negative Items</li>}
              {includePayments && <li>Payment History</li>}
              {includeInquiries && <li>Credit Inquiries</li>}
              {includePersonal && <li>Personal Information</li>}
            </ul>
          </div>
          <div className="h-px w-full bg-[#E5E7EB]" />
          <div className="flex flex-col text-xs text-[#6B7280] gap-2">
            <div className="flex justify-between items-center">
                <span className="font-medium text-[13px] leading-[22px] -tracking-[0.03em] text-[#292524] ">Format</span>
                <span className="ml-2 font-medium text-[13px] leading-[22px] -tracking-[0.03em] text-[#292524]">PDF</span>
            </div>
            <div className="flex justify-between items-center">
                <span className="font-medium text-[13px] leading-[22px] -tracking-[0.03em] text-[#292524] ">Size</span>
                <span className="ml-2 font-medium text-[13px] leading-[22px] -tracking-[0.03em] text-[#292524]">2.5 MB</span>
            </div>
          </div>
        </div>

        {/* Footer actions */}
        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={() => onOpenChange(false)} className="w-[71px]">Cancel</Button>
          <Button className="w-[130px] bg-primary hover:bg-primary/90">Export Report</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ExportCreditReport;
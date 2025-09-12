"use client";

import React, { useMemo, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { FileText, Settings } from "lucide-react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

interface JsPdfWithAutoTable extends jsPDF {
  lastAutoTable?: {
    finalY: number;
  };
}

interface ExportCreditReportProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  fullName: string;
  status: string;
  importedOn: string;
  provider: string;
  bureaus: string[];
  score: number;
  accounts: {
    id: string;
    name: string;
    type: string;
    balance: string;
    status: string;
  }[];
  negativeItems: {
    id: string;
    label: string;
    bureau: string;
    date: string;
    impact: string;
  }[];
}


const Pill = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => (
  <span
    className={cn(
      "inline-flex items-center rounded-full border px-2 py-0.5 text-[9px] sm:text-[11px] leading-[100%] tracking-normal",
      className
    )}
  >
    {children}
  </span>
);

const SectionHeader: React.FC<{ icon: React.ReactNode; title: string; right?: React.ReactNode }> = ({
  icon,
  title,
  right,
}) => (
  <div className="mb-3 flex items-center justify-between">
    <div className="flex items-center gap-2">
      <span className="grid h-6 w-6 items-center text-[#374151]">{icon}</span>
      <span className="font-semibold sm:text-[17px] text-[16px] leading-[100%] tracking-normal text-[#292524]">
        {title}
      </span>
    </div>
    {right}
  </div>
);

const InfoItem: React.FC<{ label: string; value: React.ReactNode; withDivider?: boolean }> = ({
  label,
  value,
  withDivider,
}) => (
  <div className="relative rounded-md bg-transparent p-2">
    {withDivider && (
      <span className="absolute right-0 top-1/2 hidden h-6 -translate-y-1/2 border-r border-[#E5E7EB] md:block" />
    )}
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
          <div className="sm:text-sm text-[12px] font-medium text-[#292524]">{label}</div>
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
  score,
  accounts,
  negativeItems,
}) => {

  const [includeScore, setIncludeScore] = useState(true);
  const [includeAccounts, setIncludeAccounts] = useState(true);
  const [includeNegatives, setIncludeNegatives] = useState(true);
  const [includePayments, setIncludePayments] = useState(true);
  const [includeInquiries, setIncludeInquiries] = useState(false);
  const [includePersonal, setIncludePersonal] = useState(false);

  const selectedCount = useMemo(
    () =>
      [includeScore, includeAccounts, includeNegatives, includePayments, includeInquiries, includePersonal].filter(
        Boolean
      ).length,
    [includeScore, includeAccounts, includeNegatives, includePayments, includeInquiries, includePersonal]
  );

    const handleExport = () => {
    const doc = new jsPDF({
      orientation: "portrait",
      unit: "pt",
      format: "a4",
    });

    // Title
    doc.setFont("helvetica", "bold");
    doc.setFontSize(20);
    doc.text("Credit Dispute Report", 40, 50);

    // Subtitle
    doc.setFontSize(11);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(100);
    doc.text(`Client: ${fullName}`, 40, 70);
    doc.text(`Status: ${status}`, 40, 85);
    doc.text(`Imported On: ${importedOn}`, 40, 100);
    doc.text(`Provider: ${provider}`, 40, 115);
    doc.text(`Bureaus: ${bureaus.join(", ")}`, 40, 130);

    let lastY = 140; // Initialize a variable to keep track of the last Y position

    // Credit Score Section
    if (includeScore) {
      doc.setFont("helvetica", "bold");
      doc.setTextColor(33);
      doc.setFontSize(14);
      doc.text("Credit Score Summary", 40, lastY + 20);

      autoTable(doc, {
        startY: lastY + 30,
        head: [["Average Score"]],
        body: [[score.toString()]],
        theme: "striped",
        headStyles: { fillColor: [88, 129, 240], textColor: 255 },
        styles: { fontSize: 11 },
      });
      lastY = (doc as JsPdfWithAutoTable).lastAutoTable?.finalY ?? lastY;
    }

    // Accounts Section
    if (includeAccounts && accounts.length) {
      doc.setFont("helvetica", "bold");
      doc.setFontSize(14);
      doc.setTextColor(33);
      doc.text("Credit Accounts", 40, lastY + 30);

      autoTable(doc, {
        startY: lastY + 40,
        head: [["Name", "Type", "Balance", "Status"]],
        body: accounts.map((a) => [a.name, a.type, a.balance, a.status]),
        theme: "grid",
        headStyles: { fillColor: [88, 129, 240], textColor: 255 },
        styles: { fontSize: 10, cellPadding: 5 },
      });
      lastY = (doc as JsPdfWithAutoTable).lastAutoTable?.finalY ?? lastY;
    }

    // Negative Items Section
    if (includeNegatives && negativeItems.length) {
      doc.setFont("helvetica", "bold");
      doc.setFontSize(14);
      doc.setTextColor(33);
      doc.text("Negative Items", 40, lastY + 30);

      autoTable(doc, {
        startY: lastY + 40,
        head: [["Label", "Bureau", "Date", "Impact"]],
        body: negativeItems.map((n) => [n.label, n.bureau, n.date, n.impact]),
        theme: "grid",
        headStyles: { fillColor: [220, 53, 69], textColor: 255 },
        styles: { fontSize: 10, cellPadding: 5 },
      });
      lastY = (doc as JsPdfWithAutoTable).lastAutoTable?.finalY ?? lastY;
    }

    // Footer
    const pageHeight = doc.internal.pageSize.getHeight();
    doc.setFontSize(9);
    doc.setTextColor(150);
    doc.text(
      "Generated by letter Craft • Confidential Credit Dispute Report",
      40,
      pageHeight - 30
    );

    doc.save(`Dispute_Report_${fullName}.pdf`);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[760px] max-h-[90vh] overflow-y-auto bg-[#FFFFFF]">
        <DialogHeader>
          <DialogTitle className="text-left">
            <span className="font-semibold sm:text-[20px] text-[17px] leading-[100%] tracking-normal text-[#292524]">
              Export Credit Report - {fullName}
            </span>
          </DialogTitle>
        </DialogHeader>

        {/* Report information */}
        <div className="rounded-xl border border-[#00000014] bg-white p-4">
          <SectionHeader icon={<FileText className="h-6 w-6" />} title="Report Information" />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            <InfoItem label="Client" value={fullName} withDivider />
            <InfoItem label="Import Date" value={importedOn} withDivider />
            <InfoItem label="Provider" value={provider} withDivider />
            <InfoItem label="Status" value={<Badge className="rounded-full px-2 text-[11px]">{status}</Badge>} />
          </div>
          <div className="mt-3">
            <div className="text-[11px] text-[#6B7280] mb-1">Credit Bureaus</div>
            <div className="flex flex-wrap gap-2">
              {bureaus.map((b) => (
                <Pill key={b} className="border-[#E5E7EB] text-[#374151]">
                  {b}
                </Pill>
              ))}
            </div>
          </div>
        </div>

        {/* Sections to include */}
        <div className="rounded-xl border border-[#00000014] bg-white p-4 space-y-3">
          <SectionHeader
            icon={<Settings className="h-6 w-6" />}
            title="Sections to Include"
            right={<Pill className="border-[#E5E7EB] text-white bg-[#5881F0]">{selectedCount} Selected</Pill>}
          />
          <div className="space-y-2">
            <SectionRow label="Credit Score Summary" required checked={includeScore} onChange={setIncludeScore} />
            <SectionRow label="Credit Accounts" required checked={includeAccounts} onChange={setIncludeAccounts} />
            <SectionRow label="Negative Items" checked={includeNegatives} onChange={setIncludeNegatives} />
            <SectionRow label="Payment History" checked={includePayments} onChange={setIncludePayments} />
            <SectionRow label="Credit Inquiries" checked={includeInquiries} onChange={setIncludeInquiries} />
            <SectionRow label="Personal Information" checked={includePersonal} onChange={setIncludePersonal} />
          </div>
        </div>

        {/* Footer actions */}
        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={() => onOpenChange(false)} className="w-[71px]">
            Cancel
          </Button>
          <Button onClick={handleExport} className="w-[130px] bg-primary hover:bg-primary/90">
            Export Report
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ExportCreditReport;

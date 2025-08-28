"use client"

import React, { useMemo, useState } from "react";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Download, FileText, Printer } from "lucide-react";

export type LetterFormat = "PDF" | "DOCX";

export interface DownloadLetterProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  clientName: string;
  bureau: string;
  round: number;
  onDownload?: (payload: { format: LetterFormat; letters: string[] }) => void;
}

const AVAILABLE_LETTERS: { id: string; title: string; desc: string }[] = [
  { id: "main", title: "Main Dispute Letter", desc: "Primary dispute letter to bureau" },
  { id: "follow_up", title: "Follow-up Letter", desc: "Follow-up communication" },
  { id: "debt_validation", title: "Debt Validation Letter", desc: "Request for debt validation" },
  { id: "cease_contact", title: "Cease Contact Letter", desc: "Stop communication request" },
];

export const DownloadLetter: React.FC<DownloadLetterProps> = ({ open, onOpenChange, clientName, bureau, round, onDownload }) => {
  const [selected, setSelected] = useState<string[]>([]);
  const [format, setFormat] = useState<LetterFormat>("PDF");

  const toggle = (id: string, checked: boolean) => {
    setSelected((prev) => (checked ? [...prev, id] : prev.filter((x) => x !== id)));
  };

  const count = useMemo(() => selected.length, [selected]);

  const handleClose = () => {
    onOpenChange(false);
  };

  const handleDownload = () => {
    if (count === 0) return;
    onDownload?.({ format, letters: selected });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[560px] bg-[#FFFFFF]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-[#111827]">
            <Download className="h-5 w-5" />
            <span>Download Letters</span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="">
            <div className="font-semibold text-[16px] leading-[11px] -tracking-[0.03em] text-[#3D3D3D]">Letters for {clientName} - {bureau} (Round {round})</div>
            <div className="mt-1 font-medium text-xs leading-[11px] -tracking-[0.03em] text-[#3D3D3DB2]/70">
            Select the letters you want to download:
            </div>
          </div>

          <div className="space-y-2">
            {AVAILABLE_LETTERS.map((l) => {
              const checked = selected.includes(l.id);
              return (
                <label key={l.id} className="flex cursor-pointer items-center gap-3 rounded-lg border border-[#00000014] bg-white p-3">
                  <Checkbox checked={checked} className="accent-[#2563EB] mb-3" onCheckedChange={(v) => toggle(l.id, Boolean(v))} />
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                        <FileText className="h-[14px] w-[14px]" />
                        <div className="font-semibold text-[16px] leading-[11px] -tracking-[0.03em] text-[#3D3D3D]">{l.title}</div>
                    </div>
                    <div className="font-medium text-xs leading-[11px] -tracking-[0.03em] text-[#3D3D3DB2]/70">{l.desc}</div>
                  </div>
                  {checked && <Badge className="rounded-full bg-[#E5F0FF] text-[#2563EB] text-[11px]">Selected</Badge>}
                </label>
              );
            })}
          </div>

          <div className="space-y-4">
            <div className="font-semibold text-base leading-[11px] -tracking-[0.03em] text-[#3D3D3D]">Download Format:</div>
            <div className="flex gap-3">
              <Button
                type="button"
                variant={format === "PDF" ? "default" : "outline"}
                onClick={() => setFormat("PDF")}
                className={format === "PDF" ? "bg-primary hover:bg-primary/90" : "bg-white"}
              >
                <FileText className="h-4 w-4" /> PDF
              </Button>
              <Button
                type="button"
                variant={format === "DOCX" ? "default" : "outline"}
                onClick={() => setFormat("DOCX")}
                className={format === "DOCX" ? "bg-primary hover:bg-primary/90" : "bg-white"}
              >
                <Printer className="h-4 w-4" /> DOCX
              </Button>
            </div>
          </div>
        </div>

        <DialogFooter className="gap-3">
          <Button variant="outline" onClick={handleClose} className="min-w-[88px]">Cancel</Button>
          <Button onClick={handleDownload} disabled={count === 0} className="min-w-[150px] bg-primary hover:bg-primary/90">
            <Download className="h-4 w-4" /> Download ({count})
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DownloadLetter;
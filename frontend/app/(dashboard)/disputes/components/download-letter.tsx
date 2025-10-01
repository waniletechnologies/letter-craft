"use client"

import React, { useMemo, useState } from "react";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Download, FileText, Printer } from "lucide-react";
import type { LetterCategory } from "@/lib/disputeAPI";

export type LetterFormat = "PDF" | "DOCX";

export interface DownloadLetterProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  clientName: string;
  bureau: string;
  round: number;
  letters: LetterCategory[];
  onDownload?: (payload: { format: LetterFormat; selections: { category: string; name: string }[] }) => void;
}

export const DownloadLetter: React.FC<DownloadLetterProps> = ({ open, onOpenChange, clientName, bureau, round, letters, onDownload }) => {
  const [selected, setSelected] = useState<string[]>([]); // key as `${category}|${name}`
  const [format, setFormat] = useState<LetterFormat>("PDF");

  const toggle = (key: string, checked: boolean) => {
    setSelected((prev) => (checked ? [...prev, key] : prev.filter((x) => x !== key)));
  };

  const count = useMemo(() => selected.length, [selected]);

  const handleClose = () => {
    onOpenChange(false);
  };

  const handleDownload = () => {
    if (count === 0) return;
    const selections = selected.map((k) => {
      const [category, name] = k.split("|");
      return { category, name };
    });
    onDownload?.({ format, selections });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[560px] bg-white max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-[#111827]">
            <Download className="h-5 w-5" />
            <span>Download Letters</span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 overflow-hidden">
          <div>
            <div className="font-semibold text-[16px] leading-[11px] -tracking-[0.03em] text-[#3D3D3D]">
              Letters for {clientName} - {bureau} (Round {round})
            </div>
            <div className="mt-1 font-medium text-xs leading-[11px] -tracking-[0.03em] text-[#3D3D3DB2]/70">
              Select the letters you want to download:
            </div>
          </div>

          {/* SCROLLABLE LETTERS AREA */}
          <div className="space-y-2 overflow-y-auto max-h-[45vh] pr-2">
            {letters.flatMap((cat) =>
              cat.letters.map((file) => {
                const key = `${cat.category}|${file.name}`;
                const checked = selected.includes(key);
                return (
                  <label
                    key={key}
                    className="flex cursor-pointer items-center gap-3 rounded-lg border border-[#00000014] bg-white p-3"
                  >
                    <Checkbox
                      checked={checked}
                      className="accent-[#2563EB] mb-3"
                      onCheckedChange={(v) => toggle(key, Boolean(v))}
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <FileText className="h-[14px] w-[14px]" />
                        <div className="font-semibold text-[16px] leading-[11px] -tracking-[0.03em] text-[#3D3D3D]">
                          {file.name}
                        </div>
                      </div>
                      <div className="font-medium text-[11px] -tracking-[0.03em] text-[#3D3D3DB2]/70">
                        Category: {cat.category}
                      </div>
                    </div>
                    {checked && (
                      <Badge className="rounded-full bg-[#E5F0FF] text-[#2563EB] text-[11px]">
                        Selected
                      </Badge>
                    )}
                  </label>
                );
              })
            )}
          </div>

          {/* FORMAT SELECTION */}
          <div className="space-y-4">
            <div className="font-semibold text-base leading-[11px] -tracking-[0.03em] text-[#3D3D3D]">
              Download Format:
            </div>
            <div className="flex gap-3">
              <Button
                type="button"
                variant={format === "PDF" ? "default" : "outline"}
                onClick={() => setFormat("PDF")}
                className={
                  format === "PDF"
                    ? "bg-primary hover:bg-primary/90"
                    : "bg-white"
                }
              >
                <FileText className="h-4 w-4" /> PDF
              </Button>
              <Button
                type="button"
                variant={format === "DOCX" ? "default" : "outline"}
                onClick={() => setFormat("DOCX")}
                className={
                  format === "DOCX"
                    ? "bg-primary hover:bg-primary/90"
                    : "bg-white"
                }
              >
                <Printer className="h-4 w-4" /> DOCX
              </Button>
            </div>
          </div>
        </div>

        <DialogFooter className="gap-3">
          <Button
            variant="outline"
            onClick={handleClose}
            className="min-w-[88px]"
          >
            Cancel
          </Button>
          <Button
            onClick={handleDownload}
            disabled={count === 0}
            className="min-w-[150px] bg-primary hover:bg-primary/90"
          >
            <Download className="h-4 w-4" /> Download ({count})
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DownloadLetter;
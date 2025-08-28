"use client"

import React from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { CheckCircle2, Loader2 } from "lucide-react";

export type ImportStepStatus = "pending" | "running" | "done";

export interface AutoImportOverlayProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  steps: { id: string; label: string; status: ImportStepStatus }[];
}

const StepRow: React.FC<{ label: string; status: ImportStepStatus }> = ({ label, status }) => {
  return (
    <div className="flex items-center gap-3">
      {status === "done" ? (
        <CheckCircle2 className="h-4 w-4 text-[#00A650]" />
      ) : status === "running" ? (
        <Loader2 className="h-4 w-4 animate-spin text-[#2196F3]" />
      ) : (
        <span className="h-4 w-4 rounded-full border border-[#E5E7EB]" />
      )}
      <span className="font-medium text-sm leading-[20px] tracking-normaltext-[#292524]">{label}</span>
    </div>
  );
};

export const AutoImportOverlay: React.FC<AutoImportOverlayProps> = ({ open, onOpenChange, steps }) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[420px] p-6" >
        <div className="space-y-4">
          <p className="font-medium text-sm leading-[20px] tracking-normal text-[#292524]">Auto Import Running...</p>
          <hr className="border-t border-[#59585814]" />
          <div className="space-y-3">
            {steps.map((s) => (
              <StepRow key={s.id} label={s.label} status={s.status} />)
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AutoImportOverlay;
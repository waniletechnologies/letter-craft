"use client"

import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export type PreviewStatus = "Sent" | "Draft" | "Delivered";

export interface LetterPreviewProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  clientName: string;
  bureau: "Experian" | "Equifax" | "TransUnion";
  round: number;
  status: PreviewStatus;
}

const statusStyles: Record<PreviewStatus, string> = {
    Sent: "bg-[#5881F0] text-[#FFFFFF]",
    Draft: "bg-[#EEEEEE] text-[#3D3D3D]",
    Delivered: "bg-[#00A650] text-[#FFFFFF]",
};

const LetterPreview: React.FC<LetterPreviewProps> = ({ open, onOpenChange, clientName, bureau, round, status }) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[800px] max-h-[92vh] bg-white overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3 text-[#111827]">
            <span className="font-semibold text-[20px] leading-[100%] tracking-normal text-[#292524]">Letter Preview - {clientName}</span>
            <Badge className={`rounded-full px-3 py-1 text-xs ${statusStyles[status]}`}>{status}</Badge>
            <span className="font-medium text-xs leading-[11px] -tracking-[0.03em] text-[#9F98AA]">{bureau} • Round {round}</span>
          </DialogTitle>
        </DialogHeader>
        <hr className="border-[#00000014]" />
        <div className="rounded-lg border border-[#00000014] bg-white px-4 py-6">
          {/* Simple mock letter body; replace with real render */}
          <div className="mx-auto max-w-[620px] text-[#111827]">
            <div className="text-right space-y-1">
              <div className="font-inter font-bold text-xs leading-[100%] tracking-normal text-[#000000] ">John Smith</div>
              <div className="text-[#3A3535] font-normal text-xs leading-[100%] tracking-normal ">123 Main Street</div>
              <div className="text-[#3A3535] font-normal text-xs leading-[100%] tracking-normal ">Anytown, ST 12345</div>
              <div className="text-[#3A3535] font-normal text-xs leading-[100%] tracking-normal ">Phone: (555) 123-4567</div>
            </div>

            <div className="mt-6 font-medium text-xs leading-[100%] tracking-normal text-[#000000] ">7/8/2025</div>
            <div className="mt-2 space-y-1">
              <div className="font-bold text-xs leading-[100%] tracking-normal text-[#000000] ">Equifax</div>
              <div className="text-[#3A3535] font-normal text-xs leading-[100%] tracking-normal ">P.O. Box 740241</div>
              <div className="text-[#3A3535] font-normal text-xs leading-[100%] tracking-normal ">Atlanta, GA 30374</div>
            </div>

            <div className="mt-6 font-bold text-xs leading-[100%] tracking-normal text-[#000000]">Re: Dispute of Inaccurate Information</div>
            <div className="mt-4 space-y-1">
              <div className="font-bold text-xs leading-[100%] tracking-normal text-[#000000]">To Whom It May Concern:</div>
              <div className="text-[#3A3535] font-normal text-xs leading-[100%] tracking-normal space-y-1">I am writing to dispute the following information in my file. The items I am disputing are inaccurate or <br />
              incomplete. Please investigate these matters and delete or correct the disputed items as soon as possible.
              </div>
            </div>
            <div className="mt-4 space-y-1">
                <div className="font-bold text-xs leading-[100%] tracking-normal text-[#000000]">Disputed Items:</div>
            </div>
            <div className="mt-2 space-y-3">
              <div className="rounded-md bg-[#2196F30F] p-5">
                <div className="flex justify-between">
                    <div className="font-medium text-xs leading-[100%] tracking-normal text-[#292524] ">Account Name: ABC Credit Card</div>
                    <div className="font-medium text-xs leading-[100%] tracking-normal text-[#292524]">Account #: ****1234</div>
                </div>
                <div className="font-medium text-xs leading-[100%] tracking-normal text-[#292524] mt-1">Reason: This account was paid in full and should show $0 balance</div>
              </div>
              <div className="rounded-md bg-[#2196F30F] p-5">
                <div className="flex justify-between">
                    <div className="font-medium text-xs leading-[100%] tracking-normal text-[#292524] ">Account Name: XYZ Auto Loan</div>
                    <div className="font-medium text-xs leading-[100%] tracking-normal text-[#292524]">Account #: ****5678</div>
                </div>
                <div className="font-medium text-xs leading-[100%] tracking-normal text-[#292524] mt-1">Reason: This account does not belong to me</div>
              </div>
            </div>

            <div className="mt-4 font-normal text-xs leading-[20px] tracking-normal text-[#3A3535]">
              I understand that you must re-investigate the items in question within a reasonable period of time upon
              receiving this letter, and that you must forward a copy of this correspondence to the organization that
              provided the disputed information. I also understand that the re-investigation must be completed within 30
              days of your receipt of this letter.
            </div>

            <div className="mt-6 font-normal text-xs leading-[20px] tracking-normal text-[#3A3535]">Sincerely,</div>
            <div className="mt-8 font-semibold text-xs leading-[100%] tracking-normal text-[#3D3D3D]">John Smith</div>

            <div className="mt-6 font-bold text-xs leading-[100%] tracking-normal text-[#000000]">
              Enclosures:
              <ul className="list-disc ml-5 mt-1 space-y-1 font-normal text-xs leading-[24px] tracking-normal text-[#3D3D3D]">
                <li>Copy of ID</li>
                <li>Copy of Social Security Card</li>
                <li>Proof of Address</li>
                <li>Supporting Documentation</li>
              </ul>
            </div>
          </div>
        </div>

            <div className="flex justify-between mt-6">
          <div className="flex justify-start items-center gap-3">
            <Button variant="outline" onClick={() => onOpenChange(false)}>Close</Button>
          </div>
          <div className="flex justify-end items-center gap-3">
            <Button variant="outline">Download PDF</Button>
            <Button variant="outline">Print</Button>
                <Button className="bg-primary hover:bg-primary/90">Send Letters</Button>
            </div>
            </div>
      </DialogContent>
    </Dialog>
  );
};

export default LetterPreview;

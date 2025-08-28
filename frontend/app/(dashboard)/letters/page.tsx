"use client"

import React, { useState } from "react";
import LetterCard from "./components/letter-card";
import LetterPreview from "./components/letter-preview";
import { Mail, PhoneCall, Printer, SendHorizonal } from "lucide-react";
import { Button } from "@/components/ui/button";

const sampleLetters = [
  {
    clientName: "John Smith",
    bureau: "Equifax" as const,
    letterType: "Account Verification",
    round: 1,
    status: "Sent" as const,
    sendMethod: "Mail",
    dateSent: "2024-06-15",
    tracking: "9400109206221000000123",
  },
  {
    clientName: "Sarah Johnson",
    bureau: "Experian" as const,
    letterType: "Debt Validation",
    round: 2,
    status: "Draft" as const,
    sendMethod: "Not selected",
    dateSent: "Not sent",
    tracking: "no",
  },
  {
    clientName: "Lisa Wilson",
    bureau: "TransUnion" as const,
    letterType: "Dispute Letter",
    round: 1,
    status: "Delivered" as const,
    sendMethod: "Fax",
    dateSent: "2024-06-10",
    tracking: "Confirmation: 2024061012345",
  },
];

const LettersPage = () => {
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewData, setPreviewData] = useState<{
    clientName: string;
    bureau: "Experian" | "Equifax" | "TransUnion";
    round: number;
    status: "Sent" | "Draft" | "Delivered";
  } | null>(null);

  const handlePreview = (idx: number) => {
    const l = sampleLetters[idx];
    setPreviewData({ clientName: l.clientName, bureau: l.bureau, round: l.round, status: l.status });
    setPreviewOpen(true);
  };
  const handleDownload = (name: string) => {
    console.log("Download letter for", name);
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="font-semibold text-[32px] leading-[100%] -tracking-[0.07em] text-[#3D3D3D] mb-2">Letters</h1>
        <div className="flex justify-between">
          <p className="text-[#606060] font-medium text-base leading-[100%] -tracking-[0.07em]">
            View, preview and download generated letters
          </p>
          <Button>
            <SendHorizonal className="h-4 w-4" />
            Send Letters
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {sampleLetters.map((l, i) => (
          <LetterCard
            key={`${l.clientName}-${l.bureau}-${l.round}`}
            {...l}
            onPreview={() => handlePreview(i)}
            onDownload={() => handleDownload(l.clientName)}
          />
        ))}
      </div>

      {/* Preview Dialog */}
      {previewData && (
        <LetterPreview
          open={previewOpen}
          onOpenChange={setPreviewOpen}
          clientName={previewData.clientName}
          bureau={previewData.bureau}
          round={previewData.round}
          status={previewData.status}
        />
      )}

      {/* Letter Management */}
      <div className="mt-10 rounded-xl bg-white p-6">
        <div className="mb-5">
          <h2 className="font-medium text-[24px] leading-[100%] -tracking-[0.07em] text-[#3D3D3D] mb-2">Letter Management</h2>
          <p className="font-medium text-sm leading-[100%] -tracking-[0.07em] text-[#606060]">Send letters via mail, fax, or email with tracking capabilities.</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
          <div className="rounded-lg bg-[#F9FAFB] p-5">
            <div className="flex flex-col items-center gap-3">
                <Mail className="h-6 w-6 text-primary" />
              <div>
                <div className="font-medium text-[18px] leading-[100%] -tracking-[0.07em] text-center text-[#3D3D3D] mb-1">Certified Mail</div>
                <div className="font-medium text-xs leading-[100%] -tracking-[0.07em]  text-[#606060CC]/80">Send with tracking</div>
              </div>
            </div>
          </div>
          <div className="rounded-lg bg-[#F9FAFB] p-5">
            <div className="flex flex-col items-center gap-3">
                <PhoneCall className="h-6 w-6 text-[#00A650]" />
              <div>
                <div className="font-medium text-[18px] leading-[100%] -tracking-[0.07em] text-center text-[#3D3D3D] mb-1">Fax Service</div>
                <div className="font-medium text-xs leading-[100%] -tracking-[0.07em]  text-[#606060CC]/80">Instant delivery</div>
              </div>
            </div>
          </div>
          <div className="rounded-lg bg-[#F9FAFB] p-6">
            <div className="flex flex-col items-center gap-3">
                <Printer className="h-6 w-6 text-[#A855F7]" />
              <div>
                <div className="font-medium text-[18px] leading-[100%] -tracking-[0.07em] text-center text-[#3D3D3D] mb-1">Print Ready</div>
                <div className="font-medium text-xs leading-[100%] -tracking-[0.07em]  text-[#606060CC]/80">Download PDF</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LettersPage;
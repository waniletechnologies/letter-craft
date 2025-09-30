"use client";

import React, { useState, useEffect } from "react";
import LetterCard from "./components/letter-card";
import LetterPreview from "./components/letter-preview";
import { Mail, PhoneCall, Printer, SendHorizonal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getAllLetters } from "@/lib/lettersApi";

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

interface BackendLetter {
  _id: string;
  clientId: string | null;
  email: string;
  letterName: string;
  abbreviation: string;
  round: number;
  category: string;
  bureau: "Experian" | "Equifax" | "TransUnion";
  content: string;
  personalInfo: {
    names: { first: string; last: string }[];
    [key: string]: unknown;
  };
  selectedFtcReports: string[];
  status: "draft" | "sent" | "delivered" | "failed";
  sendMethod?: string;
  trackingNumber?: string;
  dateSent?: string;
  createdAt: string;
  updatedAt: string;
}

const LettersPage = () => {
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewData, setPreviewData] = useState<{
    letterId: string;
    clientName: string;
    bureau: "Experian" | "Equifax" | "TransUnion";
    round: number;
    status: "Sent" | "Draft" | "Delivered";
    content: string;
    personalInfo: {
      names: { first: string; last: string }[];
      [key: string]: unknown;
    };
  } | null>(null);

  type Letter = {
    id: string;
    clientName: string;
    bureau: "Experian" | "Equifax" | "TransUnion";
    letterType: string;
    round: number;
    status: "Sent" | "Draft" | "Delivered";
    sendMethod: string;
    dateSent: string;
    tracking: string;
    content: string;
    personalInfo: {
      names: { first: string; last: string }[];
      [key: string]: unknown;
    };
  };

  const [letters, setLetters] = useState<Letter[]>([]);
  const [loading, setLoading] = useState(true);

  // Load letters from backend
  useEffect(() => {
    loadLetters();
  }, []);

  // Helper function to get client name from personalInfo
  const getClientName = (letter: BackendLetter): string => {
    if (
      !letter.personalInfo ||
      !letter.personalInfo.names ||
      !Array.isArray(letter.personalInfo.names)
    ) {
      return letter.email || "Unknown Client";
    }

    const primaryName = letter.personalInfo.names[0];
    if (!primaryName) {
      return letter.email || "Unknown Client";
    }

    const firstName = primaryName.first || "";
    const lastName = primaryName.last || "";

    // Combine first and last name, trim any extra spaces
    const fullName = `${firstName} ${lastName}`.trim();

    return fullName || letter.email || "Unknown Client";
  };

  const loadLetters = async () => {
    try {
      setLoading(true);
      const res = await getAllLetters();
      if (res.success && Array.isArray(res.data)) {
        const backendLetters = res.data as unknown as BackendLetter[];
        const mapped: Letter[] = backendLetters.map((l) => ({
          id: l._id,
          clientName: getClientName(l),
          bureau: l.bureau,
          letterType: l.letterName,
          round: l.round || 1,
          status: (l.status === "sent"
            ? "Sent"
            : l.status === "delivered"
            ? "Delivered"
            : "Draft") as "Sent" | "Draft" | "Delivered",
          sendMethod: l.sendMethod || "Not selected",
          dateSent: l.dateSent
            ? new Date(l.dateSent).toLocaleDateString()
            : "Not sent",
          tracking: l.trackingNumber || "no",
          content: l.content,
          personalInfo: l.personalInfo,
        }));
        console.log("Fetched letters:", mapped);
        setLetters(mapped);
      } else {
        // Convert sample letters to match our new interface
        const sampleWithIds = sampleLetters.map((sl, index) => ({
          ...sl,
          id: `sample-${index}`,
          content: "Sample letter content...",
          personalInfo: {
            names: [
              {
                first: sl.clientName.split(" ")[0],
                last: sl.clientName.split(" ")[1],
              },
            ],
          },
        }));
        setLetters(sampleWithIds);
      }
    } catch (error) {
      console.error("Error loading letters:", error);
      // Fallback to sample data
      const sampleWithIds = sampleLetters.map((sl, index) => ({
        ...sl,
        id: `sample-${index}`,
        content: "Sample letter content...",
        personalInfo: {
          names: [
            {
              first: sl.clientName.split(" ")[0],
              last: sl.clientName.split(" ")[1],
            },
          ],
        },
      }));
      setLetters(sampleWithIds);
    } finally {
      setLoading(false);
    }
  };

  const handlePreview = (letter: Letter) => {
    setPreviewData({
      letterId: letter.id,
      clientName: letter.clientName,
      bureau: letter.bureau,
      round: letter.round,
      status: letter.status,
      content: letter.content,
      personalInfo: letter.personalInfo,
    });
    setPreviewOpen(true);
  };

  const handleDownload = (letter: Letter) => {
    console.log("Download letter for", letter.clientName);
    // This will be handled by the LetterPreview component
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="font-semibold text-[32px] leading-[100%] -tracking-[0.07em] text-[#3D3D3D] mb-2">
          Letters
        </h1>
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
        {loading ? (
          <div className="col-span-2 text-center py-8">
            <p>Loading letters...</p>
          </div>
        ) : letters.length === 0 ? (
          <div className="col-span-2 text-center py-8">
            <p>
              No letters found. Create your first letter in the dispute wizard.
            </p>
          </div>
        ) : (
          letters.map((l) => (
            <LetterCard
              key={l.id}
              clientName={l.clientName}
              bureau={l.bureau}
              letterType={l.letterType}
              round={l.round}
              status={l.status}
              sendMethod={l.sendMethod}
              dateSent={l.dateSent}
              tracking={l.tracking}
              onPreview={() => handlePreview(l)}
              onDownload={() => handleDownload(l)}
            />
          ))
        )}
      </div>

      {/* Preview Dialog */}
      {previewData && (
        <LetterPreview
          open={previewOpen}
          onOpenChange={setPreviewOpen}
          letterId={previewData.letterId}
          clientName={previewData.clientName}
          bureau={previewData.bureau}
          round={previewData.round}
          status={previewData.status}
          content={previewData.content}
          personalInfo={previewData.personalInfo}
        />
      )}

      {/* Letter Management */}
      <div className="mt-10 rounded-xl bg-white p-6">
        <div className="mb-5">
          <h2 className="font-medium text-[24px] leading-[100%] -tracking-[0.07em] text-[#3D3D3D] mb-2">
            Letter Management
          </h2>
          <p className="font-medium text-sm leading-[100%] -tracking-[0.07em] text-[#606060]">
            Send letters via mail, fax, or email with tracking capabilities.
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
          <div className="rounded-lg bg-[#F9FAFB] p-5">
            <div className="flex flex-col items-center gap-3">
              <Mail className="h-6 w-6 text-primary" />
              <div>
                <div className="font-medium text-[18px] leading-[100%] -tracking-[0.07em] text-center text-[#3D3D3D] mb-1">
                  Certified Mail
                </div>
                <div className="font-medium text-xs leading-[100%] -tracking-[0.07em]  text-[#606060CC]/80">
                  Send with tracking
                </div>
              </div>
            </div>
          </div>
          <div className="rounded-lg bg-[#F9FAFB] p-5">
            <div className="flex flex-col items-center gap-3">
              <PhoneCall className="h-6 w-6 text-[#00A650]" />
              <div>
                <div className="font-medium text-[18px] leading-[100%] -tracking-[0.07em] text-center text-[#3D3D3D] mb-1">
                  Fax Service
                </div>
                <div className="font-medium text-xs leading-[100%] -tracking-[0.07em]  text-[#606060CC]/80">
                  Instant delivery
                </div>
              </div>
            </div>
          </div>
          <div className="rounded-lg bg-[#F9FAFB] p-6">
            <div className="flex flex-col items-center gap-3">
              <Printer className="h-6 w-6 text-[#A855F7]" />
              <div>
                <div className="font-medium text-[18px] leading-[100%] -tracking-[0.07em] text-center text-[#3D3D3D] mb-1">
                  Print Ready
                </div>
                <div className="font-medium text-xs leading-[100%] -tracking-[0.07em]  text-[#606060CC]/80">
                  Download PDF
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LettersPage;

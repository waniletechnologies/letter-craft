"use client";

import React, { useState, useEffect } from "react";
import LetterCard from "./components/letter-card";
import LetterPreview from "./components/letter-preview";
import { Mail, PhoneCall, Printer } from "lucide-react";
import { getAllLetters, BackendLetter } from "@/lib/lettersApi";
import Loader from "@/components/Loader";
import jsPDF from "jspdf";

interface PersonalInfo {
  names?: Array<{
    first: string;
    middle?: string;
    last: string;
    suffix?: string;
    type?: string;
  }>;
  addresses?: Array<{
    street: string;
    city: string;
    state: string;
    postalCode: string;
    dateReported?: string;
    dateUpdated?: string;
  }>;
  births?: Array<{
    date: string;
    year: string;
    month: string;
    day: string;
  }>;
  ssns?: Array<{ number: string }>;
  employers?: Array<{ name: string }>;
  previousAddresses?: Array<{
    street: string;
    city: string;
    state: string;
    postalCode: string;
    dateReported?: string;
    dateUpdated?: string;
  }>;
  creditScore?: string;
  creditReportDate?: string;
}



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

  // Get sender address from personalInfo
  const getSenderAddress = (personalInfo?: PersonalInfo): string => {
    if (!personalInfo || !personalInfo.names || !personalInfo.addresses) {
      return "Unknown Client\n[Address Not Available]";
    }

    const name = personalInfo.names[0];
    const address = personalInfo.addresses[0];

    const fullName = `${name?.first || ""} ${name?.middle || ""} ${
      name?.last || ""
    }`.trim();
    const addressLine = address
      ? `${address.street}, ${address.city}, ${address.state} ${address.postalCode}`
      : "";

    return `${fullName}\n${addressLine}`;
  };

  // Get bureau address
  const getBureauAddress = (
    bureau: "Experian" | "Equifax" | "TransUnion"
  ): string => {
    switch (bureau) {
      case "Experian":
        return "EXPERIAN\nP.O. BOX 4500\nALLEN, TX 75013";
      case "TransUnion":
        return "TRANSUNION\nP.O. BOX 2000\nCHESTER, PA 19016";
      case "Equifax":
      default:
        return "EQUIFAX\nP.O. BOX 740250\nATLANTA, GA 30374";
    }
  };

  // Format date for letter
  const getCurrentDate = (): string => {
    const today = new Date();
    return today.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  // Clean HTML content for PDF
  const cleanHtmlContent = (html: string): string => {
    return html
      .replace(/<br\s*\/?>/gi, "\n")
      .replace(/<p[^>]*>/gi, "\n")
      .replace(/<\/p>/gi, "\n")
      .replace(/<div[^>]*>/gi, "\n")
      .replace(/<\/div>/gi, "\n")
      .replace(/<strong[^>]*>/gi, "")
      .replace(/<\/strong>/gi, "")
      .replace(/<b[^>]*>/gi, "")
      .replace(/<\/b>/gi, "")
      .replace(/<em[^>]*>/gi, "")
      .replace(/<\/em>/gi, "")
      .replace(/<i[^>]*>/gi, "")
      .replace(/<\/i>/gi, "")
      .replace(/<u[^>]*>/gi, "")
      .replace(/<\/u>/gi, "")
      .replace(/<span[^>]*>/gi, "")
      .replace(/<\/span>/gi, "")
      .replace(/<[^>]*>/g, "") // Remove any remaining tags
      .replace(/\n\s*\n/g, "\n\n") // Clean up multiple newlines
      .trim();
  };

  // PDF generation function
  const handleDownloadPDF = (letter: Letter) => {
    const pdf = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
    });

    // Colors
    const primaryColor = [88, 129, 240]; // #5881F0
    const textColor = [41, 37, 36]; // #292524
    const borderColor = [229, 231, 235]; // #E5E7EB

    let currentY = 20;

    // Header with client and bureau info
    pdf.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    pdf.rect(0, 0, pdf.internal.pageSize.getWidth(), 25, "F");

    // Header text
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(14);
    pdf.setTextColor(255, 255, 255);
    pdf.text("DISPUTE LETTER", 20, 15);

    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(10);
    pdf.text(
      `Client: ${letter.clientName}`,
      pdf.internal.pageSize.getWidth() - 20,
      10,
      { align: "right" }
    );
    pdf.text(
      `Bureau: ${letter.bureau} - Round ${letter.round}`,
      pdf.internal.pageSize.getWidth() - 20,
      17,
      { align: "right" }
    );

    currentY = 40;

    // FROM and TO addresses
    const senderAddress = getSenderAddress(letter.personalInfo as PersonalInfo);
    const bureauAddress = getBureauAddress(letter.bureau);

    // FROM address
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(11);
    pdf.setTextColor(textColor[0], textColor[1], textColor[2]);
    pdf.text("FROM:", 20, currentY);

    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(10);
    const senderLines = senderAddress.split("\n");
    senderLines.forEach((line, index) => {
      pdf.text(line, 20, currentY + 8 + index * 5);
    });

    // TO address
    pdf.setFont("helvetica", "bold");
    pdf.setTextColor(textColor[0], textColor[1], textColor[2]);
    pdf.text("TO:", pdf.internal.pageSize.getWidth() - 80, currentY);

    pdf.setFont("helvetica", "normal");
    const bureauLines = bureauAddress.split("\n");
    bureauLines.forEach((line, index) => {
      pdf.text(
        line,
        pdf.internal.pageSize.getWidth() - 80,
        currentY + 8 + index * 5
      );
    });

    currentY += Math.max(senderLines.length, bureauLines.length) * 5 + 20;

    // Date
    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(10);
    pdf.text(getCurrentDate(), 20, currentY);
    currentY += 15;

    // Separator line
    pdf.setDrawColor(borderColor[0], borderColor[1], borderColor[2]);
    pdf.setLineWidth(0.5);
    pdf.line(20, currentY, pdf.internal.pageSize.getWidth() - 20, currentY);
    currentY += 20;

    // Letter content
    const cleanContent = cleanHtmlContent(letter.content);
    const contentLines = pdf.splitTextToSize(
      cleanContent,
      pdf.internal.pageSize.getWidth() - 40
    );

    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(11);
    pdf.setTextColor(textColor[0], textColor[1], textColor[2]);

    contentLines.forEach((line: string) => {
      // Check if we need a new page
      if (currentY > pdf.internal.pageSize.getHeight() - 40) {
        pdf.addPage();
        currentY = 20;
      }
      pdf.text(line, 20, currentY);
      currentY += 6;
    });

    currentY += 20;

    // Signature section
    if (currentY > pdf.internal.pageSize.getHeight() - 60) {
      pdf.addPage();
      currentY = 20;
    }

    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(11);
    pdf.text("Sincerely,", 20, currentY);
    currentY += 10;
    pdf.text(letter.clientName, 20, currentY);
    currentY += 20;

    // Enclosures section
    if (currentY > pdf.internal.pageSize.getHeight() - 40) {
      pdf.addPage();
      currentY = 20;
    }

    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(10);
    pdf.text("Enclosures:", 20, currentY);
    currentY += 8;

    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(9);
    const enclosures = [
      "Copy of Government Issued ID",
      "Proof of Address",
      "FTC Identity Theft Report (if applicable)",
      "Supporting Documentation",
    ];

    enclosures.forEach((item, index) => {
      if (currentY > pdf.internal.pageSize.getHeight() - 20) {
        pdf.addPage();
        currentY = 20;
      }
      pdf.text(`• ${item}`, 25, currentY + index * 5);
    });

    // Footer on each page
    const pageCount = pdf.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      pdf.setPage(i);

      // Page number
      pdf.setFontSize(8);
      pdf.setTextColor(150, 150, 150);
      pdf.text(
        `Page ${i} of ${pageCount}`,
        pdf.internal.pageSize.getWidth() / 2,
        pdf.internal.pageSize.getHeight() - 10,
        { align: "center" }
      );

      // Footer separator
      pdf.setDrawColor(borderColor[0], borderColor[1], borderColor[2]);
      pdf.setLineWidth(0.3);
      pdf.line(
        20,
        pdf.internal.pageSize.getHeight() - 15,
        pdf.internal.pageSize.getWidth() - 20,
        pdf.internal.pageSize.getHeight() - 15
      );
    }

    // Save the PDF
    pdf.save(
      `Dispute_Letter_${letter.clientName.replace(/\s+/g, "_")}_${
        letter.bureau
      }_Round_${letter.round}.pdf`
    );
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
    handleDownloadPDF(letter);
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
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {loading ? (
          <div className="col-span-2 text-center py-8">
            <Loader />
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

"use client";

import React, { useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import jsPDF from "jspdf";

export type PreviewStatus = "Sent" | "Draft" | "Delivered";

// Define expected types for personalInfo
interface PersonalInfoName {
  first?: string;
  middle?: string;
  last?: string;
}

interface PersonalInfoAddress {
  street?: string;
  city?: string;
  state?: string;
  postalCode?: string;
}

interface PersonalInfo {
  names?: PersonalInfoName[];
  addresses?: PersonalInfoAddress[];
}

export interface LetterPreviewProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  letterId: string;
  clientName: string;
  bureau: "Experian" | "Equifax" | "TransUnion";
  round: number;
  status: PreviewStatus;
  content: string;
  personalInfo?: PersonalInfo; // ✅ typed instead of `any`
}


const statusStyles: Record<PreviewStatus, string> = {
  Sent: "bg-[#5881F0] text-[#FFFFFF]",
  Draft: "bg-[#EEEEEE] text-[#3D3D3D]",
  Delivered: "bg-[#00A650] text-[#FFFFFF]",
};

const LetterPreview: React.FC<LetterPreviewProps> = ({
  open,
  onOpenChange,
  letterId,
  clientName,
  bureau,
  round,
  status,
  content,
  personalInfo,
}) => {
  const letterRef = useRef<HTMLDivElement>(null);

  // Get sender address from personalInfo
  const getSenderAddress = () => {
    if (!personalInfo || !personalInfo.names || !personalInfo.addresses) {
      return `${clientName}\n[Address Not Available]`;
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
  const getBureauAddress = () => {
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
  const getCurrentDate = () => {
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

  // Enhanced PDF generation function
  const handleDownloadPDF = () => {
    const pdf = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
    });

    // Colors
    const primaryColor = [88, 129, 240]; // #5881F0
    const textColor = [41, 37, 36]; // #292524
    const lightGray = [243, 244, 246]; // #F3F4F6
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
      `Client: ${clientName}`,
      pdf.internal.pageSize.getWidth() - 20,
      10,
      { align: "right" }
    );
    pdf.text(
      `Bureau: ${bureau} - Round ${round}`,
      pdf.internal.pageSize.getWidth() - 20,
      17,
      { align: "right" }
    );

    currentY = 40;

    // FROM and TO addresses
    const senderAddress = getSenderAddress();
    const bureauAddress = getBureauAddress();

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
    const cleanContent = cleanHtmlContent(content);
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

    // Enclosures section
    if (currentY > pdf.internal.pageSize.getHeight() - 40) {
      pdf.addPage();
      currentY = 20;
    }

    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(10);

    pdf.setFont("helvetica", "normal");
    

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
      `Dispute_Letter_${clientName.replace(
        /\s+/g,
        "_"
      )}_${bureau}_Round_${round}.pdf`
    );
  };

  // Function to print the letter
  const handlePrint = () => {
    const printContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Dispute Letter - ${clientName} - ${bureau}</title>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
            
            * {
              margin: 0;
              padding: 0;
              box-sizing: border-box;
            }
            
            body {
              font-family: 'Inter', Arial, sans-serif;
              line-height: 1.6;
              color: #000000;
              background: #ffffff;
              padding: 20mm;
              font-size: 12pt;
            }
            
            .letter-container {
              max-width: 800px;
              margin: 0 auto;
              background: white;
            }
            
            .letter-header {
              background: #5881F0;
              color: white;
              padding: 15px 20px;
              margin: -20mm -20mm 20mm -20mm;
              display: flex;
              justify-content: space-between;
              align-items: center;
            }
            
            .addresses {
              display: flex;
              justify-content: space-between;
              margin-bottom: 30px;
              border-bottom: 2px solid #E5E7EB;
              padding-bottom: 20px;
            }
            
            .address-section {
              flex: 1;
            }
            
            .address-label {
              font-weight: 700;
              font-size: 11pt;
              margin-bottom: 8px;
              color: #292524;
            }
            
            .address-content {
              font-size: 11pt;
              line-height: 1.4;
              white-space: pre-line;
            }
            
            .letter-date {
              text-align: right;
              margin-bottom: 20px;
              font-size: 11pt;
              color: #6B7280;
            }
            
            .letter-content {
              font-size: 11pt;
              line-height: 1.6;
              margin-bottom: 40px;
            }
            
            .signature-section {
              margin-top: 60px;
            }
            
            .sincerely {
              font-size: 11pt;
              margin-bottom: 40px;
            }
            
            .client-name {
              font-weight: 700;
              font-size: 11pt;
              margin-bottom: 20px;
            }
            
            .enclosures {
              margin-top: 40px;
              font-size: 10pt;
            }
            
            .enclosures-title {
              font-weight: 700;
              margin-bottom: 10px;
            }
            
            .enclosures-list {
              list-style: none;
              padding-left: 0;
            }
            
            .enclosures-list li {
              margin-bottom: 5px;
              padding-left: 15px;
              position: relative;
            }
            
            .enclosures-list li:before {
              content: "•";
              position: absolute;
              left: 0;
              color: #5881F0;
              font-weight: bold;
            }
            
            .footer {
              margin-top: 40px;
              padding-top: 20px;
              border-top: 1px solid #E5E7EB;
              font-size: 9pt;
              color: #6B7280;
              text-align: center;
            }
            
            @media print {
              body {
                padding: 0;
                margin: 0;
              }
              
              .letter-header {
                margin: 0 0 20px 0;
              }
              
              .no-print {
                display: none;
              }
              
              @page {
                margin: 20mm;
                size: A4;
              }
            }
          </style>
        </head>
        <body>
          <div class="letter-container">
            <div class="letter-header no-print">
              <div class="header-title">
                <h1>DISPUTE LETTER</h1>
              </div>
              <div class="header-info">
                <div>Client: ${clientName}</div>
                <div>Bureau: ${bureau} - Round ${round}</div>
                <div>Status: ${status}</div>
              </div>
            </div>
            
            <div class="addresses">
              <div class="address-section">
                <div class="address-label">FROM:</div>
                <div class="address-content">${getSenderAddress().replace(
                  /\n/g,
                  "<br>"
                )}</div>
              </div>
              <div class="address-section">
                <div class="address-label">TO:</div>
                <div class="address-content">${getBureauAddress().replace(
                  /\n/g,
                  "<br>"
                )}</div>
              </div>
            </div>
            
            <div class="letter-date">${getCurrentDate()}</div>
            
            <div class="letter-content">
              ${content.replace(/<br\s*\/?>/g, "<br>")}
            </div>
            
            <div class="signature-section">
              <div class="sincerely">Sincerely,</div>
              <div class="client-name">${clientName}</div>
            </div>
            
            <div class="enclosures">
              <div class="enclosures-title">Enclosures:</div>
              <ul class="enclosures-list">
                <li>Copy of Government Issued ID</li>
                <li>Proof of Address</li>
                <li>FTC Identity Theft Report (if applicable)</li>
                <li>Supporting Documentation</li>
              </ul>
            </div>
            
            <div class="footer">
              Generated by LetterCraft • Confidential Dispute Letter • ${new Date().toLocaleDateString()}
            </div>
          </div>
          
          <script>
            window.onload = function() {
              window.print();
              setTimeout(() => {
                if (!window.closed) {
                  window.close();
                }
              }, 1000);
            }
          </script>
        </body>
      </html>
    `;

    const printWindow = window.open("", "_blank");
    if (!printWindow) {
      alert("Please allow popups to print the letter.");
      return;
    }

    printWindow.document.write(printContent);
    printWindow.document.close();
  };

  // Function to safely render HTML content
  const renderLetterContent = () => {
    if (!content) {
      return (
        <div className="text-center py-8 text-gray-500">
          No letter content available
        </div>
      );
    }

    return (
      <div
        className="letter-content prose prose-sm max-w-none"
        style={{
          color: "#000000",
          fontFamily: "Arial, sans-serif",
          lineHeight: "1.6",
          fontSize: "14px",
        }}
        dangerouslySetInnerHTML={{ __html: content }}
      />
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[900px] max-h-[95vh] bg-white overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3 text-[#111827]">
            <span className="font-semibold text-[20px] leading-[100%] tracking-normal text-[#292524]">
              Letter Preview - {clientName}
            </span>
            <Badge
              className={`rounded-full px-3 py-1 text-xs ${statusStyles[status]}`}
            >
              {status}
            </Badge>
            <span className="font-medium text-xs leading-[11px] -tracking-[0.03em] text-[#9F98AA]">
              {bureau} • Round {round}
            </span>
          </DialogTitle>
        </DialogHeader>
        <hr className="border-[#00000014]" />

        {/* Letter content for display */}
        <div
          ref={letterRef}
          className="letter-container rounded-lg border border-[#00000014] bg-white px-8 py-6"
          style={{
            minHeight: "500px",
            color: "#000000",
            backgroundColor: "white",
            fontFamily: "Arial, sans-serif",
            lineHeight: "1.6",
          }}
        >
          {/* Letter header with addresses */}
          <div className="addresses mb-8 flex justify-between border-b border-[#E5E7EB] pb-6">
            <div className="text-sm whitespace-pre-line">
              <strong>FROM:</strong>
              <br />
              {getSenderAddress()}
            </div>
            <div className="text-sm whitespace-pre-line text-right">
              <strong>TO:</strong>
              <br />
              {getBureauAddress()}
            </div>
          </div>

          {/* Date */}
          <div className="letter-date mb-6 text-right text-sm text-[#6B7280]">
            {getCurrentDate()}
          </div>

          {/* Actual letter content */}
          {renderLetterContent()}

        </div>

        <div className="flex justify-between mt-6">
          <div className="flex justify-start items-center gap-3">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Close
            </Button>
          </div>
          <div className="flex justify-end items-center gap-3">
            <Button variant="outline" onClick={handleDownloadPDF}>
              Download PDF
            </Button>
            <Button variant="outline" onClick={handlePrint}>
              Print
            </Button>
            <Button className="bg-primary hover:bg-primary/90">
              Send Letters
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default LetterPreview;

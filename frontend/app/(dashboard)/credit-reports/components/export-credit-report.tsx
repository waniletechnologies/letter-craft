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
  inquiries?: {
    id: string;
    company: string;
    date: string;
    bureau: string;
  }[];
  personalInfo?: {
    names?: string[];
    addresses?: string[];
    employers?: string[];
  };
  paymentHistory?: {
    account: string;
    status: string;
    history: string;
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
  inquiries = [],
  personalInfo = {},
  paymentHistory = [],
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

  const formatCurrency = (amount: string) => {
    // Check if it's already formatted with $ sign
    if (amount.includes('$')) return amount;
    
    // Try to parse as number and format
    const num = parseFloat(amount.replace(/[^0-9.]/g, ''));
    if (!isNaN(num)) {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      }).format(num);
    }
    
    // Return original if parsing fails
    return amount;
  };

  const formatDate = (dateString: string) => {
  try {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0"); // Months are zero-indexed
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  } catch {
    return dateString; // Fallback to original if parsing fails
  }
};


  const getScoreRating = (score: number) => {
    if (score >= 800) return { 
      rating: "Exceptional", 
      color: [34, 197, 94], 
      grade: "A+",
      gradientStart: [16, 185, 129],
      gradientEnd: [34, 197, 94]
    };
    if (score >= 740) return { 
      rating: "Very Good", 
      color: [59, 130, 246], 
      grade: "A",
      gradientStart: [59, 130, 246],
      gradientEnd: [37, 99, 235]
    };
    if (score >= 670) return { 
      rating: "Good", 
      color: [245, 158, 11], 
      grade: "B",
      gradientStart: [245, 158, 11],
      gradientEnd: [217, 119, 6]
    };
    if (score >= 580) return { 
      rating: "Fair", 
      color: [249, 115, 22], 
      grade: "C",
      gradientStart: [249, 115, 22],
      gradientEnd: [234, 88, 12]
    };
    return { 
      rating: "Poor", 
      color: [239, 68, 68], 
      grade: "F",
      gradientStart: [239, 68, 68],
      gradientEnd: [220, 38, 38]
    };
  };

  // Enhanced Credit Score Drawing Function
  const drawEnhancedCreditScore = (doc: jsPDF, startY: number) => {
    const scoreRating = getScoreRating(score);
    const centerX = doc.internal.pageSize.getWidth() / 2;
    const sectionY = startY + 30;

    // Create elegant background card
    const cardWidth = 520;
    const cardHeight = 200;
    const cardX = (doc.internal.pageSize.getWidth() - cardWidth) / 2;
    
    // Gradient background simulation with multiple rectangles
    const gradientSteps = 20;
    for (let i = 0; i < gradientSteps; i++) {
      const alpha = i / gradientSteps;
      const r = Math.round(255 * (1 - alpha) + 245 * alpha);
      const g = Math.round(255 * (1 - alpha) + 248 * alpha);
      const b = Math.round(255 * (1 - alpha) + 250 * alpha);
      
      doc.setFillColor(r, g, b);
      doc.rect(cardX, sectionY + (i * cardHeight / gradientSteps), cardWidth, cardHeight / gradientSteps, 'F');
    }
    
    // Card border with subtle shadow effect
    doc.setDrawColor(220, 220, 220);
    doc.setLineWidth(1);
    doc.roundedRect(cardX, sectionY, cardWidth, cardHeight, 8, 8);

    // Shadow effect simulation
    doc.setFillColor(0, 0, 0, 0.05);
    doc.roundedRect(cardX + 3, sectionY + 3, cardWidth, cardHeight, 8, 8, 'F');
    doc.setFillColor(255, 255, 255);
    doc.roundedRect(cardX, sectionY, cardWidth, cardHeight, 8, 8, 'F');
    
    // Main score circle with enhanced styling
    const circleX = cardX + 140;
    const circleY = sectionY + cardHeight / 2;
    const outerRadius = 65;
    const innerRadius = 55;

    // Outer ring with gradient effect
    doc.setFillColor(scoreRating.color[0], scoreRating.color[1], scoreRating.color[2]);
    doc.circle(circleX, circleY, outerRadius, 'F');
    
    // Inner white circle
    doc.setFillColor(255, 255, 255);
    doc.circle(circleX, circleY, innerRadius, 'F');

    // Score progress ring
    const progressRadius = 50;
    const progressWidth = 8;
    const scorePercentage = Math.min((score - 300) / (850 - 300), 1);
    
    // Background ring
    doc.setDrawColor(240, 240, 240);
    doc.setLineWidth(progressWidth);
    doc.circle(circleX, circleY, progressRadius);
    
    // Progress ring (simulated with multiple small arcs)
    const steps = Math.floor(scorePercentage * 100);
    doc.setDrawColor(scoreRating.color[0], scoreRating.color[1], scoreRating.color[2]);
    doc.setLineWidth(progressWidth);
    
    for (let i = 0; i < steps; i++) {
      const angle = (i / 100) * 2 * Math.PI - Math.PI / 2;
      const x1 = circleX + (progressRadius - progressWidth/2) * Math.cos(angle);
      const y1 = circleY + (progressRadius - progressWidth/2) * Math.sin(angle);
      const x2 = circleX + (progressRadius + progressWidth/2) * Math.cos(angle);
      const y2 = circleY + (progressRadius + progressWidth/2) * Math.sin(angle);
      
      if (i % 3 === 0) { // Draw every 3rd step to create a ring effect
        doc.setFillColor(scoreRating.color[0], scoreRating.color[1], scoreRating.color[2]);
        doc.circle(x1, y1, 1.5, 'F');
      }
    }

    // Main score number with shadow effect
    doc.setFont("helvetica", "bold");
    doc.setFontSize(36);
    
    // Shadow text
    doc.setTextColor(200, 200, 200);
    doc.text(score.toString(), circleX + 2, circleY - 5 + 2, { align: "center" });
    
    // Main text
    doc.setTextColor(scoreRating.color[0], scoreRating.color[1], scoreRating.color[2]);
    doc.text(score.toString(), circleX, circleY - 5, { align: "center" });
    
    // Grade with elegant styling
    doc.setFontSize(16);
    doc.setFont("helvetica", "normal");
    doc.text(scoreRating.grade, circleX, circleY + 20, { align: "center" });

    // Right side information panel
    const infoX = cardX + 280;
    const infoY = sectionY + 40;

    // Rating title with icon-like element
    doc.setFillColor(scoreRating.color[0], scoreRating.color[1], scoreRating.color[2]);
    doc.circle(infoX - 15, infoY - 5, 4, 'F');
    
    doc.setFont("helvetica", "bold");
    doc.setFontSize(24);
    doc.setTextColor(scoreRating.color[0], scoreRating.color[1], scoreRating.color[2]);
    doc.text(scoreRating.rating, infoX, infoY);

    // Elegant description box
    const descriptionY = infoY + 20;
    doc.setFillColor(248, 250, 252);
    doc.roundedRect(infoX - 10, descriptionY, 220, 60, 5, 5, 'F');
    
    doc.setDrawColor(scoreRating.color[0], scoreRating.color[1], scoreRating.color[2]);
    doc.setLineWidth(2);
    doc.line(infoX - 10, descriptionY, infoX + 210, descriptionY);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(11);
    doc.setTextColor(75, 85, 99);
    
    let description = "";
    switch(scoreRating.rating) {
      case "Exceptional":
        description = "Outstanding credit profile with excellent\npayment history and low credit utilization.\nYou qualify for the best rates and terms.";
        break;
      case "Very Good":
        description = "Strong credit profile with consistent\npayment history. You're likely to get\nfavorable rates on most credit products.";
        break;
      case "Good":
        description = "Solid credit standing with generally\nresponsible credit management.\nMost lenders will approve your applications.";
        break;
      case "Fair":
        description = "Below-average credit with some issues\nthat may affect approval and rates.\nImprovement opportunities exist.";
        break;
      case "Poor":
        description = "Significant credit challenges that limit\nyour options. Focus on rebuilding\nyour credit foundation.";
        break;
    }
    
    const descriptionLines = description.split('\n');
    descriptionLines.forEach((line, index) => {
      doc.text(line, infoX, descriptionY + 15 + (index * 13));
    });

    // Enhanced score range visualization
    const rangeY = sectionY + cardHeight - 40;
    const rangeWidth = cardWidth - 80;
    const rangeX = cardX + 40;
    const rangeHeight = 12;

    // Gradient range bar
    const rangeSteps = 50;
    for (let i = 0; i < rangeSteps; i++) {
      const position = i / rangeSteps;
      const currentScore = 300 + (position * 550);
      const currentRating = getScoreRating(currentScore);
      
      doc.setFillColor(currentRating.color[0], currentRating.color[1], currentRating.color[2]);
      doc.rect(rangeX + (i * rangeWidth / rangeSteps), rangeY, rangeWidth / rangeSteps, rangeHeight, 'F');
    }

    // Range border
    doc.setDrawColor(200, 200, 200);
    doc.setLineWidth(1);
    doc.rect(rangeX, rangeY, rangeWidth, rangeHeight);

    // Current score indicator with enhanced styling
    const scorePosition = ((score - 300) / 550) * rangeWidth;
    
    // Diamond-shaped indicator
    const diamondSize = 8;
    doc.setFillColor(scoreRating.color[0], scoreRating.color[1], scoreRating.color[2]);
    doc.triangle(
      rangeX + scorePosition, rangeY - diamondSize,
      rangeX + scorePosition - diamondSize, rangeY + rangeHeight + diamondSize,
      rangeX + scorePosition + diamondSize, rangeY + rangeHeight + diamondSize,
      'F'
    );

    // Score labels with better typography
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text("300", rangeX, rangeY + rangeHeight + 20);
    doc.text("POOR", rangeX, rangeY + rangeHeight + 30);
    
    doc.text("850", rangeX + rangeWidth - 15, rangeY + rangeHeight + 20);
    doc.text("EXCEPTIONAL", rangeX + rangeWidth - 50, rangeY + rangeHeight + 30);

    // Key milestone markers
    const milestones = [
      { score: 580, label: "FAIR", x: ((580 - 300) / 550) * rangeWidth },
      { score: 670, label: "GOOD", x: ((670 - 300) / 550) * rangeWidth },
      { score: 740, label: "VERY GOOD", x: ((740 - 300) / 550) * rangeWidth },
      { score: 800, label: "EXCEPTIONAL", x: ((800 - 300) / 550) * rangeWidth }
    ];

    milestones.forEach(milestone => {
      if (milestone.x > 50 && milestone.x < rangeWidth - 50) {
        doc.setDrawColor(150, 150, 150);
        doc.setLineWidth(1);
        doc.line(rangeX + milestone.x, rangeY - 5, rangeX + milestone.x, rangeY + rangeHeight + 5);
        
        doc.setFontSize(8);
        doc.setTextColor(120, 120, 120);
        doc.text(milestone.score.toString(), rangeX + milestone.x - 8, rangeY - 8);
      }
    });

    return sectionY + cardHeight + 30;
  };

  const handleExport = () => {
    const doc = new jsPDF({
      orientation: "portrait",
      unit: "pt",
      format: "a4",
    });

    // Colors
    const primaryColor = [88, 129, 240]; // #5881F0
    const secondaryColor = [59, 130, 246]; // #3B82F6
    const accentColor = [239, 68, 68]; // #EF4444
    const lightGray = [243, 244, 246]; // #F3F4F6
    const darkGray = [107, 114, 128]; // #6B7280
    const textColor = [41, 37, 36]; // #292524

    // Header with gradient background
    doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.rect(0, 0, doc.internal.pageSize.getWidth(), 80, 'F');
    
    // Logo/Title
    doc.setFont("helvetica", "bold");
    doc.setFontSize(22);
    doc.setTextColor(255, 255, 255);
    doc.text("Credit Dispute Report", 40, 40);
    
    // Client name in header
    doc.setFontSize(16);
    doc.text(fullName, doc.internal.pageSize.getWidth() - 40, 40, { align: "right" });
    
    // Report details
    doc.setFontSize(10);
    doc.setTextColor(255, 255, 255, 0.8);
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, doc.internal.pageSize.getWidth() - 40, 55, { align: "right" });
    doc.text(`Status: ${status}`, doc.internal.pageSize.getWidth() - 40, 70, { align: "right" });

    let lastY = 100;

    // Summary section
    doc.setFillColor(lightGray[0], lightGray[1], lightGray[2]);
    doc.roundedRect(40, lastY, doc.internal.pageSize.getWidth() - 80, 60, 3, 3, 'F');
    
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.setTextColor(textColor[0], textColor[1], textColor[2]);
    doc.text("REPORT SUMMARY", 55, lastY + 20);
    
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.text(`Provider: ${provider}`, 55, lastY + 35);
    doc.text(`Imported: ${importedOn}`, 55, lastY + 50);
    doc.text(`Bureaus: ${bureaus.join(", ")}`, doc.internal.pageSize.getWidth() - 55, lastY + 35, { align: "right" });
    
    lastY += 80;

    // Enhanced Credit Score Section
    if (includeScore) {
      doc.setFont("helvetica", "bold");
      doc.setFontSize(18);
      doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
      doc.text("CREDIT SCORE ANALYSIS", 40, lastY + 20);
      
      lastY = drawEnhancedCreditScore(doc, lastY);
    }

    // Accounts Section
    if (includeAccounts && accounts.length) {
      doc.setFont("helvetica", "bold");
      doc.setFontSize(14);
      doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
      doc.text("CREDIT ACCOUNTS", 40, lastY + 20);

      autoTable(doc, {
        startY: lastY + 30,
        head: [["Name", "Type", "Balance", "Status"]],
        body: accounts.map((a) => [a.name, a.type, formatCurrency(a.balance), a.status]),
        theme: "grid",
        headStyles: { 
          fillColor: [primaryColor[0], primaryColor[1], primaryColor[2]], 
          textColor: 255,
          fontStyle: 'bold',
          cellPadding: 5
        },
        bodyStyles: { 
          cellPadding: 5,
          fontSize: 10
        },
        styles: { 
          fontSize: 10, 
          cellPadding: 5,
          overflow: 'linebreak',
          lineWidth: 0.1,
          lineColor: [221, 221, 221]
        },
        alternateRowStyles: {
          fillColor: [250, 250, 250]
        },
        margin: { left: 40, right: 40 },
        tableWidth: 'auto'
      });
      lastY = (doc as JsPdfWithAutoTable).lastAutoTable?.finalY ?? lastY;
      lastY += 20;
    }

    // Negative Items Section
    if (includeNegatives && negativeItems.length) {
      doc.setFont("helvetica", "bold");
      doc.setFontSize(14);
      doc.setTextColor(accentColor[0], accentColor[1], accentColor[2]);
      doc.text("NEGATIVE ITEMS", 40, lastY + 20);

      autoTable(doc, {
        startY: lastY + 30,
        head: [["Label", "Bureau", "Date", "Impact"]],
        body: negativeItems.map((n) => [n.label, n.bureau, formatDate(n.date), n.impact]),
        theme: "grid",
        headStyles: { 
          fillColor: [accentColor[0], accentColor[1], accentColor[2]], 
          textColor: 255,
          fontStyle: 'bold',
          cellPadding: 5
        },
        bodyStyles: { 
          cellPadding: 5,
          fontSize: 10
        },
        styles: { 
          fontSize: 10, 
          cellPadding: 5,
          overflow: 'linebreak',
          lineWidth: 0.1,
          lineColor: [221, 221, 221]
        },
        alternateRowStyles: {
          fillColor: [255, 240, 240]
        },
        margin: { left: 40, right: 40 },
        tableWidth: 'auto'
      });
      lastY = (doc as JsPdfWithAutoTable).lastAutoTable?.finalY ?? lastY;
      lastY += 20;
    }

    // Payment History Section
    if (includePayments && paymentHistory.length) {
      doc.setFont("helvetica", "bold");
      doc.setFontSize(14);
      doc.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
      doc.text("PAYMENT HISTORY", 40, lastY + 20);

      autoTable(doc, {
        startY: lastY + 30,
        head: [["Account", "Status", "History"]],
        body: paymentHistory.map((p) => [p.account, p.status, p.history]),
        theme: "grid",
        headStyles: { 
          fillColor: [secondaryColor[0], secondaryColor[1], secondaryColor[2]], 
          textColor: 255,
          fontStyle: 'bold',
          cellPadding: 5
        },
        bodyStyles: { 
          cellPadding: 5,
          fontSize: 10
        },
        styles: { 
          fontSize: 10, 
          cellPadding: 5,
          overflow: 'linebreak',
          lineWidth: 0.1,
          lineColor: [221, 221, 221]
        },
        alternateRowStyles: {
          fillColor: [240, 245, 255]
        },
        margin: { left: 40, right: 40 },
        tableWidth: 'auto'
      });
      lastY = (doc as JsPdfWithAutoTable).lastAutoTable?.finalY ?? lastY;
      lastY += 20;
    }

    // Inquiries Section
    if (includeInquiries && inquiries.length) {
      doc.setFont("helvetica", "bold");
      doc.setFontSize(14);
      doc.setTextColor(darkGray[0], darkGray[1], darkGray[2]);
      doc.text("CREDIT INQUIRIES", 40, lastY + 20);

      autoTable(doc, {
        startY: lastY + 30,
        head: [["Company", "Date", "Bureau"]],
        body: inquiries.map((i) => [i.company, formatDate(i.date), i.bureau]),
        theme: "grid",
        headStyles: { 
          fillColor: [darkGray[0], darkGray[1], darkGray[2]], 
          textColor: 255,
          fontStyle: 'bold',
          cellPadding: 5
        },
        bodyStyles: { 
          cellPadding: 5,
          fontSize: 10
        },
        styles: { 
          fontSize: 10, 
          cellPadding: 5,
          overflow: 'linebreak',
          lineWidth: 0.1,
          lineColor: [221, 221, 221]
        },
        alternateRowStyles: {
          fillColor: [248, 249, 250]
        },
        margin: { left: 40, right: 40 },
        tableWidth: 'auto'
      });
      lastY = (doc as JsPdfWithAutoTable).lastAutoTable?.finalY ?? lastY;
      lastY += 20;
    }

    // Personal Information Section
    if (includePersonal && personalInfo) {
      doc.setFont("helvetica", "bold");
      doc.setFontSize(14);
      doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
      doc.text("PERSONAL INFORMATION", 40, lastY + 20);
      
      let personalY = lastY + 40;
      
      if (personalInfo.names && personalInfo.names.length) {
        doc.setFont("helvetica", "bold");
        doc.setFontSize(11);
        doc.setTextColor(textColor[0], textColor[1], textColor[2]);
        doc.text("Names:", 40, personalY);
        
        doc.setFont("helvetica", "normal");
        doc.setFontSize(10);
        personalInfo.names.forEach((name, i) => {
          if (personalY > doc.internal.pageSize.getHeight() - 50) {
            doc.addPage();
            personalY = 40;
          }
          doc.text(name, 60, personalY + 15 + (i * 15));
        });
        personalY += personalInfo.names.length * 15 + 25;
      }
      
      if (personalInfo.addresses && personalInfo.addresses.length) {
        if (personalY > doc.internal.pageSize.getHeight() - 50) {
          doc.addPage();
          personalY = 40;
        }
        
        doc.setFont("helvetica", "bold");
        doc.setFontSize(11);
        doc.text("Addresses:", 40, personalY);
        
        doc.setFont("helvetica", "normal");
        doc.setFontSize(10);
        personalInfo.addresses.forEach((address, i) => {
          if (personalY > doc.internal.pageSize.getHeight() - 50) {
            doc.addPage();
            personalY = 40;
          }
          doc.text(address, 60, personalY + 15 + (i * 15));
        });
        personalY += personalInfo.addresses.length * 15 + 25;
      }
      
      if (personalInfo.employers && personalInfo.employers.length) {
        if (personalY > doc.internal.pageSize.getHeight() - 50) {
          doc.addPage();
          personalY = 40;
        }
        
        doc.setFont("helvetica", "bold");
        doc.setFontSize(11);
        doc.text("Employers:", 40, personalY);
        
        doc.setFont("helvetica", "normal");
        doc.setFontSize(10);
        personalInfo.employers.forEach((employer, i) => {
          if (personalY > doc.internal.pageSize.getHeight() - 50) {
            doc.addPage();
            personalY = 40;
          }
          doc.text(employer, 60, personalY + 15 + (i * 15));
        });
      }
      
      lastY = personalY;
    }

    // Footer
    const pageCount = doc.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      
      // Page number
      doc.setFontSize(9);
      doc.setTextColor(darkGray[0], darkGray[1], darkGray[2]);
      doc.text(`Page ${i} of ${pageCount}`, doc.internal.pageSize.getWidth() / 2, doc.internal.pageSize.getHeight() - 20, { align: "center" });
      
      // Footer line
      doc.setDrawColor(primaryColor[0], primaryColor[1], primaryColor[2]);
      doc.setLineWidth(0.5);
      doc.line(40, doc.internal.pageSize.getHeight() - 30, doc.internal.pageSize.getWidth() - 40, doc.internal.pageSize.getHeight() - 30);
      
      // Footer text
      doc.setFontSize(9);
      doc.setTextColor(150);
      doc.text(
        "Generated by LetterCraft • Confidential Credit Dispute Report",
        40,
        doc.internal.pageSize.getHeight() - 15
      );
    }

    doc.save(`Credit_Dispute_Report_${fullName.replace(/\s+/g, '_')}.pdf`);
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
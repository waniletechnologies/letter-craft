/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Stepper from "../components/Stepper";
import IntegratedStepper from "./components/IntegratedStepper";
import { License, Proof, Address } from "@/public/images";
import { Pdf } from "@/public/images";
import { getClientLetters, updateLetterStatus, saveLetter, sendLetterEmail } from "@/lib/lettersApi";
import { toast } from "sonner";
const SendLettersPage = () => {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedLetters, setSelectedLetters] = useState<string[]>([]);
  const [includeIdAttachments, setIncludeIdAttachments] = useState(true);
  const [idAttachmentScope, setIdAttachmentScope] = useState("round1");
  const [includeReturnAddress, setIncludeReturnAddress] = useState(false);
  const [mailMethod, setMailMethod] = useState("certified");

  // Define a type for saved letter data
  interface SavedLetterData {
    letterDetails: {
      content: string;
      bureau: string;
      letterName: string;
      category?: string;
    };
    abbreviation?: string;
    savedAt?: string | number | Date;
    email?: string;
    selectedFtcReports?: string[];
    // Add other fields as needed
  }

  // Add state for saved letter data
  const [savedLetterData, setSavedLetterData] =
    useState<SavedLetterData | null>(null);
  interface FtcReport {
    _id: string;
    originalName?: string;
    fileName?: string;
    url?: string;
    // add other fields as needed
  }
  const [ftcReports, setFtcReports] = useState<FtcReport[]>([]);
  const [selectedFtcDocIds, setSelectedFtcDocIds] = useState<string[]>([]);
  interface ClientLetter {
    _id: string;
    bureau: string;
    letterName: string;
    abbreviation?: string;
    round?: number;
    status?: string;
    content: string;
    createdAt: string | number | Date;
    scheduleAt?: string | number | Date;
    // Add other fields as needed
  }
  const [clientLetters, setClientLetters] = useState<ClientLetter[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);

  // Load saved data on component mount
  useEffect(() => {
    const savedData = localStorage.getItem("savedLetterData");
      if (savedData) {
      const parsedData = JSON.parse(savedData);
      setSavedLetterData(parsedData);

      // Load client letters from backend
      if (parsedData.clientId) {
        loadClientLetters(parsedData.clientId);
        loadFtcReports(parsedData.clientId, parsedData.selectedFtcReports);
      }
      // if preparedLetters present, synthesize clientLetters-like entries for step 1
      if (Array.isArray(parsedData.preparedLetters) && parsedData.preparedLetters.length > 0) {
        const synthetic = parsedData.preparedLetters.map((pl: any, idx: number) => ({
          _id: `prepared-${idx + 1}`,
          bureau: pl.bureau,
          // Use the original letterName for routing, not the display label
          letterName: pl.letterName,
          // Add category so the route can include category=ROUND
          category: parsedData.letterDetails?.category || 'ROUND',
          abbreviation: parsedData.abbreviation || `RD${parsedData.round || 2}`,
          round: Number(parsedData.round || 2),
          status: 'draft',
          content: pl.content,
          createdAt: parsedData.savedAt || new Date().toISOString(),
          scheduleAt: pl.scheduleAt || parsedData.scheduleAt,
          // Keep a displayName field for UI labels if needed
          displayName: pl.displayName,
        }));
        setClientLetters(synthetic);
        setSelectedLetters(synthetic.map((s: any) => s._id));
        // Seed selected FTC doc IDs from saved data for immediate UI feedback
        if (Array.isArray(parsedData.selectedFtcReports)) {
          setSelectedFtcDocIds(parsedData.selectedFtcReports);
        }
      }
    } else {
      setLoading(false);
    }
  }, []);

  const loadClientLetters = async (clientId: string) => {
    try {
      setLoading(true);
      const response = await getClientLetters(clientId);
      if (response.success && response.data) {
        const backendLetters = response.data as ClientLetter[];
        setClientLetters(backendLetters);
        // Preselect all backend letters by ID
        const ids = backendLetters.map((l) => l._id);
        setSelectedLetters(ids);
      }
    } catch (error) {
      console.error("Error loading client letters:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadFtcReports = async (
    clientId: string,
    selectedReportIds: string[]
  ) => {
    try {
      if (!clientId || clientId === "") {
        console.log("No valid client ID, clearing FTC reports");
        setFtcReports([]);
        return;
      }

      if (!selectedReportIds || selectedReportIds.length === 0) {
        console.log("No selected report IDs, clearing FTC reports");
        setFtcReports([]);
        return;
      }

      console.log("Loading FTC reports for client:", clientId, "with reports:", selectedReportIds);

      // Get the auth token from localStorage or your auth context
      const token =
        localStorage.getItem("authToken") || localStorage.getItem("token");

      const headers: HeadersInit = {
        "Content-Type": "application/json",
      };

      // Add authorization header if token exists
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }

      // Fetch client files to get FTC reports with auth headers
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/clients/${clientId}/files`,
        {
          headers,
          credentials: "include", // Include cookies if using session-based auth
        }
      );

      if (response.ok) {
        const data = await response.json();
        console.log("Client files response:", data);

        const ftcReportData = data.data?.ftcReport || [];
        console.log("Available FTC reports:", ftcReportData);

        // Filter to only selected reports
        interface FtcReport {
          _id: string;
          originalName?: string;
          fileName?: string;
          url?: string;
        }
        const selectedReports = ftcReportData.filter((report: FtcReport) => selectedReportIds.includes(report._id));

        console.log("Selected FTC reports:", selectedReports);
        setFtcReports(selectedReports);
        setSelectedFtcDocIds(selectedReports.map((r: { _id: any; }) => r._id));
      } else {
        console.log("Failed to fetch client files, status:", response.status);
        setFtcReports([]);
        setSelectedFtcDocIds([]);
      }
    } catch (error) {
      console.error("Error loading FTC reports:", error);
      setFtcReports([]);
      setSelectedFtcDocIds([]);
    }
  };

  // Helper function to get description for step 1
  const getSelectedLettersDescription = () => {
    if (savedLetterData) {
      return `1 letter from ${savedLetterData.letterDetails.bureau}`;
    }
    return "3 selected";
  };

  // Helper function to get description for step 2
  const getAttachedDocumentsDescription = () => {
    // Count only actually selected FTC documents
    const count = selectedFtcDocIds.length;
    return `${count} documents`;
  };

  const steps = [
    {
      id: 1,
      title: "Select Letters",
      description: getSelectedLettersDescription(),
    },
    {
      id: 2,
      title: "Attached Documents",
      description: getAttachedDocumentsDescription(),
    },
    { id: 3, title: "Select Print & Mail Methods", description: "" },
    { id: 4, title: "Confirm Letter Sending Options", description: "" },
  ];

  // Convert client letters to the format expected by the component
  const letters = clientLetters.map((letter) => ({
    id: letter._id,
    name: `${letter.bureau.toUpperCase()} - ${letter.letterName}`,
    abbreviation: letter.abbreviation || `RD${letter.round}`,
    created: `${letter.scheduleAt ? new Date(letter.scheduleAt).toLocaleString() : new Date(letter.createdAt).toLocaleString()}`,
    printStatus:
      letter.status === "draft"
        ? "Pending Print"
        : letter.status === "sent"
        ? "Sent"
        : letter.status === "delivered"
        ? "Delivered"
        : "Failed",
    pages: Math.ceil(letter.content.length / 2000),
    onEdit: (email?: string) => handleEditLetter(letter, email),
    onView: (email?: string) => handleViewLetter(letter, email),
  }));

  // If no letters from backend, show saved letter data
  if (letters.length === 0 && savedLetterData) {
    letters.push({
      id: "saved-letter",
      name: `${savedLetterData.letterDetails.bureau.toUpperCase()} - ${decodeURIComponent(
        savedLetterData.letterDetails.letterName
      )}`,
      abbreviation: savedLetterData.abbreviation || "RD2",
      created: new Date(savedLetterData.savedAt ?? Date.now()).toLocaleString(),
      printStatus: "Pending Print",
      pages: 2,
      onEdit: () => handleEditLetter(savedLetterData),
      onView: () => handleViewLetter(savedLetterData),
    });
  }

  // In SendLettersPage component, update the handleEditLetter and handleViewLetter

  interface LetterData {
    _id?: string;
    category?: string;
    letterName?: string;
    letterDetails?: {
      category?: string;
      letterName?: string;
      bureau?: string;
    };
    abbreviation?: string;
    savedAt?: string | number | Date;
    status?: string;
    round?: number;
    email?: string;
    content?: string;
    createdAt?: string | number | Date;
    // Add other fields as needed
  }

  const handleEditLetter = (letterData: LetterData, email?: string) => {
    // Navigate back to generate letter page with the letter data and email
    if (letterData) {
      // Store the data to be used when navigating back
      localStorage.setItem("editLetterData", JSON.stringify(letterData));

      // Build URL with email parameter
      // Prefer explicit fields from synthetic prepared letters; fallback to letterDetails
      let category = (letterData as any).category || letterData.letterDetails?.category || "";
      let letterName = letterData.letterName || letterData.letterDetails?.letterName || "";
      // Preserve spacing as '+' by not decoding; use encodeURIComponent only for safety around special chars
      const encodedCategory = encodeURIComponent(category).replace(/%20/g, '+');
      // Do not append display suffixes like " - Letter 1"; ensure using raw template name
      const encodedLetter = encodeURIComponent(letterName).replace(/%20/g, '+');
      let url = `/dispute-wizard/generate-letter?category=${encodedCategory}&letter=${encodedLetter}`;

      // Add email to URL if available (from parameter or saved data)
      const emailToUse = email || letterData.email || savedLetterData?.email;
      if (emailToUse) {
        // Keep double-encoded form intact if it already includes %25
        const keepEncoded = /%25/i.test(emailToUse);
        const emailParam = keepEncoded ? emailToUse : encodeURIComponent(emailToUse);
        url += `&email=${emailParam}`;
      }

        router.push(url);
    }
  };

  const handleViewLetter = (letterData: LetterData, email?: string) => {
    // Open the letter in a preview mode or modal
    if (letterData) {
      // Store letter data for viewing
      localStorage.setItem(
        "viewLetterData",
        JSON.stringify({ ...letterData, email })
      );

      // Navigate to a letter preview page or open a modal
      console.log("View letter:", letterData, "with email:", email);
      const letterName =
        letterData.letterName ||
        letterData.letterDetails?.letterName ||
        "Unknown";
      toast.message(`Viewing letter: ${letterName} for email: ${email}`);
    }
  };

  // Update the letters mapping to include email in the callbacks

  // If no letters from backend, show saved letter data
  if (letters.length === 0 && savedLetterData) {
    letters.push({
      id: "saved-letter",
      name: `${savedLetterData.letterDetails.bureau.toUpperCase()} - ${decodeURIComponent(
        savedLetterData.letterDetails.letterName
      )}`,
      abbreviation: savedLetterData.abbreviation || "RD2",
      created: new Date(savedLetterData.savedAt ?? Date.now()).toLocaleString(),
      printStatus: "Pending Print",
      pages: 2,
      onEdit: (email?: string) => handleEditLetter(savedLetterData, email),
      onView: (email?: string) => handleViewLetter(savedLetterData, email),
    });
    // Ensure the locally saved letter is selected
    if (!selectedLetters.includes("saved-letter")) {
      setSelectedLetters(["saved-letter"]);
    }
  }

  // Build documents strictly from selected FTC reports
  const documents = (
    ftcReports.length > 0
      ? ftcReports.map((report) => ({
          id: report._id,
          name: report.originalName || report.fileName || `FTC Report`,
          type: "document",
          image: Pdf,
          isFtcReport: true,
          url: report.url,
        }))
      : [
          {
            name: "No FTC Reports Available",
            type: "message",
            image: Pdf,
            isFtcReport: false,
            url: undefined,
          },
        ]
  );

  const handleLetterSelection = (letterId: string, checked: boolean) => {
    if (checked) {
      setSelectedLetters((prev) => [...prev, letterId]);
    } else {
      setSelectedLetters((prev) => prev.filter((id) => id !== letterId));
    }
  };

  const handleToggleDocument = (docId: string, checked: boolean) => {
    setSelectedFtcDocIds(prev => {
      if (checked) {
        return Array.from(new Set([...prev, docId]));
      }
      return prev.filter(id => id !== docId);
    });
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedLetters(letters.map((l) => l.id));
    } else {
      setSelectedLetters([]);
    }
  };

  const handlePrintLocal = async () => {
    try {
      // Get the actual letter content from your data
      const lettersToPrint = clientLetters.filter((letter) =>
        selectedLetters.includes(letter._id)
      );

      // Also include the saved letter if selected
      if (selectedLetters.includes("saved-letter") && savedLetterData) {
        lettersToPrint.push({
          _id: "saved-letter",
          bureau: savedLetterData.letterDetails.bureau,
          letterName: savedLetterData.letterDetails.letterName,
          content: savedLetterData.letterDetails.content || "",
          abbreviation: savedLetterData.abbreviation || "RD2",
          createdAt: savedLetterData.savedAt || new Date().toISOString(),
          round: 2,
          status: "draft",
        } as ClientLetter);
      }

      if (lettersToPrint.length === 0) {
        toast.error("No letters selected to print");
        return;
      }

      // Build enclosures from selected FTC reports
      const enclosureHtml = selectedFtcDocIds.length > 0
        ? `<div style="margin-top: 24px; font-style: italic;">
             Enclosures:
             <ul>${selectedFtcDocIds.map((id) => {
               const r = ftcReports.find((f) => f._id === id);
               const name = r?.originalName || r?.fileName || 'FTC Report';
               return `<li>${name}${r?.url ? ` - <a href="${r.url}" target="_blank">link</a>` : ''}</li>`;
             }).join('')}</ul>
           </div>`
        : '';

      // Create print content with actual letter data
      const printContent = lettersToPrint
        .map(
          (letter) => `
      <div style="page-break-after: always; padding: 40px; font-family: 'Times New Roman', serif; line-height: 1.6;">
        <div style="text-align: right; margin-bottom: 30px; font-size: 12px;">
          ${new Date().toLocaleDateString()}
        </div>
        
        <div style="margin-bottom: 40px;">
          <h2 style="text-align: center; margin-bottom: 20px;">${
            letter.letterName
          }</h2>
          <p><strong>Bureau:</strong> ${letter.bureau}</p>
          <p><strong>Reference:</strong> ${letter.abbreviation}</p>
          ${letter.scheduleAt ? `<p><strong>Scheduled:</strong> ${new Date(letter.scheduleAt).toLocaleString()}</p>` : ''}
        </div>
        
        <div style="margin-top: 40px; white-space: pre-wrap;">
          ${letter.content || "Letter content not available"}
        </div>
        
        <div style="margin-top: 60px;">
          <p>Sincerely,</p>
          <br /><br />
          <p>${"Client Name"}</p>
        </div>
        ${enclosureHtml}
      </div>
    `
        )
        .join("");

      // Create and open print window
      const printWindow = window.open("", "_blank");
      if (printWindow) {
        printWindow.document.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>Print Letters - ${lettersToPrint.length} Letter(s)</title>
            <style>
              body { 
                margin: 0; 
                padding: 0; 
                font-family: 'Times New Roman', serif;
                line-height: 1.6;
                color: #000;
              }
              @media print {
                body { margin: 0; }
                @page { margin: 1cm; }
              }
              h2 { color: #000; }
              hr { border: 1px solid #ccc; }
            </style>
          </head>
          <body>
            ${printContent}
            <script>
              window.onload = function() {
                window.print();
                // Optional: close window after printing
                setTimeout(function() {
                  window.close();
                }, 1000);
              }
            </script>
          </body>
        </html>
      `);
        printWindow.document.close();

        toast.success(
          `Preparing ${lettersToPrint.length} letter(s) for printing`
        );
      } else {
        toast.error("Please allow popups to print letters");
      }
    } catch (error) {
      console.error("Error printing letters:", error);
      toast.error("Failed to prepare letters for printing");
    }
  };

  const canGoNext = () => {
    switch (currentStep) {
      case 1:
        return selectedLetters.length > 0;
      case 2:
        return true;
      case 3:
        return mailMethod !== "";
      case 4:
        return true;
      default:
        return false;
    }
  };

  const handleNext = () => {
    if (currentStep < 4 && canGoNext()) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  // In SendLettersPage, update the handleSendLetters function

  const handleSendLetters = async () => {
    setIsSending(true);
    try {
      // If we have locally saved letter data (not persisted yet), save it now with mail method and attachments
      const saved = localStorage.getItem("savedLetterData");
      if (saved) {
        const parsed = JSON.parse(saved);

        // Handle clientId - convert empty string to null
        let processedClientId = parsed.clientId;
        if (
          parsed.clientId === "" ||
          parsed.clientId === null ||
          parsed.clientId === undefined
        ) {
          processedClientId = null;
        }

        // Build attachments list from documents that are FTC reports
        const selectedAttachments = ftcReports.filter(r => selectedFtcDocIds.includes(r._id)).map((r) => ({
          fileName: r.originalName || r.fileName || "FTC Report",
          s3Key: undefined,
          originalName: r.originalName || r.fileName,
        }));

        // Persist the letter now
        const payload = {
          clientId: processedClientId, // Use processed clientId
          letterName:
            parsed.letterName || parsed.letterDetails?.letterName || "",
          abbreviation: parsed.abbreviation || "",
          round: parseInt(parsed.round || "2"),
          category: parsed.letterDetails?.category || "ROUND",
          bureau: parsed.letterDetails?.bureau || "Equifax",
          content: parsed.letterDetails?.content || "",
          personalInfo: parsed.letterDetails?.personalInfo || {},
          selectedFtcReports: selectedFtcDocIds,
          followUpDays: parsed.followUpDays || 2,
          createFollowUpTask: parsed.createFollowUpTask !== false,
          email: parsed.email,
          scheduleAt: parsed.scheduleAt,
          // Extra metadata
          sendMethod: mailMethod,
          attachments: selectedAttachments,
        } as {
          clientId: string | null;
          letterName: string;
          abbreviation: string;
          round: number;
          category: string;
          bureau: string;
          content: string;
          personalInfo: Record<string, unknown>;
          selectedFtcReports: string[];
          followUpDays: number;
          createFollowUpTask: boolean;
          email?: string;
          scheduleAt?: string;
          sendMethod: string;
          attachments: {
            fileName: string;
            s3Key?: string;
            originalName?: string;
          }[];
        };
        

        // If we have preparedLetters, persist each letter separately
        const prepared = Array.isArray(parsed.preparedLetters) ? parsed.preparedLetters : [];
        if (prepared.length > 0) {
          for (let i = 0; i < prepared.length; i++) {
            const pl = prepared[i];
            const plPayload = {
              ...payload,
              letterName: pl.letterName,
              bureau: pl.bureau,
              content: pl.content,
              category: parsed.letterDetails?.category || payload.category,
            };
            const saveRes = await saveLetter(plPayload);
            if (!saveRes.success) {
              throw new Error(saveRes.message || "Failed to save letter");
            }
            interface SaveLetterResponse { _id: string; }
            const newLetterId = (saveRes.data as SaveLetterResponse)?._id;
            if (newLetterId) {
              await updateLetterStatus(newLetterId, {
                status: "sent",
                sendMethod: mailMethod,
                trackingNumber: `TRK${Date.now()}`,
              });
              const provider = mailMethod === 'certified' ? 'localmail' : 'cloudmail';
              await sendLetterEmail(newLetterId, provider as 'localmail' | 'cloudmail');
            }
          }
        } else {
          // Persist the single letter fallback
          const saveRes = await saveLetter(payload);
          if (!saveRes.success) {
            throw new Error(saveRes.message || "Failed to save letter");
          }
          interface SaveLetterResponse { _id: string; }
          const newLetterId = (saveRes.data as SaveLetterResponse)?._id;
          if (newLetterId) {
            await updateLetterStatus(newLetterId, {
              status: "sent",
              sendMethod: mailMethod,
              trackingNumber: `TRK${Date.now()}`,
            });
            const provider = mailMethod === 'certified' ? 'localmail' : 'cloudmail';
            await sendLetterEmail(newLetterId, provider as 'localmail' | 'cloudmail');
          }
        }
      }

      // Update status for any already-persisted selected letters
      for (const letterId of selectedLetters) {
        if (letterId !== "saved-letter") {
          await updateLetterStatus(letterId, {
            status: "sent",
            sendMethod: mailMethod,
            trackingNumber: `TRK${Date.now()}`,
          });

          // Also send emails for these selected letters
          const provider =
            mailMethod === "certified" ? "localmail" : "localmail";
          console.log("Sending email for letter:", letterId, "via", provider);
          await sendLetterEmail(
            letterId,
            provider as "localmail" | "localmail"
          );
        }
      }

      // Clear the saved data from localStorage after successful send
      localStorage.removeItem("savedLetterData");

      // Show success message
      toast.success("Letters sent successfully!");
      
      // Navigate to dashboard or letters page
      router.push("/letters");
    } catch (error) {
      console.error("Error sending letters:", error);
      toast.error("Failed to send letters. Please try again.");
    }
  };

  return (
    <div className="p-6">
      {/* Title + Stepper row */}
      <div className="flex items-start justify-between mb-6">
        <h1 className="font-semibold text-[24px] leading-none text-[#111827]">
          Send Letters{" "}
          <span className="text-[#9CA3AF] text-sm">(Michael Yaldo)</span>
        </h1>
        <Stepper current={2} />
      </div>

      {/* Integrated Stepper with Content */}
      <div className="mb-6">
        <IntegratedStepper
          steps={steps}
          currentStep={currentStep}
          letters={letters}
          selectedLetters={selectedLetters}
          documents={documents}
          includeIdAttachments={includeIdAttachments}
          idAttachmentScope={idAttachmentScope}
          includeReturnAddress={includeReturnAddress}
          mailMethod={mailMethod}
          onLetterSelection={handleLetterSelection}
          onSelectAll={handleSelectAll}
          onIncludeIdAttachmentsChange={setIncludeIdAttachments}
          onIdAttachmentScopeChange={setIdAttachmentScope}
          onIncludeReturnAddressChange={setIncludeReturnAddress}
          onMailMethodChange={setMailMethod}
          onBack={handleBack}
          onNext={handleNext}
          onSendLetters={handleSendLetters}
          onPrintLocal={handlePrintLocal} // Add this line
          canNext={canGoNext()}
          email={savedLetterData?.email}
          selectedFtcDocCount={selectedFtcDocIds.length}
          isSending={isSending}
        />
      </div>
    </div>
  );
};

export default SendLettersPage;
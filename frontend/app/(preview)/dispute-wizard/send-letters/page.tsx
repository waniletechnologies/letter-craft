/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Stepper from "../components/Stepper";
import IntegratedStepper from "./components/IntegratedStepper";
import { License, Proof, Address } from "@/public/images";
import { Pdf } from "@/public/images";
import { getClientLetters, updateLetterStatus, saveLetter, sendLetterEmail } from "@/lib/lettersApi";
const SendLettersPage = () => {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedLetters, setSelectedLetters] = useState<string[]>([
    "equifax",
    "experian",
    "transunion",
  ]);
  const [includeIdAttachments, setIncludeIdAttachments] = useState(true);
  const [idAttachmentScope, setIdAttachmentScope] = useState("round1");
  const [includeReturnAddress, setIncludeReturnAddress] = useState(false);
  const [mailMethod, setMailMethod] = useState("certified");

  // Define a type for saved letter data
  interface SavedLetterData {
    letterDetails: {
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
  interface ClientLetter {
    _id: string;
    bureau: string;
    letterName: string;
    abbreviation?: string;
    round?: number;
    status?: string;
    content: string;
    createdAt: string | number | Date;
    // Add other fields as needed
  }
  const [clientLetters, setClientLetters] = useState<ClientLetter[]>([]);
  const [loading, setLoading] = useState(true);

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
    } else {
      setLoading(false);
    }
  }, []);

  const loadClientLetters = async (clientId: string) => {
    try {
      setLoading(true);
      const response = await getClientLetters(clientId);
      if (response.success && response.data) {
        setClientLetters(response.data as ClientLetter[]);
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

      console.log(
        "Loading FTC reports for client:",
        clientId,
        "with reports:",
        selectedReportIds
      );

      // Fetch client files to get FTC reports
      const response = await fetch(`/api/clients/${clientId}/files`);

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
          // add other fields as needed
        }
        const selectedReports = ftcReportData.filter((report: FtcReport) =>
          selectedReportIds.includes(report._id)
        );

        console.log("Selected FTC reports:", selectedReports);
        setFtcReports(selectedReports);
      } else {
        console.log("Failed to fetch client files, status:", response.status);
        setFtcReports([]);
      }
    } catch (error) {
      console.error("Error loading FTC reports:", error);
      setFtcReports([]);
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
    const count = ftcReports.length + (includeIdAttachments ? 1 : 0);
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
    created: new Date(letter.createdAt).toLocaleString(),
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
      let url = `/dispute-wizard/generate-letter?category=${letterData.category}&letter=${letterData.letterName}`;

      // Add email to URL if available (from parameter or saved data)
      const emailToUse = email || letterData.email || savedLetterData?.email;
      if (emailToUse) {
        url += `&email=${encodeURIComponent(emailToUse)}`;
      }

      // If it's a saved letter from backend, use the letter details
      if (letterData._id) {
        router.push(url);
      } else {
        // If it's from localStorage, use the saved data structure
        router.push(
          `/dispute-wizard/generate-letter?category=${
            letterData.letterDetails?.category ?? ""
          }&letter=${letterData.letterDetails?.letterName ?? ""}${
            emailToUse ? `&email=${encodeURIComponent(emailToUse)}` : ""
          }`
        );
      }
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
      alert(`Viewing letter: ${letterName} for email: ${email}`);
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
  }

  // Update the documents array to include FTC reports
  const documents = [
    // FTC Reports from the selected reports
    ...ftcReports.map((report) => ({
      name: report.originalName || report.fileName || `FTC Report`,
      type: "document",
      image: Pdf, // Use PDF icon for FTC reports
      isFtcReport: true,
      url: report.url,
    })),
    // Show message if no FTC reports are available
    ...(ftcReports.length === 0 &&
    (savedLetterData?.selectedFtcReports?.length ?? 0) > 0
      ? [
          {
            name: "No FTC Reports Available",
            type: "message",
            image: Pdf,
            isFtcReport: false,
            url: undefined,
          },
        ]
      : []),
    // Other ID documents (these would come from the client's uploaded files)
    { name: "Driver's License.jpg", type: "image", image: License },
    { name: "Proof of SS.jpg", type: "image", image: Proof },
    { name: "Proof of Address.jpg", type: "image", image: Address },
  ];

  const handleLetterSelection = (letterId: string, checked: boolean) => {
    if (checked) {
      setSelectedLetters((prev) => [...prev, letterId]);
    } else {
      setSelectedLetters((prev) => prev.filter((id) => id !== letterId));
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedLetters(letters.map((l) => l.id));
    } else {
      setSelectedLetters([]);
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
        const selectedAttachments = ftcReports.map((r) => ({
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
          selectedFtcReports: parsed.selectedFtcReports || [],
          followUpDays: parsed.followUpDays || 2,
          createFollowUpTask: parsed.createFollowUpTask !== false,
          email: parsed.email,
          // Extra metadata
          sendMethod: mailMethod,
          attachments: selectedAttachments,
        } as any;

        const saveRes = await saveLetter(payload);
        if (!saveRes.success) {
          throw new Error(saveRes.message || "Failed to save letter");
        }

        // After save, update status to sent
        const newLetterId = (saveRes.data as { _id?: string })?._id;
        if (newLetterId) {
          await updateLetterStatus(newLetterId, {
            status: "sent",
            sendMethod: mailMethod,
            trackingNumber: `TRK${Date.now()}`,
          });

          // Send email via selected provider
          const provider = mailMethod === 'certified' ? 'localmail' : 'cloudmail';
          await sendLetterEmail(newLetterId, provider as 'localmail' | 'cloudmail');
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
          const provider = mailMethod === 'certified' ? 'localmail' : 'cloudmail';
          await sendLetterEmail(letterId, provider as 'localmail' | 'cloudmail');
        }
      }

      // Clear the saved data from localStorage after successful send
      localStorage.removeItem("savedLetterData");

      // Show success message
      alert("Letters sent successfully!");

      // Navigate to dashboard or letters page
      router.push("/letters");
    } catch (error) {
      console.error("Error sending letters:", error);
      alert("Failed to send letters. Please try again.");
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
          canNext={canGoNext()}
          email={savedLetterData?.email}
        />
      </div>
    </div>
  );
};

export default SendLettersPage;
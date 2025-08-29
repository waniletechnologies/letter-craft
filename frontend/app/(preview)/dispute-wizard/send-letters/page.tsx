"use client"

import React, { useState } from "react";
import Stepper from "../components/Stepper";
import IntegratedStepper from "./components/IntegratedStepper";
import { License, Proof, Address } from "@/public/images";
import { Pdf } from "@/public/images";

const SendLettersPage = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedLetters, setSelectedLetters] = useState<string[]>(["equifax", "experian", "transunion"]);
  const [includeIdAttachments, setIncludeIdAttachments] = useState(true);
  const [idAttachmentScope, setIdAttachmentScope] = useState("round1");
  const [includeReturnAddress, setIncludeReturnAddress] = useState(false);
  const [mailMethod, setMailMethod] = useState("certified");

  const steps = [
    { id: 1, title: "Select Letters", description: "3 selected" },
    { id: 2, title: "Attached Documents", description: "" },
    { id: 3, title: "Select Print & Mail Methods", description: "" },
    { id: 4, title: "Confirm Letter Sending Options", description: "" },
  ];

  const letters = [
    {
      id: "equifax",
      name: "EQUIFAX",
      abbreviation: "RD1_EQUIFAX",
      created: "4 seconds ago",
      printStatus: "Pending Print",
      pages: 2,
    },
    {
      id: "experian",
      name: "Experian",
      abbreviation: "RD1_experian",
      created: "4 seconds ago",
      printStatus: "Pending Print",
      pages: 2,
    },
    {
      id: "transunion",
      name: "Transunion",
      abbreviation: "RD1_transunion",
      created: "4 seconds ago",
      printStatus: "Pending Print",
      pages: 2,
    },
  ];

  const documents = [
    { name: "Driver's License.jpg",  type: "image", image: License },
    { name: "Proof of SS.jpg", type: "image", image: Proof },
    { name: "Proof of Address.jpg", type: "image", image: Address },
    { name: "FTC Report - January 2023", type: "document", image: Pdf },
  ];

  const handleLetterSelection = (letterId: string, checked: boolean) => {
    if (checked) {
      setSelectedLetters(prev => [...prev, letterId]);
    } else {
      setSelectedLetters(prev => prev.filter(id => id !== letterId));
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedLetters(letters.map(l => l.id));
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

  return (
    <div className="p-6">
      {/* Title + Stepper row */}
      <div className="flex items-start justify-between mb-6">
        <h1 className="font-semibold text-[24px] leading-none text-[#111827]">
          Send Letters <span className="text-[#9CA3AF] text-sm">(Michael Yaldo)</span>
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
          canNext={canGoNext()}
        />
      </div>
    </div>
  );
};

export default SendLettersPage;
"use client"

import React from "react";
import SelectLetters, { Letter } from "./SelectLetters";
import AttachedDocuments, { DocumentItem } from "./AttachedDocuments";
import PrintMailMethods from "./PrintMailMethods";
import ConfirmOptions from "./ConfirmOptions";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

interface Step {
  id: number;
  title: string;
  description?: string;
}

interface IntegratedStepperProps {
  steps: Step[];
  currentStep: number;
  letters: Letter[];
  selectedLetters: string[];
  documents: DocumentItem[];
  includeIdAttachments: boolean;
  idAttachmentScope: string;
  includeReturnAddress: boolean;
  mailMethod: string;
  onLetterSelection: (letterId: string, checked: boolean) => void;
  onSelectAll: (checked: boolean) => void;
  onIncludeIdAttachmentsChange: (checked: boolean) => void;
  onIdAttachmentScopeChange: (scope: string) => void;
  onIncludeReturnAddressChange: (checked: boolean) => void;
  onMailMethodChange: (method: string) => void;
  onBack: () => void;
  onNext: () => void;
  canNext: boolean;
}

const IntegratedStepper: React.FC<IntegratedStepperProps> = ({
  steps,
  currentStep,
  letters,
  selectedLetters,
  documents,
  includeIdAttachments,
  idAttachmentScope,
  includeReturnAddress,
  mailMethod,
  onLetterSelection,
  onSelectAll,
  onIncludeIdAttachmentsChange,
  onIdAttachmentScopeChange,
  onIncludeReturnAddressChange,
  onMailMethodChange,
  onBack,
  onNext,
  canNext,
}) => {
  const router = useRouter();

  const renderStepContent = (stepId: number) => {
    switch (stepId) {
      case 1:
        return (
          <SelectLetters
            letters={letters}
            selectedLetters={selectedLetters}
            onLetterSelection={onLetterSelection}
            onSelectAll={onSelectAll}
          />  
        );
      case 2:
        return (
          <AttachedDocuments
            includeIdAttachments={includeIdAttachments}
            idAttachmentScope={idAttachmentScope}
            includeReturnAddress={includeReturnAddress}
            documents={documents}
            onIncludeIdAttachmentsChange={onIncludeIdAttachmentsChange}
            onIdAttachmentScopeChange={onIdAttachmentScopeChange}
            onIncludeReturnAddressChange={onIncludeReturnAddressChange}
          />
        );
      case 3:
        return (
          <PrintMailMethods
            mailMethod={mailMethod}
            onMailMethodChange={onMailMethodChange}
          />
        );
      case 4:
        return (
          <ConfirmOptions
            selectedLetters={selectedLetters}
            mailMethod={mailMethod}
            includeIdAttachments={includeIdAttachments}
            idAttachmentScope={idAttachmentScope}
            includeReturnAddress={includeReturnAddress}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-0">
      {steps.map((step,) => (
        <div key={step.id} className="relative">
          {/* Step Header */}
          <div className="flex items-start gap-4">
            {/* Step Number Circle with Vertical Line */}
            <div className="relative flex-shrink-0">
              <div
                className={`h-8 w-8 rounded-full flex items-center justify-center text-sm font-semibold ${
                  currentStep === step.id
                    ? "bg-primary text-white"
                    : step.id < currentStep
                    ? "bg-[#2196F380]/50 text-[#FFFFFF]"
                    : "bg-[#B8B8B8] text-[#FFFFFF]"
                }`}
              >
                {step.id}
              </div>
              
              {/* Vertical Line - Full height for active step, partial for others */}
              {step.id < steps.length && (
                <div 
                  className={`absolute left-1/2 transform -translate-x-1/2 w-0.5 bg-[#E2E2E2]  ${
                    currentStep === step.id 
                      ? "top-8 h-60"
                      : "top-8 h-6"  
                  }`}
                />
              )}
            </div>

            {/* Step Title and Content */}
            <div className="flex-1 min-w-0 pl-8">
              <div className={`font-semibold text-[28px] leading-[32px] -tracking-[0.04em] mb-4 ${
                currentStep === step.id ? "text-[#383737]" : "text-[#B8B8B8]"
              }`}>
                {step.title}
                {step.description && (
                  <span className="font-medium text-[15px] leading-[32px] -tracking-[0.04em] text-[#71717A] ml-2">({step.description})</span>
                )}
              </div>

              {/* Step Content - Only show for current step */}
              {currentStep === step.id && (
                <div className="mb-6">
                  {renderStepContent(step.id)}

                  {/* Inline navigation buttons */}
                  <div className="flex justify-end gap-3 pt-6">
                    {currentStep > 1 && (
                      <Button variant="outline" onClick={onBack}>
                        Back
                      </Button>
                    )}
                    {currentStep < steps.length ? (
                      <Button onClick={onNext} disabled={!canNext}>
                        Next
                      </Button>
                    ) : (
                      <Button
                      onClick={() => router.push("/dashboard")}
                      >
                        Send Letters
                      </Button>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default IntegratedStepper; 
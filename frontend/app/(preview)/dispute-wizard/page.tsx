"use client"

import React from "react";
import Stepper from "./components/Stepper";
import StepOne from "./components/StepOne";
import StepTwo from "./components/StepTwo";

const DisputeWizardPage = () => {
  return (
    <div className="p-6">
      {/* Title + Stepper row */}
      <div className="flex items-start justify-between mb-6">
        <h1 className="font-semibold text-[24px] leading-none text-[#111827]">
          Dispute Wizard <span className="text-[#9CA3AF] text-sm">(Michael Yaldo)</span>
        </h1>
        <Stepper current={1} />
      </div>

      {/* Step panels */}
      <div className="space-y-6">
        <StepOne />
        <StepTwo />
      </div>
    </div>
  );
};

export default DisputeWizardPage;
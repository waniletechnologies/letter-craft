"use client"

import React from "react";

interface Step {
  id: number;
  title: string;
  description?: string;
}

interface LeftStepperProps {
  steps: Step[];
  currentStep: number;
}

const LeftStepper: React.FC<LeftStepperProps> = ({ steps, currentStep }) => {
  return (
    <div className="space-y-4">
      {steps.map((step) => (
        <div key={step.id} className="flex items-center gap-3">
          <div
            className={`h-8 w-8 rounded-full flex items-center justify-center text-sm font-semibold ${
              currentStep === step.id
                ? "bg-blue-600 text-white"
                : step.id < currentStep
                ? "bg-blue-200 text-blue-700"
                : "bg-gray-200 text-gray-500"
            }`}
          >
            {step.id}
          </div>
          <div className="flex-1">
            <div className={`font-medium ${
              currentStep === step.id ? "text-gray-900" : "text-gray-500"
            }`}>
              {step.title}
            </div>
            {step.description && (
              <div className="text-sm text-gray-500">{step.description}</div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default LeftStepper; 
"use client"

import React from "react";

export interface StepperProps {
  current: number; // 0..2
  steps?: { label: string }[];
}

const defaultSteps = [
  { label: "Import/Audit" },
  { label: "Generate Letters" },
  { label: "Print/Send" },
];

const Circle: React.FC<{ active: boolean; index: number }> = ({ active, index }) => (
  <div
    className={`h-8 w-8 rounded-full flex items-center justify-center text-xs font-semibold ${
      active ? "bg-[#2196F3] text-white" : "bg-[#EDEDED] text-[#9CA3AF]"
    }`}
  >
    {index + 1}
  </div>
);

export const Stepper: React.FC<StepperProps> = ({ current, steps = defaultSteps }) => {
  const colsStyle = { gridTemplateColumns: `repeat(${steps.length}, minmax(0, 1fr))` } as React.CSSProperties;

  return (
    <div className="flex flex-col items-stretch">
      {/* Top row: circles + centered connectors */}
      <div className="flex items-center justify-center gap-10">
        {steps.map((_, i) => (
          <div key={`top-${i}`} className="flex items-center">
            <Circle active={current === i} index={i} />
            {i < steps.length - 1 && <div className="w-18 h-[2px] bg-[#E5E7EB] mx-2" />}
          </div>
        ))}
      </div>
      {/* Bottom row: labels aligned under circles */}
      <div className="mt-2 grid gap-14" style={colsStyle}>
        {steps.map((s, i) => (
          <div key={`label-${i}`} className={`text-xs text-center ${current === i ? "text-[#111827]" : "text-[#9CA3AF]"}`}>
            {s.label}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Stepper;
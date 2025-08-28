"use client"

import React from "react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useRouter } from "next/navigation";

const StepTwo: React.FC = () => {
  const router = useRouter();

  return (
    <div className="rounded-lg border border-[#E5E7EB] bg-white">
      <div className="flex items-center justify-between px-4 py-3 border-b border-[#E5E7EB] bg-[#F9FAFB] rounded-t-lg">
        <div className="text-sm"><span className="font-semibold">Step 2:</span> Choose A Letter</div>
        <div className="flex items-center gap-3">
          <button className="text-xs text-[#2563EB]" onClick={() => router.push("/dispute-wizard/generate-letter")}>Generate Unique AI Letter</button>
          <Button className="bg-primary hover:bg-primary/90">Generate Library Letter</Button>
        </div>
      </div>

      <div className="p-4 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 max-w-5xl gap-4">
          <div>
            <div className="text-xs text-[#6B7280] mb-1">Letter Category</div>
            <Select>
              <SelectTrigger className="shadow-none w-full">
                <SelectValue placeholder="Credit Bureau Letters" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="cbl">Credit Bureau Letters</SelectItem>
                <SelectItem value="creditor">Creditor Letters</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <div className="text-xs text-[#6B7280] mb-1">Letter Name</div>
            <Select>
              <SelectTrigger className="shadow-none w-full">
                <SelectValue placeholder="Identity Theft Dispute (Round 1)" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="itd1">Identity Theft Dispute (Round 1)</SelectItem>
                <SelectItem value="av1">Account Verification (Round 1)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex items-center justify-center gap-2 mt-2">
          <Checkbox id="aiOnly" />
          <label htmlFor="aiOnly" className="text-xs text-[#6B7280]">Show me AI letters only</label>
        </div>
      </div>
    </div>
  );
};

export default StepTwo;
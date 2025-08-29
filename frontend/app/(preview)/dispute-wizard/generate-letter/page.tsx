"use client"

import React, { useState } from "react";
import Stepper from "../components/Stepper";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FileText, Bold, Italic, Underline, List, AlignLeft, Sparkles } from "lucide-react";
import Image from "next/image";
import { Experian, Equifax, TransUnion } from "@/public/images";
import SaveLetterDialog, { SaveLetterData } from "./components/save-letter";

const GenerateLetterPage = () => {
  const [phase] = useState(1);
  const [isSaveDialogOpen, setIsSaveDialogOpen] = useState(false);

  const handleSaveLetter = (data: SaveLetterData) => {
    console.log("Saving letter with data:", data);
  };

  const handleSaveAndContinue = () => {
    setIsSaveDialogOpen(true);
  };

  return (
    <div className="p-6">
      {/* Title row with stepper on the right */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <FileText className="h-5 w-5 text-[#111827]" />
          <h1 className="font-semibold text-[20px] leading-none text-[#111827]">Letter Editor (Michael Yaldo)</h1>
          <div className=" px-2 py-0 text-[11px] ">Group 1</div>
        </div>
        <Stepper current={phase} />
      </div>
      <div className="border w-full rounded-lg mt-5 border-gray-200">
      {/* Logos and selects */}
      <div className="border-b border-[#E5E7EB] rounded-t-lg bg-[#F6F6F6] p-3 mb-4">
        <div className="grid grid-cols-2 md:grid-cols-6 gap-3 items-center">
          <div className="col-span-2 flex items-center gap-6 px-2">
            <Image src={Experian} alt="Experian" width={92} height={24} />
            <Image src={Equifax} alt="Equifax" width={92} height={24} />
            <Image src={TransUnion} alt="TransUnion" width={92} height={24} />
          </div>
          <div className="col-span-1">
            <div className="text-[11px] text-[#6B7280] mb-1">Client Docs</div>
          </div>
          <div className="col-span-2">
            <Select>
              <SelectTrigger className="shadow-none h-9 bg-white">
                <SelectValue placeholder="Select FTC Report" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="r1">Report #1</SelectItem>
                <SelectItem value="r2">Report #2</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="col-span-1">
            <Select>
              <SelectTrigger className="shadow-none h-9 bg-white">
                <SelectValue placeholder="Group 1" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="g1">Group 1</SelectItem>
                <SelectItem value="g2">Group 2</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Letter Envelope Information */}
      <div className="rounded-xl bg-white py-6 px-12 mb-4">
        <div className="font-medium text-xs leading-[150%] -tracking-[0.03em] capitalize text-[#292524] mb-2">Letter Envelope Information (Only For CloudMail)</div>
      <div className="border border-[#00000014] rounded-lg">
        <div className="flex flex-row justify-between px-8 py-4">
          <div className="rounded-md p-3">
            <div className="font-medium text-xs leading-[150%] -tracking-[0.03em] capitalize text-[#292524] mb-2">Send From Address:</div>
            <div className="font-semibold text-xs leading-[150%] -tracking-[0.03em] capitalize text-[#292524]">
              Michael Yaldo<br/>
              4823 Bantry Dr<br/>
              West Bloomfield, Michigan 48322
            </div>
          </div>
          <div className="rounded-md p-3">
            <div className="font-medium text-xs leading-[150%] -tracking-[0.03em] capitalize text-[#292524] mb-2">Send To Address:</div>
            <div className="font-semibold text-xs leading-[150%] -tracking-[0.03em] capitalize text-[#292524]">
              Equifax Information Services LLC<br/>
              P.O. Box 740256<br/>
              Atlanta, GA 30374
            </div>
          </div>
        </div>
      </div>
      </div>
      {/* Editor */}
      <div className="px-12">
      <div className="rounded-xl border border-[#E5E7EB] bg-white">
        <div className="flex items-center gap-2 p-2 border-b border-[#E5E7EB] text-[#6B7280]">
          <Bold className="h-4 w-4" />
          <Italic className="h-4 w-4" />
          <Underline className="h-4 w-4" />
          <List className="h-4 w-4" />
          <AlignLeft className="h-4 w-4" />
        </div>
        <div className="relative p-4">
          <div className="p-4 text-xs text-[#3A3535] min-h-[360px] rounded-md bg-white">
            Dear Equifax,
            <br />
            <br />
            This is a placeholder for the generated letter content. The real editor will appear here.
            <br />
            <br />
            Sincerely,
            <br />
            Michael Ron Yaldo
          </div>
          <Button size="sm" variant="outline" className="absolute border-primary right-4 bottom-4 flex items-center gap-2">
            Generate with AI <Sparkles className="h-4 w-4 text-primary" />
          </Button>
        </div>
      </div>
      </div>
      {/* Footer actions */}
      <div className="flex justify-end my-4 mr-12">
        <div className="flex gap-2">
          <Button variant="outline">Save For Later</Button>
          <Button 
            className="bg-primary hover:bg-primary/90"
            onClick={handleSaveAndContinue}
          >
            Save & Continue
          </Button>
        </div>
      </div>
      </div>

      {/* Save Letter Dialog */}
      <SaveLetterDialog
        isOpen={isSaveDialogOpen}
        onClose={() => setIsSaveDialogOpen(false)}
        onSave={handleSaveLetter}
      />
    </div>
  );
};

export default GenerateLetterPage;
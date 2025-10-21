"use client"

import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { useRouter } from "next/navigation";
import {toast} from "sonner";
// NOTE: Saving now happens on the final step (Confirm Options)
// import { saveLetter } from "@/lib/lettersApi";

interface PersonalInfo {
  names: Array<{
    first: string;
    middle: string;
    last: string;
    suffix?: string;
    type: string;
  }>;
  addresses: Array<{
    street: string;
    city: string;
    state: string;
    postalCode: string;
    dateReported?: string;
    dateUpdated?: string;
  }>;
  births: Array<{
    date: string;
    year: string;
    month: string;
    day: string;
  }>;
  ssns: Array<{
    number: string;
  }>;
  employers: Array<{
    name: string;
  }>;
  previousAddresses: Array<{
    street: string;
    city: string;
    state: string;
    postalCode: string;
    dateReported?: string;
    dateUpdated?: string;
  }>;
  creditScore?: string;
  creditReportDate?: string;
}

interface SaveLetterDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: SaveLetterData) => void;
  selectedFtcReports: string[]; // Change to array
  letterData: {
    category: string;
    letterName: string;
    bureau: string;
    content: string;
    personalInfo: PersonalInfo | null;
  };
  clientId: string;
  email: string | null
  scheduleAt?: string;
  accounts?: Array<{
    id?: string;
    creditor?: string;
    account?: string;
    dateOpened?: string;
    balance?: string;
    type?: string;
  }>;
  preparedLetters?: Array<{
    category: string;
    letterName: string;
    bureau: string;
    content: string;
    personalInfo: PersonalInfo | null;
    displayName: string;
    scheduleAt?: string;
  }>;
}

export interface SaveLetterData {
  round: string;
  letterName: string;
  abbreviation: string;
  followUpDays: number;
  createFollowUpTask: boolean;
}

const SaveLetterDialog: React.FC<SaveLetterDialogProps> = ({
  isOpen,
  onClose,
  onSave,
  selectedFtcReports,
  letterData,
  clientId,
  email,
  scheduleAt,
  accounts,
  preparedLetters = [],
}) => {
  const [formData, setFormData] = useState<SaveLetterData>({
    round: "2",
    letterName: "RD2",
    abbreviation: "",
    followUpDays: 14,
    createFollowUpTask: true,
  });

  const router = useRouter();
  const [isSaving, setIsSaving] = useState(false);

  // In SaveLetterDialog component, update the handleSave function

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // Debug logging
      console.log("Save letter data:", {
        clientId,
        letterData,
        selectedFtcReports,
        formData,
        email,
      });

      // Validate required fields before sending
      if (!clientId) {
        console.log(
          "No client found - saving letter without client association"
        );
        // Continue without client - this is allowed for letters without client association
      }

      if (!letterData.content || letterData.content.trim() === "") {
        toast.error("Letter content is missing. Please generate the letter first.");
        return;
      }

      if (!letterData.category || !letterData.bureau) {
        toast.error("Letter category or bureau information is missing.");
        return;
      }

      // Decode the email if it's URL encoded
      let decodedEmail = email;
      if (decodedEmail) {
        try {
          decodedEmail = decodeURIComponent(decodedEmail);
          // Handle potential double encoding
          if (decodedEmail.includes("%25")) {
            decodedEmail = decodeURIComponent(decodedEmail);
          }
        } catch (error) {
          console.log("Error decoding email:", error);
          // If decoding fails, use the original email
        }
      }

      // Persist locally only; actual save happens in final step
      const savedLetterData = {
        ...formData,
        letterDetails: letterData,
        selectedFtcReports,
        clientId,
        email: decodedEmail,
        scheduleAt,
        accounts,
        // include prepared letters for the next page to show all copies
        preparedLetters,
        savedLetterId: undefined,
        savedAt: new Date().toISOString(),
      };

      localStorage.setItem("savedLetterData", JSON.stringify(savedLetterData));

      onSave(formData);
      onClose();
      setIsSaving(false);
      router.push("/dispute-wizard/send-letters");
    } catch (error) {
      console.error("Error saving letter:", error);
      toast.error("An error occurred while saving the letter. Please try again.");
      setIsSaving(false);
    }
  };

  const handleInputChange = (
    field: keyof SaveLetterData,
    value: string | number | boolean
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open) { setIsSaving(false); onClose(); } }}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader className="text-left">
          <DialogTitle className="text-lg font-semibold">
            Save Letter
          </DialogTitle>
        </DialogHeader>
        <hr className="border-gray-200" />

        <div className="space-y-4">
          <div className=" grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Round */}
            <div className="space-y-2">
              <Label
                htmlFor="round"
                className="font-medium text-sm leading-[20px] tracking-normal text-[#0A090B] "
              >
                Round
              </Label>
              <Select
                value={formData.round}
                onValueChange={(value) => handleInputChange("round", value)}
              >
                <SelectTrigger className="w-full shadow-none">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1</SelectItem>
                  <SelectItem value="2">2</SelectItem>
                  <SelectItem value="3">3</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Letter Name */}
            <div className="space-y-2 sm:col-span-2 col-span-1">
              <Label
                htmlFor="letterName"
                className="font-medium text-sm leading-[20px] tracking-normal text-[#0A090B] "
              >
                Name of this letter
              </Label>
              <Input
                id="letterName"
                value={formData.letterName}
                onChange={(e) =>
                  handleInputChange("letterName", e.target.value)
                }
                placeholder="Enter letter name"
                className="shadow-none"
              />
            </div>
          </div>
          <p className="font-normal text-sm leading-[24px] tracking-normal text-[#71717A]">
            *The bureau or furnisher name will be auto added to what you type
            above
          </p>
          {/* Abbreviation */}
          <div className="space-y-2">
            <Label
              htmlFor="abbreviation"
              className="font-medium text-sm leading-[20px] tracking-normal text-[#0A090B] "
            >
              Abbreviation (Optional)
            </Label>
            <div className="flex gap-2">
              <Select
                value={formData.abbreviation}
                onValueChange={(value) =>
                  handleInputChange("abbreviation", value)
                }
              >
                <SelectTrigger className="w-full shadow-none">
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="RD1">RD1</SelectItem>
                  <SelectItem value="RD2">RD2</SelectItem>
                  <SelectItem value="RD3">RD3</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          {/* <div className="flex flex-col sm:flex-row justify-between gap-2">
            <Button type="button" size="sm" className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Add Abbreviation to Master List
            </Button>
          </div> */}

          {/* Follow-up Task */}
          <div className="space-y-2 flex flex-col sm:flex-row justify-between items-center">
            <div className="flex items-center gap-2">
              <Checkbox
                id="followUpTask"
                checked={formData.createFollowUpTask}
                onCheckedChange={(checked) =>
                  handleInputChange("createFollowUpTask", checked as boolean)
                }
              />
              <Label
                htmlFor="followUpTask"
                className="font-medium text-sm leading-[20px] tracking-normal text-[#71717A] "
              >
                Create task to follow-up on these disputed items in
              </Label>
            </div>
            <div className="flex items-center ml-auto sm:ml-0 gap-2">
              <Input
                type="number"
                value={formData.followUpDays}
                onChange={(e) =>
                  handleInputChange(
                    "followUpDays",
                    parseInt(e.target.value) || 0
                  )
                }
                className="w-24 shadow-none"
                min="1"
                max="365"
              />
              <span className="font-medium text-sm leading-[20px] tracking-normal text-[#71717A] ">
                Days
              </span>
            </div>
          </div>

          {/* Save Note */}
          <p className="font-medium text-[13px] leading-[20px] tracking-normal text-[#71717A]">
            <span className="font-bold text-[#0A090B]">Note:</span> Only save
            once. This button saves all the letters for all bureau tabs with 1
            click.
          </p>
          {/* Save Button */}
          <div className="flex sm:justify-end justify-center w-full sm:w-auto pt-2">
            <Button onClick={handleSave} disabled={isSaving}>{isSaving ? "Saving..." : "Save & Continue"}</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SaveLetterDialog;

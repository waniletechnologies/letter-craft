"use client"

import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Plus } from "lucide-react";
import { useRouter } from "next/navigation";

interface SaveLetterDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: SaveLetterData) => void;
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
}) => {
  const [formData, setFormData] = useState<SaveLetterData>({
    round: "2",
    letterName: "RD2",
    abbreviation: "",
    followUpDays: 2,
    createFollowUpTask: true,
  });

  const router = useRouter();

  const handleSave = () => {
    onSave(formData);
    onClose();

    router.push("/dispute-wizard/send-letters");

  };

  const handleInputChange = (field: keyof SaveLetterData, value: string | number | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader className="flex justify-between">
          <DialogTitle className="text-lg font-semibold">Save Letter</DialogTitle>
        </DialogHeader>
        <hr className="border-gray-200" />

        <div className="space-y-4">
        <div className=" grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Round */}
          <div className="space-y-2">
            <Label htmlFor="round" className="font-medium text-sm leading-[20px] tracking-normal text-[#0A090B] ">Round</Label>
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
          <div className="space-y-2 col-span-2">
            <Label htmlFor="letterName" className="font-medium text-sm leading-[20px] tracking-normal text-[#0A090B] ">Name of this letter</Label>
            <Input
              id="letterName"
              value={formData.letterName}
              onChange={(e) => handleInputChange("letterName", e.target.value)}
              placeholder="Enter letter name"
              className="shadow-none"
            />
          </div>
        </div>
            <p className="font-normal text-sm leading-[24px] tracking-normal text-[#71717A]">
              *The bureau or furnisher name will be auto added to what you type above
            </p>
          {/* Abbreviation */}
          <div className="space-y-2">
            <Label htmlFor="abbreviation" className="font-medium text-sm leading-[20px] tracking-normal text-[#0A090B] ">Abbreviation (Optional)</Label>
            <div className="flex gap-2">
              <Select
                value={formData.abbreviation}
                onValueChange={(value) => handleInputChange("abbreviation", value)}
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
          <div className="flex justify-between">
              <Button
                type="button"
                size="sm"
                className="flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                Add Abbreviation to Master List
              </Button>
              <Button
                type="button"
                variant="link"
                size="sm"
                className="font-medium text-sm leading-[20px] tracking-normal text-[#A6A6A9] hover:text-primary p-0 h-auto"
              >
                Manage Setting
              </Button>
            </div>

          {/* Follow-up Task */}
          <div className="space-y-2 flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Checkbox
                id="followUpTask"
                checked={formData.createFollowUpTask}
                onCheckedChange={(checked) => 
                  handleInputChange("createFollowUpTask", checked as boolean)
                }
              />
              <Label htmlFor="followUpTask" className="font-medium text-sm leading-[20px] tracking-normal text-[#71717A] ">
                Create task to follow-up on these disputed items in
              </Label>
            </div>
            <div className="flex items-center gap-2">
              <Input
                type="number"
                value={formData.followUpDays}
                onChange={(e) => handleInputChange("followUpDays", parseInt(e.target.value) || 0)}
                className="w-24 shadow-none"
                min="1"
                max="365"
              />
              <span className="font-medium text-sm leading-[20px] tracking-normal text-[#71717A] ">Days</span>
            </div>
          </div>

          {/* Save Note */}
            <p className="font-medium text-[13px] leading-[20px] tracking-normal text-[#71717A]">
             <span className="font-bold text-[#0A090B]">Note:</span> Only save once. This button saves all letters for all bureau tabs with 1 click.
            </p>
          {/* Save Button */}
          <div className="flex justify-end pt-2">
            <Button
              onClick={handleSave}
            >
              Save All 3 Letters
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SaveLetterDialog;

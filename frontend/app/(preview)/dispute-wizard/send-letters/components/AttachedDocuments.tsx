"use client"

import React from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Check } from "lucide-react";
import Image from "next/image";

export interface DocumentItem {
  name: string;
  type: string;
  image: string;
}

interface AttachedDocumentsProps {
  includeIdAttachments: boolean;
  idAttachmentScope: string;
  includeReturnAddress: boolean;
  documents: DocumentItem[];
  onIncludeIdAttachmentsChange: (checked: boolean) => void;
  onIdAttachmentScopeChange: (scope: string) => void;
  onIncludeReturnAddressChange: (checked: boolean) => void;
}

const AttachedDocuments: React.FC<AttachedDocumentsProps> = ({
  includeIdAttachments,
  idAttachmentScope,
  includeReturnAddress,
  documents,
  onIncludeIdAttachmentsChange,
  onIdAttachmentScopeChange,
  onIncludeReturnAddressChange,
}) => {
  return (
    <div className="space-y-4">
      <div className="font-medium text-[15px] leading-[32px] -tracking-[0.04em] text-[#71717A] ">
        Where do you want to include ID attachments? (Typically only needed for Round 1).
      </div>
      
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-3">
          <Checkbox
            id="includeIdAttachments"
            checked={includeIdAttachments}
            onCheckedChange={(checked) => onIncludeIdAttachmentsChange(checked === true)}
          />
          <Label htmlFor="includeIdAttachments" className="text-sm font-medium">
            Include ID attachments on:
          </Label>
        </div>
        
        {includeIdAttachments && (
          <div className="ml-6 flex gap-2">
            <div className="flex items-center space-x-2">
              <input
                type="radio"
                id="round1"
                name="idAttachmentScope"
                value="round1"
                checked={idAttachmentScope === "round1"}
                onChange={(e) => onIdAttachmentScopeChange(e.target.value)}
                className="h-4 w-4 text-primary bg-white border-primary focus:ring-primary"
              />
              <Label htmlFor="round1" className="text-sm">All round 1 letters (Recommended)</Label>
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="radio"
                id="all"
                name="idAttachmentScope"
                value="all"
                checked={idAttachmentScope === "all"}
                onChange={(e) => onIdAttachmentScopeChange(e.target.value)}
                className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
              />
              <Label htmlFor="all" className="text-sm">All letters (Not Recommended)</Label>
            </div>
          </div>
        )}
        
        <div className="flex items-center gap-3">
          <Checkbox
            id="includeReturnAddress"
            checked={includeReturnAddress}
            onCheckedChange={(checked) => onIncludeReturnAddressChange(checked === true)}
          />
          <Label htmlFor="includeReturnAddress" className="text-sm font-medium">
            Include return address on envelope (Recommended)
          </Label>
        </div>
      </div>
      
      <div className="space-y-3">
        <h4 className="font-medium text-gray-900">Documents</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {documents.map((doc, index) => (
          <div key={index} className="flex items-center gap-3 p-3 border border-[#EFEFEF] rounded-lg">
            <div className="flex items-center justify-center h-5 w-5 rounded-full bg-[#00A650] gap-2">
              <Check className="h-4 w-4 text-white" />
            </div>
              <Image src={doc.image} alt={doc.name} width={36} height={36} />
              <div className="flex flex-col gap-1">
            <span className="font-semibold text-xs leading-sm tracking-md text-[#1C1C1C]">{doc.name}</span>
            <span className="font-normal text-xs leading-sm tracking-md text-[#1C1C1C] uppercase ">Document Found</span>
            </div>
            <Button variant="link" size="sm" className="text-primary p-0 h-auto ml-auto font-medium text-xs leading-[18.02px] tracking-normal">
              View / Edit
            </Button>
          </div>
        ))}
        </div>
      </div>
    </div>
  );
};

export default AttachedDocuments; 
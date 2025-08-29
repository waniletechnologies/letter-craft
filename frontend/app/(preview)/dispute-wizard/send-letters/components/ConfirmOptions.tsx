"use client"

import React from "react";

interface ConfirmOptionsProps {
  selectedLetters: string[];
  mailMethod: string;
  includeIdAttachments: boolean;
  idAttachmentScope: string;
  includeReturnAddress: boolean;
}

const ConfirmOptions: React.FC<ConfirmOptionsProps> = ({
  selectedLetters,
  mailMethod,
  includeIdAttachments,
  idAttachmentScope,
  includeReturnAddress,
}) => {
  return (
    <div className="space-y-4">
      <div className="text-sm text-gray-600 leading-6">
        Review your letter sending configuration before proceeding.
      </div>
      
      <div className="space-y-4">
        <div className="border rounded-lg p-4 bg-gray-50">
          <h4 className="font-medium text-gray-900 mb-3">Summary</h4>
          <div className="space-y-2 text-sm text-gray-600">
            <div>• {selectedLetters.length} letters selected for sending</div>
            <div>• Mail method: {mailMethod === 'certified' ? 'Certified Mail via CloudMail' : 'Print and mail locally'}</div>
            <div>• ID attachments: {includeIdAttachments ? `Included on ${idAttachmentScope === 'round1' ? 'round 1 letters' : 'all letters'}` : 'Not included'}</div>
            <div>• Return address: {includeReturnAddress ? 'Included' : 'Not included'}</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfirmOptions; 
"use client"

import React from "react";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";
import Image from "next/image";
import { CloudMail } from "@/public/images";

interface PrintMailMethodsProps {
  mailMethod: string;
  onMailMethodChange: (method: string) => void;
}

const PrintMailMethods: React.FC<PrintMailMethodsProps> = ({
  mailMethod,
  onMailMethodChange,
}) => {
  return (
    <div className="space-y-4">
      <div className="font-medium text-[15px] leading-[32px] -tracking-[0.04em] text-[#71717A]">
        Select an automated delivery method or choose to print at home.
      </div>
      
      <div className="flex gap-4">
        <div className={`border max-w-[320px] w-full rounded-lg border-[#00000026]`}>
          <div className={`h-7 w-full rounded-t-lg ${mailMethod === 'certified' ? 'bg-[#90CBF9]' : 'bg-[#F5F5F5]'}`}  />
          <div className="flex items-start gap-3 p-4">
            <input
              type="radio"
              id="certified"
              name="mailMethod"
              value="certified"
              checked={mailMethod === 'certified'}
              onChange={(e) => onMailMethodChange(e.target.value)}
              className="h-4 w-4 border-gray-300 focus:ring-blue-500 mt-1"
            />
            <div className="flex-1 text-center">
              <div className="font-semibold text-[16px] leading-[20px] tracking-normal text-[#292524] mb-2">Certified Mail</div>
              <div className="font-semibold text-xs leading-[20px] -tracking-[0.03em] text-[#71717A] mb-3">Est. Delivery Date</div>
              <div className="font-semibold text-[20px] leading-[20px] tracking-normal text-[#534D4C] mb-3">May. 27 - May. 29</div>
              <div className="space-y-1 flex flex-col justify-center mb-3">
                <div className="flex items-center gap-2 font-medium text-[12px] leading-[20px] tracking-normal text-[#292524]">
                  <Check className="h-4 w-4 text-[#00A650]" />
                  No visit to the post office
                </div>
                <div className="flex items-center gap-2 font-medium text-[12px] leading-[20px] tracking-normal text-[#292524]">
                  <Check className="h-4 w-4 text-[#00A650]" />
                  Less than one week delivery
                </div>
                <div className="flex items-center gap-2 font-medium text-[12px] leading-[20px] tracking-normal text-[#292524]">
                  <Check className="h-4 w-4 text-[#00A650]" />
                  Tracking Provided by USPS
                </div>
                <div className="flex items-center gap-2 font-medium text-[12px] leading-[20px] tracking-normal text-[#292524]">
                  <Check className="h-4 w-4 text-[#00A650]" />
                  Proof of delivery
                </div>
              </div>
              <div className="font-semibold text-[20px] leading-[20px] tracking-normal text-center text-[#534D4C] mb-2">Starting at $6.64</div>
              <div className="font-medium text-xs leading-[20px] tracking-normal text-[#71717A] mb-2">+ additional pages $0.12</div>
            </div>
          </div>
              <div className="flex items-center justify-between px-2 pb-4">
                <div className="flex items-center gap-2">
                  <Image src={CloudMail} alt="CloudMail" width={72} height={19} />
                </div>
                <Button variant="link" size="sm" className="font-medium text-xs leading-[20px] -tracking-[0.04em] text-[#71717A] p-0 h-auto">
                  Set as default
                </Button>
              </div>
        </div>
        
        <div className="border max-w-[320px] w-full rounded-lg border-[#00000026]">
          <div className={`h-7 w-full rounded-t-lg ${mailMethod === 'local' ? 'bg-[#90CBF9]' : 'bg-[#F5F5F5]'}`}  />
          <div className="flex items-start gap-3 p-4">
            <input
              type="radio"
              id="local"
              name="mailMethod"
              value="local"
              checked={mailMethod === 'local'}
              onChange={(e) => onMailMethodChange(e.target.value)}
              className="h-4 w-4 border-gray-300 focus:ring-blue-500 mt-1"
            />
            <div className="flex-1 text-center">
              <div className="font-semibold text-[16px] leading-[20px] tracking-normal text-[#292524]">Print Mail Locally</div>
            </div>
          </div>
          <div className="flex items-center justify-center mt-20 px-4">
              <div className="font-semibold text-center text-xs leading-[20px] -tracking-[0.03em] text-[#71717A]">Print at home or office and mail your letters from your local USPS.</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrintMailMethods; 
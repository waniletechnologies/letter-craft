"use client"

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { Equifax, Experian, TransUnion } from "@/public/images";
import AddDisputeItemsDialog from "./AddDisputeItemsDialog";

const StepOne: React.FC = () => {
  const [dialogOpen, setDialogOpen] = useState(false);

  return (
    <div className="rounded-lg border border-[#E5E7EB] bg-white">
      <div className="flex items-center justify-between px-4 py-3 border-b border-[#E5E7EB] bg-[#F9FAFB] rounded-t-lg">
        <div className="text-sm"><span className="font-semibold">Step 1:</span> Add Dispute Items</div>
        <div className="flex items-center gap-3">
          <button className="text-xs text-[#2563EB]" onClick={() => setDialogOpen(true)}>+ Add Dispute Item</button>
          <Button className="bg-primary hover:bg-primary/90">Saved Dispute Item</Button>
        </div>
      </div>

      <div className="p-4">
        <div className="rounded-md border border-[#E5E7EB] overflow-hidden">
          <div className="grid grid-cols-5 items-center bg-[#F9FAFB] text-xs text-[#6B7280] p-3">
            <div className="col-span-2">Account #</div>
            <div className="col-span-2">Dispute Items</div>
            <div className="flex items-center justify-end gap-4 pr-2">
              <Image src={Experian} alt="Experian" width={74} height={20} />
              <Image src={Equifax} alt="Equifax" width={74} height={20} />
              <Image src={TransUnion} alt="TransUnion" width={74} height={20} />
            </div>
          </div>
          <div className="p-6 text-center text-xs text-[#9CA3AF]">No Dispute Items Added</div>
        </div>

        <div className="flex justify-end mt-4">
          <Button className="bg-[#2196F3] hover:bg-[#1976D2]">Save & Continue</Button>
        </div>
      </div>

      <AddDisputeItemsDialog open={dialogOpen} onOpenChange={setDialogOpen} />
    </div>
  );
};

export default StepOne;
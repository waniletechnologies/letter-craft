"use client"

import React, { useState } from "react";
import DisputeCard from "./components/dispute-card";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { Upload } from "@/public/images";
import DownloadLetter, { LetterFormat } from "./components/download-letter";
import EditDispute, { EditDisputePayload } from "./components/edit-dispute";
import ViewDisputeDetails, { DisputedItem } from "./components/view-dispute-details";
import { Plus } from "lucide-react";

type Bureau = "Experian" | "Equifax" | "TransUnion";
type DisputeStatus = "in-progress" | "completed" | "pending" | "failed";

interface DisputeRecord {
  id: string;
  clientName: string;
  round: number;
  status: DisputeStatus;
  progress: number;
  bureau: Bureau;
  accountsCount: number;
  createdDate: string;
  expectedResponseDate: string;
}

// Sample dispute data
const sampleDisputes: DisputeRecord[] = [
  {
    id: "1",
    clientName: "John Smith",
    round: 1,
    status: "in-progress",
    progress: 60,
    bureau: "Equifax",
    accountsCount: 3,
    createdDate: "2024-06-01",
    expectedResponseDate: "2024-07-01",
  },
  {
    id: "2",
    clientName: "Sarah Johnson",
    round: 2,
    status: "completed",
    progress: 100,
    bureau: "Equifax",
    accountsCount: 3,
    createdDate: "2024-05-15",
    expectedResponseDate: "2024-06-15",
  },
  {
    id: "3",
    clientName: "Lisa Wilson",
    round: 1,
    status: "pending",
    progress: 25,
    bureau: "TransUnion",
    accountsCount: 5,
    createdDate: "2024-06-10",
    expectedResponseDate: "2024-07-10",
  },
  {
    id: "4",
    clientName: "Michael Brown",
    round: 3,
    status: "failed",
    progress: 0,
    bureau: "Experian",
    accountsCount: 2,
    createdDate: "2024-05-20",
    expectedResponseDate: "2024-06-20",
  },
];

const mockItems: DisputedItem[] = [
  { id: "i1", title: "ABC Credit Card", account: "****1234", status: "Pending" },
  { id: "i2", title: "XYZ Auto Loan", account: "****5678", status: "In Review" },
  { id: "i3", title: "Department Store Card", account: "****9012", status: "Resolved" },
];

const DisputesPage = () => {
  const [downloadOpen, setDownloadOpen] = useState(false);
  const [selectedDispute, setSelectedDispute] = useState<{
    clientName: string;
    bureau: Bureau;
    round: number;
  } | null>(null);

  const [editOpen, setEditOpen] = useState(false);
  const [editInitial, setEditInitial] = useState<EditDisputePayload | null>(null);

  const [viewOpen, setViewOpen] = useState(false);
  const [viewState, setViewState] = useState<{
    clientName: string;
    bureau: Bureau;
    round: number;
    status: DisputeStatus;
    progress: number;
    createdDate: string;
    expectedResponseDate: string;
    accountsCount: number;
  } | null>(null);

  const handleViewDetails = (id: string) => {
    const d = sampleDisputes.find((x) => x.id === id);
    if (!d) return;
    setViewState({
      clientName: d.clientName,
      bureau: d.bureau,
      round: d.round,
      status: d.status,
      progress: d.progress,
      createdDate: d.createdDate,
      expectedResponseDate: d.expectedResponseDate,
      accountsCount: d.accountsCount,
    });
    setViewOpen(true);
  };

  const handleEditDispute = (id: string) => {
    const d = sampleDisputes.find((x) => x.id === id);
    if (!d) return;
    setEditInitial({
      clientName: d.clientName,
      bureau: d.bureau,
      round: d.round,
      status: d.status,
      notes: "",
    });
    setEditOpen(true);
  };

  const handleSaveEdit = (payload: EditDisputePayload) => {
    console.log("Save dispute", payload);
  };

  const handleDownloadLetters = (id: string) => {
    const d = sampleDisputes.find((x) => x.id === id);
    if (!d) return;
    setSelectedDispute({ clientName: d.clientName, bureau: d.bureau, round: d.round });
    setDownloadOpen(true);
  };

  const handleConfirmDownload = (payload: { format: LetterFormat; letters: string[] }) => {
    console.log("Downloading", payload);
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="font-semibold text-[32px] leading-[100%] -tracking-[0.07em] text-[#3D3D3D] mb-2">Disputes</h1>
        <div className="flex items-center justify-between gap-2"> 
          <p className="text-[#606060] font-medium text-base leading-[100%] -tracking-[0.07em]">
            Manage and track credit dispute progress across all credit bureaus
          </p>
          <Button>
            <Plus className="h-4 w-4" />
            Add New Dispute
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {sampleDisputes.map((dispute) => (
          <DisputeCard
            key={dispute.id}
            {...dispute}
            onViewDetails={() => handleViewDetails(dispute.id)}
            onEditDispute={() => handleEditDispute(dispute.id)}
            onDownloadLetters={() => handleDownloadLetters(dispute.id)}
          />
        ))}
      </div>

      {/* Dispute Wizard Section */}
      <div className="mt-12 bg-white rounded-lg p-6">
        <div className="mb-6">
          <h2 className="font-medium text-[24px] leading-none -tracking-[0.07em] text-[#3D3D3D] mb-2">Dispute Wizard</h2>
        <p className="text-[#606060] font-medium text-sm leading-[100%] -tracking-[0.07em]">
            Start a new dispute round for your clients with our step-by-step wizard.
          </p>
        </div>

        <div className="border-2 border-dashed border-[#E5E7EB] rounded-lg bg-[#F9FAFB] p-8 text-center">
          <div className="max-w-md mx-auto">
            {/* Icon */}
            <div className="mb-6 flex items-center justify-center">
                <Image src={Upload} alt="Upload" width={51} height={44} />
            </div>

            {/* Call to Action */}
            <h3 className="font-semibold text-[20px] leading-[100%] tracking-normal text-center text-[#000000] mb-3">
              Create New Dispute
            </h3>
            
            {/* Description */}
            <p className="text-[#606060] font-medium text-sm leading-[100%] -tracking-[0.07em] mb-8">
              Select a client and disputed items to generate customized dispute letters.
            </p>

            {/* Action Button */}
            <Button 
              className=""
              onClick={() => console.log("Launch Dispute Wizard clicked")}
            >
              Launch Dispute Wizard
            </Button>
          </div>
        </div>
      </div>

      {/* Download Letters Dialog */}
      {selectedDispute && (
        <DownloadLetter
          open={downloadOpen}
          onOpenChange={setDownloadOpen}
          clientName={selectedDispute.clientName}
          bureau={selectedDispute.bureau}
          round={selectedDispute.round}
          onDownload={handleConfirmDownload}
        />
      )}

      {/* Edit Dispute Dialog */}
      {editInitial && (
        <EditDispute
          open={editOpen}
          onOpenChange={setEditOpen}
          title={`Edit Dispute`}
          initial={editInitial}
          onSave={handleSaveEdit}
        />
      )}

      {/* View Dispute Details */}
      {viewState && (
        <ViewDisputeDetails
          open={viewOpen}
          onOpenChange={setViewOpen}
          clientName={viewState.clientName}
          bureau={viewState.bureau}
          round={viewState.round}
          status={viewState.status}
          progress={viewState.progress}
          createdDate={viewState.createdDate}
          expectedResponseDate={viewState.expectedResponseDate}
          accountsCount={viewState.accountsCount}
          items={mockItems}
        />
      )}
    </div>
  );
};

export default DisputesPage;
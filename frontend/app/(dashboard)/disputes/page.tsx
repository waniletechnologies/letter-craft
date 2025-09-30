"use client";

import React, { useEffect, useState } from "react";
import DisputeCard from "./components/dispute-card";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { CloudUpload } from "@/public/images";
import DownloadLetter from "./components/download-letter";
import EditDispute, { EditDisputePayload } from "./components/edit-dispute";
import ViewDisputeDetails, {
  DisputedItem,
} from "./components/view-dispute-details";
import { Plus } from "lucide-react";
import { fetchDisputes, updateDispute } from "@/lib/disputeAPI";
import ImportCreditReport from "../credit-reports/components/import-credit-report";
import Loader from "@/components/Loader";
import { toast } from "@/lib/import";

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
  items: DisputedItem[];
}

const DisputesPage = () => {
  const [disputes, setDisputes] = useState<DisputeRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [importDialogOpen, setImportDialogOpen] = useState(false);
  const router = useRouter();

  const [downloadOpen, setDownloadOpen] = useState(false);
  const [selectedDispute, setSelectedDispute] = useState<{
    clientName: string;
    bureau: Bureau;
    round: number;
  } | null>(null);

  const [editOpen, setEditOpen] = useState(false);
  const [editInitial, setEditInitial] = useState<EditDisputePayload | null>(
    null
  );

  const [viewOpen, setViewOpen] = useState(false);
  const [viewState, setViewState] = useState<DisputeRecord | null>(null);

  // 🔗 Fetch data on mount using the reusable API
  useEffect(() => {
    const loadDisputes = async () => {
      try {
        const rawData = await fetchDisputes();
        const formatted = rawData.map((d) => ({
          id: d._id,
          clientName: d.clientName,
          round: d.round,
          status: d.status as DisputeStatus,
          progress: d.progress,
          bureau: d.bureau as Bureau,
          accountsCount: d.accountsCount,
          createdDate: new Date(d.createdDate).toLocaleDateString(),
          expectedResponseDate: new Date(
            d.expectedResponseDate
          ).toLocaleDateString(),
          items: d.items.map((item) => ({
            id: item._id,
            title: item.title,
            account: item.account,
            status: item.status as DisputedItem["status"],
          })),
        }));
        setDisputes(formatted);
      } catch (err) {
        console.error("Failed to fetch disputes:", err);
      } finally {
        setLoading(false);
      }
    };

    loadDisputes();
  }, []);

  const handleViewDetails = (id: string) => {
    const d = disputes.find((x) => x.id === id);
    if (d) {
      setViewState(d);
      setViewOpen(true);
    }
  };

  const handleEditDispute = (id: string) => {
    const d = disputes.find((x) => x.id === id);
    if (d) {
      setEditInitial({
        clientName: d.clientName,
        bureau: d.bureau,
        round: d.round,
        status: d.status,
        notes: "",
      });
      setEditOpen(true);
    }
  };

  const handleSaveEdit = async (payload: EditDisputePayload) => {
    const id = disputes.find((d) => d.clientName === payload.clientName)?.id;
    if (!id) return;

    const res = await updateDispute(id, payload);
    if (res.success) {
      // Map status → progress
      const getProgressForStatus = (status: DisputeStatus) => {
        switch (status) {
          case "in-progress":
            return 50;
          case "completed":
            return 100;
          case "failed":
            return 0;
          default:
            return 0;
        }
      };

      setDisputes((prev) =>
        prev.map((d) =>
          d.id === id
            ? {
                ...d,
                ...payload,
                progress: getProgressForStatus(payload.status), // 👈 update progress
              }
            : d
        )
      );
    } else {
      toast.error(`Failed to update dispute: ${res.message}`);
    }
  };

  const handleDownloadLetters = (id: string) => {
    const d = disputes.find((x) => x.id === id);
    if (d) {
      setSelectedDispute({
        clientName: d.clientName,
        bureau: d.bureau,
        round: d.round,
      });
      setDownloadOpen(true);
    }
  };

  if (loading) {
    return <Loader />;
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="font-semibold text-[32px] text-[#3D3D3D] mb-2">
          Disputes
        </h1>
        <div className="flex items-center justify-between gap-2">
          <p className="text-[#606060] font-medium text-base">
            Manage and track credit dispute progress across all credit bureaus
          </p>
          <Button onClick={() => setImportDialogOpen(true)}>
            <Plus className="h-4 w-4" />
            Add New Dispute
          </Button>
        </div>
      </div>

      {/* Cards */}
      <div className="grid grid-cols-1 gap-6">
        {disputes.map((d) => (
          <DisputeCard
            key={d.id}
            {...d}
            onViewDetails={() => handleViewDetails(d.id)}
            onEditDispute={() => handleEditDispute(d.id)}
            onDownloadLetters={() => handleDownloadLetters(d.id)}
          />
        ))}
      </div>

      {/* Wizard Section */}
      <div className="mt-12 bg-white rounded-lg p-6">
        <h2 className="font-medium text-[24px] text-[#3D3D3D] mb-2">
          Dispute Wizard
        </h2>
        <p className="text-[#606060] font-medium text-sm mb-6">
          Start a new dispute round for your clients with our step-by-step
          wizard.
        </p>
        <div className="border-2 border-dashed border-[#E5E7EB] rounded-lg bg-[#F9FAFB] p-8 text-center">
          <Image
            src={CloudUpload}
            alt="Upload"
            width={51}
            height={44}
            className="mx-auto mb-6"
          />
          <h3 className="font-semibold text-[20px] mb-3">Create New Dispute</h3>
          <p className="text-[#606060] font-medium text-sm mb-8">
            Select a client and disputed items to generate customized dispute
            letters.
          </p>
          <Button onClick={() => console.log("Launch Dispute Wizard clicked")}>
            Launch Dispute Wizard
          </Button>
        </div>
      </div>

      {/* Dialogs */}
      {selectedDispute && (
        <DownloadLetter
          open={downloadOpen}
          onOpenChange={setDownloadOpen}
          clientName={selectedDispute.clientName}
          bureau={selectedDispute.bureau}
          round={selectedDispute.round}
          onDownload={(payload) => console.log("Downloading", payload)}
        />
      )}

      {editInitial && (
        <EditDispute
          open={editOpen}
          onOpenChange={setEditOpen}
          title="Edit Dispute"
          initial={editInitial}
          onSave={handleSaveEdit}
        />
      )}

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
          items={viewState.items}
        />
      )}

      <ImportCreditReport
        open={importDialogOpen}
        onOpenChange={setImportDialogOpen}
        onStartImport={({ email }) => {
          setImportDialogOpen(false);
          // ✅ Optionally navigate to the preview page after import
          router.push(`/preview-credit-report/${encodeURIComponent(email)}`);
        }}
      />
    </div>
  );
};

export default DisputesPage;

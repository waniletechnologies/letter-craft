"use client";

import { Minus, EllipsisIcon, PencilIcon, Trash2Icon } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Client } from "../page";
import { useState, } from "react";
import { useDeleteClient, useUpdateClientStatus } from "@/hooks/clients";
import { toast } from "sonner";

interface Props {
  clients: Client[];
  onEdit: (client: Client) => void;
  isLoading?: boolean;
}

export function ClientsTable({
  clients,
  onEdit,
  isLoading = false,
}: Readonly<Props>) {
  const [popupType, setPopupType] = useState<"delete" | "inactive" | null>(
    null
  );
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);

  const openPopup = (type: "delete" | "inactive", client: Client) => {
    setSelectedClient(client);
    setPopupType(type);
  };

  const closePopup = () => {
    setPopupType(null);
    setSelectedClient(null);
  };

  const deleteMutation = useDeleteClient(selectedClient?._id || "");
  const statusMutation = useUpdateClientStatus(selectedClient?._id || "");

  const confirmAction = async () => {
    if (!selectedClient) return;
    if (popupType === "delete") {
      try {
        await deleteMutation.mutateAsync();
        toast.success("Client deleted successfully");
      } catch (e) {
        console.error(e);
        toast.error("Failed to delete client");
      }
      // show success popup after delete
      setShowSuccessPopup(true);
      setTimeout(() => setShowSuccessPopup(false), 2000); // auto close after 2s
    } else if (popupType === "inactive") {
      try {
        const next = selectedClient.status === "active" ? "inactive" : "active";
        await statusMutation.mutateAsync(next);
        toast.success(`Client marked as ${next}`);
      } catch (e) {
        console.error(e);
        toast.error("Failed to update status");
      }
    }
    closePopup();
  };

  const renderSkeletonRows = (count: number) => {
    return Array.from({ length: count }).map((_, i) => (
      <TableRow key={`skeleton-${i}`} className="text-[#595858] text-[12px]">
        <TableCell className="font-medium px-4 py-4">
          <div className="h-4 w-40 bg-gray-200 rounded animate-pulse" />
        </TableCell>
        <TableCell className="py-4">
          <div className="h-4 w-32 bg-gray-200 rounded animate-pulse" />
        </TableCell>
        <TableCell className="py-4">
          <div className="h-4 w-28 bg-gray-200 rounded animate-pulse" />
        </TableCell>
        <TableCell className="py-4">
          <div className="h-4 w-40 bg-gray-200 rounded animate-pulse" />
        </TableCell>
        <TableCell className="py-4">
          <div className="h-4 w-16 bg-gray-200 rounded animate-pulse" />
        </TableCell>
        <TableCell className="py-4 text-center">
          <div className="h-6 w-6 bg-gray-200 rounded-full mx-auto animate-pulse" />
        </TableCell>
      </TableRow>
    ));
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 relative">
        <Table className="text-center">
          <TableHeader>
            <TableRow className="bg-[#F6F6F6] text-[#292524] text-[12px]">
              <TableHead className="text-center">Client Name</TableHead>
              <TableHead className="text-center">Created At</TableHead>
              <TableHead className="text-center">Start Date</TableHead>
              <TableHead className="text-center">Phone</TableHead>
              <TableHead className="text-center">Status</TableHead>
              <TableHead className="text-center">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>{renderSkeletonRows(6)}</TableBody>
        </Table>
      </div>
    );
  }

  if (!clients || clients.length === 0) {
    return (
      <div className="bg-white rounded-lg relative py-16">
        <div className="flex flex-col items-center justify-center">
          <div className="text-6xl mb-4">🗂️</div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No Clients Found</h3>
          <p className="text-gray-500 mb-2">Start by adding your first client to the system.</p>
          <p className="text-sm text-gray-400">Click the &quot;Add New Client&quot; button above to get started.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 relative">
      <Table className="text-center">
        <TableHeader>
          <TableRow className="bg-[#F6F6F6] text-[#292524] text-[12px]">
            <TableHead className="text-center">Client Name</TableHead>
            <TableHead className="text-center">Created At</TableHead>
            <TableHead className="text-center">Start Date</TableHead>
            <TableHead className="text-center">Phone</TableHead>
            <TableHead className="text-center">Status</TableHead>
            <TableHead className="text-center">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {clients.map((client) => (
            <TableRow key={client._id} className="text-[#595858] text-[12px]">
              <TableCell className="font-medium">
                {client.fullName || `${client.firstName} ${client.lastName}`}
              </TableCell>
              <TableCell>
                {new Date(client.createdAt).toLocaleDateString()}
              </TableCell>
              <TableCell>
                {new Date(client.dateOfBirth).toLocaleDateString()}
              </TableCell>
              <TableCell>{client.phoneMobile}</TableCell>
              <TableCell>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium">
                  <span
                    className={`w-2 h-2 rounded-full mr-1.5 ${
                      client.status === "active"
                        ? "bg-[#00A650]"
                        : "bg-[#DC2626]"
                    }`}
                  />
                  {client.status.charAt(0).toUpperCase() + client.status.slice(1)}
                </span>
              </TableCell>
              <TableCell>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="p-2 rounded-full hover:bg-gray-100">
                      <EllipsisIcon className="h-4 w-4" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    <DropdownMenuItem onClick={() => onEdit(client)}>
                      Edit
                      <PencilIcon className="ml-auto w-4 h-4" />
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => openPopup("inactive", client)}
                      className="flex items-center gap-2 cursor-pointer"
                    >
                      {client.status === "active" ? "In-Active" : "Active"}
                      <Minus className="ml-auto w-4 h-4" />
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => openPopup("delete", client)}
                      className="text-[#E63E65] focus:text-[#E63E65]"
                      variant="destructive"
                    >
                      Delete
                      <Trash2Icon className="ml-auto w-4 h-4 text-[#E63E65]" />
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {/* 🔔 Confirmation Popup */}
      {popupType && selectedClient && (
        <div className="fixed inset-0 flex items-center justify-center z-50 ">
          <div className="w-[364px] bg-white rounded-xl p-6 shadow-xl">
            <div className="text-center mb-6">
              {popupType === "delete" ? (
                <>
                  <h3 className="text-[15px] font-medium text-[#000000] mb-1">
                    Are you sure you want to delete
                  </h3>
                  <p className="text-[15px] font-medium text-[#000000]">
                    {selectedClient.fullName || `${selectedClient.firstName} ${selectedClient.lastName}`}?
                  </p>
                </>
              ) : (
                <p className="text-[15px] font-medium text-[#000000] mb-1">
                  Are you sure you want {selectedClient.fullName || `${selectedClient.firstName} ${selectedClient.lastName}`} as{" "}
                  {selectedClient.status === "active" ? "In-Active" : "Active"}?
                </p>
              )}
            </div>

            <div className="flex gap-3 justify-center">
              {popupType === "delete" && (
                <>
                  <button
                    onClick={closePopup}
                    className="w-[83px] h-[32px] text-[11px] text-[#919191] bg-[#F6F6F6] rounded-[4.55px] hover:bg-gray-200 font-medium"
                  >
                    No, Keep
                  </button>
                  <button
                    onClick={confirmAction}
                    className="w-[83px] h-[32px] text-[11px] text-white rounded-[4.55px] bg-[#F95858] hover:bg-red-600 font-medium"
                  >
                    Yes, Delete
                  </button>
                </>
              )}

              {popupType === "inactive" && (
                <>
                  <button
                    onClick={closePopup}
                    className="w-[83px] h-[32px] text-[11px] text-[#919191] bg-[#F6F6F6] rounded-[4.55px] hover:bg-gray-200 font-medium"
                  >
                    No, Keep
                  </button>
                  <button
                    onClick={confirmAction}
                    className="w-[83px] h-[32px] text-[11px] text-white rounded-[4.55px] bg-blue-500 hover:bg-blue-600 font-medium"
                  >
                    Yes, Sure
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ✅ Success Popup (auto close) */}
      {showSuccessPopup && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 shadow-lg w-[355px] text-center">
            <div className="flex items-center justify-center mb-4">
              <div className="w-12 h-12 flex items-center justify-center rounded-full bg-[#FF757533]">
                <Trash2Icon className="w-6 h-6 text-[#FF7575]" />
              </div>
            </div>
            <p className="text-[16px] font-medium text-[#000000]">
              Your Client deleted successfully!
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

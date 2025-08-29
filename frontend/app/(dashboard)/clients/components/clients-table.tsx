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

interface Props {
  clients: Client[];
  onEdit: (client: Client) => void;
  onToggleStatus: (id: number) => void;
  onDelete: (id: number) => void;
}

export function ClientsTable({
  clients,
  onEdit,
  onToggleStatus,
  onDelete,
}: Readonly<Props>) {
  const [popupType, setPopupType] = useState<"delete" | "inactive" | null>(
    null
  );
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);

  // ✅ new success popup state
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);

  const openPopup = (type: "delete" | "inactive", client: Client) => {
    setSelectedClient(client);
    setPopupType(type);
  };

  const closePopup = () => {
    setPopupType(null);
    setSelectedClient(null);
  };

  const confirmAction = () => {
    if (!selectedClient) return;
    if (popupType === "delete") {
      onDelete(selectedClient.id);
      // show success popup after delete
      setShowSuccessPopup(true);
      setTimeout(() => setShowSuccessPopup(false), 2000); // auto close after 2s
    } else if (popupType === "inactive") {
      onToggleStatus(selectedClient.id);
    }
    closePopup();
  };

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
            <TableRow key={client.id} className="text-[#595858] text-[12px]">
              <TableCell className="font-medium">{client.name}</TableCell>
              <TableCell>{client.createdAt}</TableCell>
              <TableCell>{client.startDate}</TableCell>
              <TableCell>{client.phone}</TableCell>
              <TableCell>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium">
                  <span
                    className={`w-2 h-2 rounded-full mr-1.5 ${
                      client.status === "Active"
                        ? "bg-[#00A650]"
                        : "bg-[#DC2626]"
                    }`}
                  />
                  {client.status}
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
                      {client.status === "Active" ? "In-Active" : "Active"}
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
                    {selectedClient.name}?
                  </p>
                </>
              ) : (
                <p className="text-[15px] font-medium text-[#000000] mb-1">
                  Are you sure you want {selectedClient.name} as{" "}
                  {selectedClient.status === "Active" ? "In-Active" : "Active"}?
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

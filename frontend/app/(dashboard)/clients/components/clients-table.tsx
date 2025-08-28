"use client";

import {
  Minus,
  EllipsisIcon,
  PencilIcon,
  Trash2Icon,
} from "lucide-react";
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
}: Readonly<Props>) {

    
  return (
    <div className="bg-white rounded-lg border border-gray-200">
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
                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium `}
                >
                  <span
                    className={`w-2 h-2 rounded-full mr-1.5 ${
                      client.status === "Active"
                        ? "bg-[#00A650]"
                        : "bg-[#DC2626]"
                    }`}
                  ></span>
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
                      onClick={() => onToggleStatus(client.id)}
                      className="flex items-center gap-2 cursor-pointer"
                    >
                      {client.status === "Active" ? "In-Active" : "Active"}
                      <Minus className="ml-auto w-4 h-4" />
                    </DropdownMenuItem>
                    <DropdownMenuItem
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
    </div>
  );
}

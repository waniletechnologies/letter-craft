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
          <TableRow>
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
            <TableRow key={client.id}>
              <TableCell className="font-medium">{client.name}</TableCell>
              <TableCell>{client.createdAt}</TableCell>
              <TableCell>{client.startDate}</TableCell>
              <TableCell>{client.phone}</TableCell>
              <TableCell>
                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    client.status === "Active"
                      ? "bg-green-100 text-green-800"
                      : "bg-red-100 text-red-800"
                  }`}
                >
                  <span
                    className={`w-2 h-2 rounded-full mr-1.5 ${
                      client.status === "Active" ? "bg-green-500" : "bg-red-500"
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

                    {/* <DropdownMenuItem onClick={() => handleViewDetails(row)}>
                      View Details
                      <EyeIcon className="ml-auto w-4 h-4" />
                    </DropdownMenuItem> */}
                  </DropdownMenuContent>
                </DropdownMenu>
                {/* <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-32">
                    <DropdownMenuItem
                      onClick={() => onEdit(client)}
                      className="flex items-center gap-2 cursor-pointer"
                    >
                      Edit
                      <Edit className="h-4 w-4" />
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => onToggleStatus(client.id)}
                      className="flex items-center gap-2 cursor-pointer"
                    >
                      {client.status === "Active" ? "In-Active" : "Active"}
                      <Minus className="h-4 w-4" />
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => onDelete(client.id)}
                      className="flex items-center gap-2 cursor-pointer text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      Delete
                      <Trash2 className="h-4 w-4" />
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu> */}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

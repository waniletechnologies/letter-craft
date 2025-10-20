"use client";

import { useState } from "react";
import { ClientsFilter } from "./components/clients-filter";
import { ClientsTable } from "./components/clients-table";
import { PaginationComponent } from "./components/pagination-component";
import { useRouter } from "next/navigation";
import { useListClients } from "@/hooks/clients";

export type Client = {
  _id: string;
  firstName: string;
  middleName?: string;
  lastName: string;
  suffix?: string;
  email: string;
  
  dateOfBirth: string;
  mailingAddress: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  phoneMobile: string;
  fax?: string;
  ssn: string;
  experianReport?: string;
  transunionFileNumber?: string;
  status: "active" | "inactive" | "pending" | "archived";
  createdBy?: string;
  lastModifiedBy?: string;
  createdAt: string;
  updatedAt: string;
  fullName?: string;
};

export default function ClientsPage() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const itemsPerPage = 10;

  // Fetch clients data using React Query
  const { 
    data: clientsData, 
    isLoading 
  } = useListClients({
    page: currentPage,
    limit: itemsPerPage,
    search: searchTerm,
    sortBy: 'createdAt',
    sortOrder: 'desc'
  });



  // Extract data from API response
  const clients = clientsData?.data || [];
  const totalClients = clientsData?.pagination?.totalCount || 0;
  const totalPages = Math.ceil(totalClients / itemsPerPage);

  return (
    <div className="sm:p-8 p-4">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Clients</h1>
      </div>

      {/* Filters + Add */}
      <ClientsFilter
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        onAddClient={() => router.push("/clients/add-client")}
      />

      {/* Add & Edit Dialogs */}
      {/* <AddClientDialog
        isOpen={isAddDialogOpen}
        onClose={() => setIsAddDialogOpen(false)}
      /> */}
      {/* <EditClientDialog
        isOpen={isEditDialogOpen}
        onClose={() => setIsEditDialogOpen(false)}
        initialData={selectedClient ?? undefined}
      /> */}

      {/* Table */}
      <ClientsTable
        clients={clients}
        onEdit={(client) => router.push(`/clients/edit-client?id=${client._id}`)}
        isLoading={isLoading}
      />

      {/* Pagination */}
      <div className="flex flex-col sm:flex-row justify-between gap-3 items-center mt-6">
        <div className="text-sm text-gray-500">
          {clients.length} of {totalClients} clients shown
        </div>
        <PaginationComponent
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
      </div>
    </div>
  );
}

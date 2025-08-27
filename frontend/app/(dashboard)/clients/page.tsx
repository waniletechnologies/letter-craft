"use client";

import { useState } from "react";
import { ClientsFilter } from "./components/clients-filter";
import { ClientsTable } from "./components/clients-table";
import { PaginationComponent } from "./components/pagination-component";
import { useRouter } from "next/navigation";

export type Client = {
  id: number;
  name: string;
  createdAt: string;
  startDate: string;
  phone: string;
  status: "Active" | "In Active";
};

export default function ClientsPage() {
  const router = useRouter();
  const [clients, setClients] = useState<Client[]>([
    {
      id: 1,
      name: "Jasmine Bell",
      createdAt: "September 9, 2013",
      startDate: "September 9, 2013",
      phone: "(508) 555-0102",
      status: "Active",
    },
    {
      id: 2,
      name: "Jasmine Bell",
      createdAt: "September 9, 2013",
      startDate: "September 9, 2013",
      phone: "(508) 555-0102",
      status: "Active",
    },
    {
      id: 3,
      name: "Jasmine Bell",
      createdAt: "September 9, 2013",
      startDate: "September 9, 2013",
      phone: "(508) 555-0102",
      status: "Active",
    },
    {
      id: 4,
      name: "Jasmine Bell",
      createdAt: "September 9, 2013",
      startDate: "September 9, 2013",
      phone: "(508) 555-0102",
      status: "Active",
    },
    {
      id: 5,
      name: "Jasmine Bell",
      createdAt: "September 9, 2013",
      startDate: "September 9, 2013",
      phone: "(508) 555-0102",
      status: "In Active",
    },
    {
      id: 6,
      name: "Jasmine Bell",
      createdAt: "September 9, 2013",
      startDate: "September 9, 2013",
      phone: "(508) 555-0102",
      status: "Active",
    },
    {
      id: 7,
      name: "Jasmine Bell",
      createdAt: "September 9, 2013",
      startDate: "September 9, 2013",
      phone: "(508) 555-0102",
      status: "Active",
    },
    {
      id: 8,
      name: "Jasmine Bell",
      createdAt: "September 9, 2013",
      startDate: "September 9, 2013",
      phone: "(508) 555-0102",
      status: "Active",
    },
    {
      id: 9,
      name: "Jasmine Bell",
      createdAt: "September 9, 2013",
      startDate: "September 9, 2013",
      phone: "(508) 555-0102",
      status: "Active",
    },
    {
      id: 10,
      name: "Jasmine Bell",
      createdAt: "September 9, 2013",
      startDate: "September 9, 2013",
      phone: "(508) 555-0102",
      status: "Active",
    },
    {
      id: 11,
      name: "Jasmine Bell",
      createdAt: "September 9, 2013",
      startDate: "September 9, 2013",
      phone: "(508) 555-0102",
      status: "Active",
    },
  ]);

  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const itemsPerPage = 10;

  

  const handleToggleStatus = (clientId: number) => {
    setClients(
      clients.map((client) =>
        client.id === clientId
          ? {
              ...client,
              status: client.status === "Active" ? "In Active" : "Active",
            }
          : client
      )
    );
  };

  const handleDelete = (clientId: number) => {
    setClients(clients.filter((client) => client.id !== clientId));
  };

  const filteredClients = clients.filter(
    (client) =>
      client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.phone.includes(searchTerm)
  );

  const totalPages = Math.ceil(filteredClients.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedClients = filteredClients.slice(
    startIndex,
    startIndex + itemsPerPage
  );

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
        clients={paginatedClients}
        onEdit={() => router.push("/clients/edit-client")}
        onToggleStatus={handleToggleStatus}
        onDelete={handleDelete}
      />

      {/* Pagination */}
      <div className="flex flex-col sm:flex-row justify-between gap-3 items-center mt-6">
        <div className="text-sm text-gray-500">
          {filteredClients.length} of {clients.length} clients shown
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

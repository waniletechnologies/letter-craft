"use client";

import { Search, Filter, Plus } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface Props {
  searchTerm: string;
  onSearchChange: (val: string) => void;
  onAddClient: () => void;
}

export function ClientsFilter({
  searchTerm,
  onSearchChange,
  onAddClient,
}: Props) {
  return (
    <div className="flex items-center mt-4 gap-4 mb-6">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
        <Input
          placeholder="Search by name or phone"
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-10 w-64"
        />
      </div>

      <Button variant="outline" className="flex items-center gap-2">
        <Filter className="w-4 h-4" />
        Filters
      </Button>

      <Button
        onClick={onAddClient}
        className="w-[212px] primary hover:bg-blue-700 flex items-center gap-2 ml-auto"
      >
        <Plus className="w-4 h-4" />
        Add New Client
      </Button>
    </div>
  );
}

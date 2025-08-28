"use client";

import { Search, Plus } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { LuListFilter } from 'react-icons/lu'

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

      <Button
                  variant="ghost"
                  className="text-[#292524] cursor-pointer bg-white hover:bg-transparent hover:text-[#2563EB] transition"
                >
                  <LuListFilter className="h-5 w-5 mr-2" />
                  Filter
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

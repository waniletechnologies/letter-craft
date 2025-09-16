import { Search, Plus } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { LuListFilter } from "react-icons/lu";

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
    <div
      className="
        flex flex-col gap-3 mt-4 mb-6
        sm:flex-row sm:items-center sm:gap-4
      "
    >
      {/* Search Box */}
      <div className="relative w-full sm:w-64">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
        <Input
          placeholder="Search by name or phone"
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-10 w-full"
        />
      </div>

      {/* Filter Button */}
      <Button
        variant="ghost"
        className="
          flex items-center justify-center
          text-[#292524] cursor-pointer bg-white
          hover:bg-transparent hover:text-[#2563EB]
          transition w-full sm:w-auto
        "
      >
        <LuListFilter className="h-5 w-5 mr-2" />
        Filter
      </Button>

      {/* Add Client Button */}
      <Button
        onClick={onAddClient}
        className="
          w-full sm:w-[212px] primary flex items-center justify-center gap-2
          sm:ml-auto
        "
      >
        <Plus className="w-4 h-4" />
        Add New Client
      </Button>
    </div>
  );
}

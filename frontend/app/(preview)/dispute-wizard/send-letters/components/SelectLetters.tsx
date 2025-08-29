"use client"

import React from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Trash2 } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export interface Letter {
  id: string;
  name: string;
  abbreviation: string;
  created: string;
  printStatus: string;
  pages: number;
}

interface SelectLettersProps {
  letters: Letter[];
  selectedLetters: string[];
  onLetterSelection: (letterId: string, checked: boolean) => void;
  onSelectAll: (checked: boolean) => void;
}

const SelectLetters: React.FC<SelectLettersProps> = ({
  letters,
  selectedLetters,
  onLetterSelection,
  onSelectAll,
}) => {
  const allSelected = selectedLetters.length === letters.length && letters.length > 0;

  return (
    <div className="space-y-4">
      <div className="font-medium text-[15px] leading-[32px] -tracking-[0.04em] text-[#71717A] ">
        This is a list of all unsent and unprinted letters that you have created for this client. 
        You can make any last minute changes, rename, or remove accidental letters by clicking the &apos;view/edit&apos; button. 
        All sent or printed letters will be shown in the upcoming &apos;Track&apos; screen.
      </div>
      
      <div className="border rounded-lg overflow-hidden bg-white">
        <Table>
          <TableHeader className="bg-gray-50">
            <TableRow>
              <TableHead className="w-[48px]">
                <Checkbox
                  checked={allSelected}
                  onCheckedChange={(checked) => onSelectAll(checked === true)}
                />
              </TableHead>
              <TableHead className="font-medium text-[12.61px] leading-[18.02px] tracking-normal text-[#292524]">Letter To</TableHead>
              <TableHead className="font-medium text-[12.61px] leading-[18.02px] tracking-normal text-[#292524]">Created</TableHead>
              <TableHead className="font-medium text-[12.61px] leading-[18.02px] tracking-normal text-[#292524]">Print Status</TableHead>
              <TableHead className="font-medium text-[12.61px] leading-[18.02px] tracking-normal text-[#292524]">Pages</TableHead>
              <TableHead className="font-medium text-[12.61px] leading-[18.02px] tracking-normal text-[#292524]">Actions</TableHead>
              <TableHead className="text-right pr-6"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {letters.map((letter) => (
              <TableRow key={letter.id} className="hover:bg-gray-50">
                <TableCell className="align-middle">
                  <Checkbox
                    checked={selectedLetters.includes(letter.id)}
                    onCheckedChange={(checked) => onLetterSelection(letter.id, checked === true)}
                  />
                </TableCell>
                <TableCell>
                  <div>
                    <div className="font-semibold text-[14.37px] leading-[20.52px] tracking-normal text-[#292524]">{letter.name}</div>
                    <div className="font-normal text-[12.31px] leading-[20.52px] tracking-normal text-[#292524]">{letter.abbreviation}</div>
                  </div>
                </TableCell>
                <TableCell className="font-medium text-[12.61px] leading-[18.02px] tracking-normal text-[#534F4E]">{letter.created}</TableCell>
                <TableCell className="font-medium text-[12.61px] leading-[18.02px] tracking-normal text-[#534F4E]">{letter.printStatus}</TableCell>
                <TableCell className="font-medium text-[12.61px] leading-[18.02px] tracking-normal text-[#534F4E]">{letter.pages}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-1">
                    <Button variant="link" size="sm" className="font-medium text-[14.37px] leading-[18.02px] tracking-normal text-primary p-0 h-auto">
                      View
                    </Button>
                    <span className="text-primary">/</span>
                    <Button variant="link" size="sm" className="font-medium text-[14.37px] leading-[18.02px] tracking-normal text-primary p-0 h-auto">
                      Edit
                    </Button>
                  </div>
                </TableCell>
                <TableCell>
                <Button variant="ghost" size="sm" className="text-red-600 p-0 h-auto">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default SelectLetters; 
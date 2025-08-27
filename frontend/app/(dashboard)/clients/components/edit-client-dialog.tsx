"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Client } from "../page";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  initialData?: Partial<Client>;
}

export function EditClientDialog({ isOpen, onClose, initialData }: Props) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Client</DialogTitle>
        </DialogHeader>
        <p className="text-sm text-gray-600">Editing: {initialData?.name}</p>
      </DialogContent>
    </Dialog>
  );
}

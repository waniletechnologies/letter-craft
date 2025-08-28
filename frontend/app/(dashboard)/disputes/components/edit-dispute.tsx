"use client"

import React, { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export type DisputeStatus = "in-progress" | "completed" | "pending" | "failed";

export interface EditDisputePayload {
  clientName: string;
  bureau: "Experian" | "Equifax" | "TransUnion";
  round: number;
  status: DisputeStatus;
  notes?: string;
}

export interface EditDisputeProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: string;
  initial: EditDisputePayload;
  onSave?: (payload: EditDisputePayload) => void;
}

const BUREAUS = ["Experian", "Equifax", "TransUnion"] as const;
const ROUNDS = [1, 2, 3, 4, 5];

export const EditDispute: React.FC<EditDisputeProps> = ({ open, onOpenChange, title = "Edit Dispute", initial, onSave }) => {
  const [form, setForm] = useState<EditDisputePayload>(initial);

  useEffect(() => {
    // Reset when different dispute is selected
    setForm(initial);
  }, [initial]);

  const handleSave = () => {
    onSave?.(form);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[520px] bg-white">
        <DialogHeader>
          <DialogTitle className="font-semibold text-[20px] leading-[100%] tracking-normal text-[#292524]">{title}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-1">
            <Label htmlFor="clientName" className="font-medium text-sm leading-[20px] tracking-normal text-[#09090B]">Client Name</Label>
            <Input
              id="clientName"
              value={form.clientName}
              onChange={(e) => setForm({ ...form, clientName: e.target.value })}
              className="shadow-none border-[#E4E4E7]"
            />
          </div>

          <div className="space-y-1">
            <Label className="font-medium text-sm leading-[20px] tracking-normal text-[#09090B]">Credit Bureau</Label>
            <Select value={form.bureau} onValueChange={(v) => setForm({ ...form, bureau: v as EditDisputePayload["bureau"] })}>
              <SelectTrigger className="shadow-none w-full border-[#E4E4E7]">
                <SelectValue placeholder="Select bureau" />
              </SelectTrigger>
              <SelectContent>
                {BUREAUS.map((b) => (
                  <SelectItem key={b} value={b}>{b}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1">
            <Label className="font-medium text-sm leading-[20px] tracking-normal text-[#09090B]">Dispute Round</Label>
            <Select value={String(form.round)} onValueChange={(v) => setForm({ ...form, round: Number(v) })}>
              <SelectTrigger className="shadow-none w-full border-[#E4E4E7]">
                <SelectValue placeholder="Select round" />
              </SelectTrigger>
              <SelectContent>
                {ROUNDS.map((r) => (
                  <SelectItem key={r} value={String(r)}>Round {r}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1">
            <Label className="font-medium text-sm leading-[20px] tracking-normal text-[#09090B]">Status</Label>
            <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v as DisputeStatus })}>
              <SelectTrigger className="shadow-none w-full border-[#E4E4E7]">
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="in-progress">In Progress</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1">
            <Label className="font-medium text-sm leading-[20px] tracking-normal text-[#09090B]">Additional Notes</Label>
            <Textarea
              rows={3}
              value={form.notes ?? ""}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              className="resize-none shadow-none border-[#E4E4E7]"
              placeholder="Add any additional notes about this dispute"
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleSave} className="bg-primary hover:bg-primary/90">Save Changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default EditDispute;
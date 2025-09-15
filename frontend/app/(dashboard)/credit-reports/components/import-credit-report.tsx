"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { LuEye, LuEyeOff } from "react-icons/lu";
import { importCreditReport } from "@/lib/creditReportApi";

interface ImportCreditReportProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onStartImport?: (payload: {
    provider: string;
    email: string;
    notes: string;
  }) => void;
  onImportError?: (error: string) => void;
}

const supportedProviders = [
  "MyFreeScore",
  "CreditKarma",
  "Experian",
  "Equifax",
  "TransUnion",
];

export const ImportCreditReport: React.FC<ImportCreditReportProps> = ({
  open,
  onOpenChange,
  onStartImport,
  onImportError,
}) => {
  const [provider, setProvider] = useState("MyFreeScore");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [notes, setNotes] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const router = useRouter();

 async function waitForReport(email: string, tries = 5) {
  for (let i = 0; i < tries; i++) {
    const res = await fetch(`/preview-credit-report/${encodeURIComponent(email)}`, { cache: "no-store" });
    if (res.ok) return true;
    await new Promise((r) => setTimeout(r, 400)); // wait 400 ms
  }
  throw new Error("Report not available yet");
}

const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
  e.preventDefault();
  setIsLoading(true);
  onStartImport?.({ provider, email, notes });

  try {
    setTimeout(()=> {}, 2000);
    const result = await importCreditReport({ email, password, provider, notes });

    if (result.success && result.data) {
      router.push(
        `/preview-credit-report/${encodeURIComponent(email)}`
      );
    } else {
      throw new Error(result.message || "Failed to import credit report");
    }
  } catch (error) {
    console.error("Import error:", error);
    onImportError?.(error instanceof Error ? error.message : "Unknown error");
  } finally {
    setIsLoading(false);
  }
};



  const handleCancel = () => {
    setProvider("MyFreeScore");
    setEmail("");
    setPassword("");
    setNotes("");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-[#3D3D3D]">
            Import Credit Report
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Form content remains the same... */}
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              {/* Provider Selection */}
              <div className="space-y-2">
                <Label
                  htmlFor="provider"
                  className="text-sm font-medium text-[#3D3D3D]"
                >
                  Choose Supported Provider
                </Label>
                <Select value={provider} onValueChange={setProvider}>
                  <SelectTrigger className="w-full shadow-none">
                    <SelectValue placeholder="Select a provider" />
                  </SelectTrigger>
                  <SelectContent>
                    {supportedProviders.map((p) => (
                      <SelectItem key={p} value={p}>
                        {p}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Email Field */}
              <div className="space-y-2">
                <Label
                  htmlFor="email"
                  className="text-sm font-medium text-[#3D3D3D]"
                >
                  Email <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="--"
                  required
                  className="w-full shadow-none border border-[#E4E4E7] rounded-md"
                  disabled={isLoading}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {/* Password Field */}
              <div className="space-y-2">
                <Label
                  htmlFor="password"
                  className="text-sm font-medium text-[#3D3D3D]"
                >
                  Password <span className="text-red-500">*</span>
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="********"
                    required
                    className="w-full pr-10 shadow-none border border-[#E4E4E7] rounded-md"
                    disabled={isLoading}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                    disabled={isLoading}
                  >
                    {showPassword ? (
                      <LuEyeOff className="h-4 w-4 text-gray-500" />
                    ) : (
                      <LuEye className="h-4 w-4 text-gray-500" />
                    )}
                  </Button>
                </div>
              </div>
            </div>

            {/* Notes Field */}
            <div className="space-y-2">
              <Label
                htmlFor="notes"
                className="text-sm font-medium text-[#3D3D3D]"
              >
                Notes
              </Label>
              <Textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="--"
                rows={3}
                className="w-full shadow-none resize-none border border-[#E4E4E7] rounded-md"
                disabled={isLoading}
              />
            </div>
          </div>

          <DialogFooter className="flex justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
              className="w-[71px]"
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="w-[212px] bg-primary hover:bg-primary/90"
              disabled={isLoading}
            >
              {isLoading ? "Importing..." : "Import & Run Simple Audit"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ImportCreditReport;

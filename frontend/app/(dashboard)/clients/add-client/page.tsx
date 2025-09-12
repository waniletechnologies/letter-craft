"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar, Upload } from "lucide-react";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useCreateClient } from "@/hooks/clients";
import { toast } from "sonner";

export default function AddClientPage() {
  const router = useRouter();
  const [showFtcDialog, setShowFtcDialog] = useState(false);
  const { mutate, isPending } = useCreateClient();

  interface ClientData {
    firstName: string;
    middleName: string;
    lastName: string;
    suffix: string;
    email: string;
    dateOfBirth: string;
    mailingAddress: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
    phoneMobile: string;
    phoneAlternate: string;
    phoneWork: string;
    fax: string;
    ssn: string;
    experianReport: string;
    transunionFileNumber: string;
    disputeScheduleDate: string;
    disputeScheduleTime: string;
  }

  const [formData, setFormData] = useState<ClientData>({
    firstName: "",
    middleName: "",
    lastName: "",
    suffix: "",
    email: "",
    dateOfBirth: "",
    mailingAddress: "",
    city: "",
    state: "",
    zipCode: "",
    country: "United States",
    phoneMobile: "",
    phoneAlternate: "",
    phoneWork: "",
    fax: "",
    ssn: "",
    experianReport: "",
    transunionFileNumber: "",
    disputeScheduleDate: "",
    disputeScheduleTime: "",
  });

  const [uploadedFiles, setUploadedFiles] = useState<{
    [key: string]: File | null;
  }>({
    driversLicense: null,
    proofOfSS: null,
    proofOfAddress: null,
    ftcReport: null,
  });

  const handleInputChange = (field: keyof ClientData, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleFileUpload = (
    type: string,
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    console.log("Upload File")
    const file = event.target.files?.[0] || null;
    setUploadedFiles((prev) => ({
      ...prev,
      [type]: file,
    }));
  };

  const handleSubmit = () => {
    mutate(
      {
        ...formData,
        middleName: formData.middleName || undefined,
        suffix: formData.suffix || undefined,
        phoneAlternate: formData.phoneAlternate || undefined,
        phoneWork: formData.phoneWork || undefined,
        fax: formData.fax || undefined,
        ssn: (formData.ssn || "").replace(/\D/g, ""),
        experianReport: formData.experianReport || undefined,
        transunionFileNumber: formData.transunionFileNumber || undefined,
      },
      {
        onSuccess: () => {
          toast.success("Client created successfully");
          router.push("/clients");
        },
        onError: (error) => {
          console.error("Create client failed:", error);
          toast.error((error as Error)?.message || "Failed to create client");
        },
      }
    );
  };

  const states = [
    "Alabama",
    "Alaska",
    "Arizona",
    "Arkansas",
    "California",
    "Colorado",
    "Connecticut",
    "Delaware",
    "Florida",
    "Georgia",
    "Hawaii",
    "Idaho",
    "Illinois",
    "Indiana",
    "Iowa",
    "Kansas",
    "Kentucky",
    "Louisiana",
    "Maine",
    "Maryland",
    "Massachusetts",
    "Michigan",
    "Minnesota",
    "Mississippi",
    "Missouri",
    "Montana",
    "Nebraska",
    "Nevada",
    "New Hampshire",
    "New Jersey",
    "New Mexico",
    "New York",
    "North Carolina",
    "North Dakota",
    "Ohio",
    "Oklahoma",
    "Oregon",
    "Pennsylvania",
    "Rhode Island",
    "South Carolina",
    "South Dakota",
    "Tennessee",
    "Texas",
    "Utah",
    "Vermont",
    "Virginia",
    "Washington",
    "West Virginia",
    "Wisconsin",
    "Wyoming",
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-5xl mx-auto bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        {/* Header */}
        <div className="bg-[#F6F6F6] px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <h1 className="text-xl font-semibold text-gray-900">
                Add Client
              </h1>
            </div>
            <div className="flex gap-2">
              <Button variant="ghost" className="text-sm h-9" onClick={() => router.push('/clients')}>
                {" "}
                Back to clients list{" "}
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={isPending}
                className="primary hover:bg-blue-700 text-white h-9 px-4"
              >
                {isPending ? "Adding..." : "Add Client"}
              </Button>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Personal Information */}
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label
                  htmlFor="firstName"
                  className="text-sm font-medium mb-2 block"
                >
                  First Name <span className="text-[#DC2626]"> *</span>
                </Label>
                <Input
                  id="firstName"
                  value={formData.firstName}
                  onChange={(e) =>
                    handleInputChange("firstName", e.target.value)
                  }
                  className="h-10"
                />
              </div>
              <div>
                <Label
                  htmlFor="middleName"
                  className="text-sm font-medium mb-2 block"
                >
                  Middle Name
                </Label>
                <Input
                  id="middleName"
                  value={formData.middleName}
                  onChange={(e) =>
                    handleInputChange("middleName", e.target.value)
                  }
                  className="h-10"
                />
              </div>
              <div>
                <Label
                  htmlFor="lastName"
                  className="text-sm font-medium mb-2 block"
                >
                  Last Name <span className="text-[#DC2626]"> *</span>
                </Label>
                <Input
                  id="lastName"
                  value={formData.lastName}
                  onChange={(e) =>
                    handleInputChange("lastName", e.target.value)
                  }
                  className="h-10"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label
                  htmlFor="suffix"
                  className="text-sm font-medium mb-2 block"
                >
                  Suffix
                </Label>
                <Input
                  id="suffix"
                  value={formData.suffix}
                  onChange={(e) => handleInputChange("suffix", e.target.value)}
                  className="h-10"
                />
              </div>
              <div>
                <Label
                  htmlFor="email"
                  className="text-sm font-medium mb-2 block"
                >
                  Email Address (Necessary for onboarding)
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  className="h-10"
                />
              </div>
              <div>
                <Label
                  htmlFor="dateOfBirth"
                  className="text-sm font-medium mb-2 block"
                >
                  Date of Birth
                </Label>
                <div className="relative">
                  <Input
                    id="dateOfBirth"
                    type="date"
                    value={formData.dateOfBirth}
                    onChange={(e) =>
                      handleInputChange("dateOfBirth", e.target.value)
                    }
                    className="h-10 pr-10"
                  />
                  <Calendar className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                </div>
              </div>
            </div>
          </div>

          {/* Address Information */}
          <div className="space-y-4">
            <div className="flex flex-wrap gap-4">
              <div className="w-[311px]">
                <Label
                  htmlFor="mailingAddress"
                  className="text-sm font-medium mb-2 block"
                >
                  Mailing Address
                </Label>
                <Input
                  id="mailingAddress"
                  value={formData.mailingAddress}
                  onChange={(e) =>
                    handleInputChange("mailingAddress", e.target.value)
                  }
                  className="h-10"
                />
              </div>

              <div className="w-[315px]">
                <Label
                  htmlFor="city"
                  className="text-sm font-medium mb-2 block"
                >
                  City
                </Label>
                <Input
                  id="city"
                  value={formData.city}
                  onChange={(e) => handleInputChange("city", e.target.value)}
                  className="h-10"
                />
              </div>

              <div className="w-[148px]">
                <Label
                  htmlFor="state"
                  className="text-sm font-medium mb-2 block"
                >
                  State
                </Label>
                <Select
                  value={formData.state}
                  onValueChange={(value: string) =>
                    handleInputChange("state", value)
                  }
                >
                  <SelectTrigger className="h-10 w-[148px]">
                    <SelectValue placeholder="---" />
                  </SelectTrigger>
                  <SelectContent>
                    {states.map((state) => (
                      <SelectItem key={state} value={state}>
                        {state}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="w-[148px] h-[70px]">
                <Label
                  htmlFor="zipCode"
                  className="text-sm font-medium mb-2 block"
                >
                  Zip Code
                </Label>
                <Input
                  id="zipCode"
                  value={formData.zipCode}
                  onChange={(e) => handleInputChange("zipCode", e.target.value)}
                  className="h-[35px]"
                />
              </div>
            </div>
          </div>

          {/* Contact Information */}
          <div className="space-y-4">
            <div className="flex flex-wrap gap-4">
              {/* Country */}
              <div className="w-[311px]">
                <Label
                  htmlFor="country"
                  className="text-sm font-medium mb-2 block"
                >
                  Country
                </Label>
                <Input
                  id="country"
                  value={formData.country}
                  onChange={(e) => handleInputChange("country", e.target.value)}
                  className="h-10"
                />
              </div>

              {/* Phone Mobile */}
              <div className="w-[148px]">
                <Label
                  htmlFor="phoneMobile"
                  className="text-sm font-medium mb-2 block"
                >
                  Phone Mobile
                </Label>
                <Input
                  id="phoneMobile"
                  value={formData.phoneMobile}
                  onChange={(e) =>
                    handleInputChange("phoneMobile", e.target.value)
                  }
                  className="h-10"
                />
              </div>

              {/* Phone Alternate */}
              <div className="w-[148px]">
                <Label
                  htmlFor="phoneAlternate"
                  className="text-sm font-medium mb-2 block"
                >
                  Phone Alternate
                </Label>
                <Input
                  id="phoneAlternate"
                  value={formData.phoneAlternate}
                  onChange={(e) =>
                    handleInputChange("phoneAlternate", e.target.value)
                  }
                  className="h-10"
                />
              </div>

              {/* Phone Work */}
              <div className="w-[148px]">
                <Label
                  htmlFor="phoneWork"
                  className="text-sm font-medium mb-2 block"
                >
                  Phone Work
                </Label>
                <Input
                  id="phoneWork"
                  value={formData.phoneWork}
                  onChange={(e) =>
                    handleInputChange("phoneWork", e.target.value)
                  }
                  className="h-10"
                />
              </div>

              {/* Fax */}
              <div className="w-[148px]">
                <Label htmlFor="fax" className="text-sm font-medium mb-2 block">
                  Fax
                </Label>
                <Input
                  id="fax"
                  value={formData.fax}
                  onChange={(e) => handleInputChange("fax", e.target.value)}
                  className="h-10"
                />
              </div>
            </div>
          </div>

          {/* Additional Information */}
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="ssn" className="text-sm font-medium mb-2 block">
                  SSN
                </Label>
                <Input
                  id="ssn"
                  value={formData.ssn}
                  onChange={(e) => handleInputChange("ssn", e.target.value)}
                  className="h-10"
                />
              </div>
              <div>
                <Label
                  htmlFor="experianReport"
                  className="text-sm font-medium mb-2 block"
                >
                  Experian Report Number
                </Label>
                <Input
                  id="experianReport"
                  value={formData.experianReport}
                  onChange={(e) =>
                    handleInputChange("experianReport", e.target.value)
                  }
                  className="h-10"
                />
              </div>
              <div>
                <Label
                  htmlFor="transunionFileNumber"
                  className="text-sm font-medium mb-2 block"
                >
                  TransUnion File Number
                </Label>
                <Input
                  id="transunionFileNumber"
                  value={formData.transunionFileNumber}
                  onChange={(e) =>
                    handleInputChange("transunionFileNumber", e.target.value)
                  }
                  className="h-10"
                />
              </div>
            </div>
          </div>

          {/* Dispute Schedule Information */}
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="disputeScheduleDate" className="text-sm font-medium mb-2 block">
                  Dispute Schedule Date
                </Label>
                <Input
                  id="disputeScheduleDate"
                  type="date"
                  value={formData.disputeScheduleDate}
                  onChange={(e) => handleInputChange("disputeScheduleDate", e.target.value)}
                  className="h-10"
                />
              </div>
              <div>
                <Label htmlFor="disputeScheduleTime" className="text-sm font-medium mb-2 block">
                  Dispute Schedule Time
                </Label>
                <Input
                  id="disputeScheduleTime"
                  type="time"
                  value={formData.disputeScheduleTime}
                  onChange={(e) => handleInputChange("disputeScheduleTime", e.target.value)}
                  className="h-10"
                />
              </div>
            </div>
          </div>

          {/* Upload Documents */}
          <div className="space-y-6">
            <h2 className="text-lg font-medium text-gray-900">
              Upload Documents
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                { key: "driversLicense", label: "Upload for Driver's License" },
                { key: "proofOfSS", label: "Upload for Proof of SS" },
                { key: "proofOfAddress", label: "Upload for Proof of Address" },
              ].map(({ key, label }) => (
                <div
                  key={key}
                  className="flex items-center justify-between border border-gray-200 rounded-lg px-4 h-[62px] w-[311px]"
                >
                  <div className="text-[12px] text-[#9D9D9D]">
                    {uploadedFiles[key]?.name || label}
                  </div>
                  <input
                    type="file"
                    id={key}
                    className="hidden"
                    onChange={(e) => handleFileUpload(key, e)}
                    accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="bg-[#2196F3] text-white hover:bg-blue-700 h-8 px-3"
                    onClick={() => document.getElementById(key)?.click()}
                  >
                    <Upload className="h-3 w-3 mr-1" />
                    Upload
                  </Button>
                </div>
              ))}
            </div>

            {/* FTC Report Upload */}
            <div>
              <h3 className="font-medium mb-3 text-sm text-gray-900">
                Upload Your FTC Report
              </h3>
              <div
                className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer"
                onClick={() => setShowFtcDialog(true)}
              >
                <div className="mb-3">
                  <Upload className="h-8 w-8 mx-auto text-gray-400" />
                </div>
                <div className="text-sm text-gray-600 mb-1">
                  Drop your file here, or{" "}
                  <span className="text-blue-600 underline">Browse</span>
                </div>
                <div className="text-xs text-gray-400">
                  Supports: pdf Max file size 80MB
                </div>
                {uploadedFiles.ftcReport && (
                  <div className="text-sm text-green-600 mt-2">
                    Uploaded: {uploadedFiles.ftcReport.name}
                  </div>
                )}
              </div>
              <Dialog open={showFtcDialog} onOpenChange={setShowFtcDialog}>
                <DialogContent className="sm:max-w-[974px]">
                  <DialogHeader>
                    <DialogTitle className="text-lg font-semibold text-[#292524]">
                      Upload Your FTC Report
                    </DialogTitle>
                  </DialogHeader>

                  <div className="space-y-4 flex gap-8">
                    <div
                      className="border-2 border-dashed border-blue-300 rounded-lg p-8 text-center cursor-pointer bg-[#E4E4E7]  transition-colors"
                      onClick={() =>
                        document.getElementById("ftcReportInput")?.click()
                      }
                    >
                      <div className="mb-4">
                        <div className="w-16 h-16 mx-auto bg-blue-100 rounded-full flex items-center justify-center">
                          <svg
                            className="w-8 h-8 text-blue-500"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                            />
                          </svg>
                        </div>
                      </div>
                      <div className="w-[296px]">
                        <div className="text-[16px] text-[#040415] mb-1">
                          Drop your file here, or{" "}
                          <span className="text-[16px] text-[#2196F3] underline hover:text-blue-800">
                            Browse
                          </span>
                        </div>
                        <div className="text-sm text-gray-500">
                          Supports: pdf Max file size 80MB
                        </div>
                      </div>
                      {uploadedFiles.ftcReport && (
                        <div className="mt-3 text-sm text-green-600 font-medium">
                          Uploaded: {uploadedFiles.ftcReport.name}
                        </div>
                      )}
                    </div>
                    <div className="w-[311px]">
                      <Label
                        htmlFor="ftcTitle"
                        className="text-sm font-medium text-gray-700"
                      >
                        Need a title of the FTC report
                      </Label>
                      <Input
                        id="ftcTitle"
                        placeholder="---"
                        className="mt-1 h-10"
                      />
                    </div>
                    <input
                      type="file"
                      id="ftcReportInput"
                      className="hidden"
                      accept=".pdf"
                      onChange={(e) => {
                        handleFileUpload("ftcReport", e);
                        setShowFtcDialog(false);
                      }}
                    />
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
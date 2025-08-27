"use client";

import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar, Upload } from "lucide-react";

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

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
  experianReportNumber: string;
  transUnionFileNumber: string;
}

export function AddClientDialog({ isOpen, onClose }: Props) {
  const [formData, setFormData] = useState<ClientData>({
    firstName: "John",
    middleName: "Alex",
    lastName: "Doe",
    suffix: "Jr, sr, etc",
    email: "",
    dateOfBirth: "",
    mailingAddress: "Mailing Address",
    city: "",
    state: "",
    zipCode: "",
    country: "United States",
    phoneMobile: "",
    phoneAlternate: "",
    phoneWork: "",
    fax: "",
    ssn: "232135465456",
    experianReportNumber: "354854564879",
    transUnionFileNumber: "65456",
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
    const file = event.target.files?.[0] || null;
    setUploadedFiles((prev) => ({
      ...prev,
      [type]: file,
    }));
  };

  const handleSubmit = () => {
    console.log("Client Data:", formData);
    console.log("Uploaded Files:", uploadedFiles);
    alert("Client added successfully!");
    onClose();
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
    <div className="w-[900px]">
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto p-0">
          <DialogHeader className="flex flex-row items-center justify-between border-b p-6 pb-4">
            <DialogTitle className="text-xl font-semibold">
              Add Client
            </DialogTitle>
            <div className="flex gap-2">
              <Button variant="ghost" onClick={onClose} className="text-sm h-9">
                Back to clients list
              </Button>
              <Button
                onClick={handleSubmit}
                className="bg-blue-600 hover:bg-blue-700 text-white h-9"
              >
                Add Client
              </Button>
            </div>
          </DialogHeader>

          <div className="space-y-6 p-6">
            {/* Personal Information */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label
                  htmlFor="firstName"
                  className="text-sm font-medium mb-1 block"
                >
                  First Name *
                </Label>
                <Input
                  id="firstName"
                  value={formData.firstName}
                  onChange={(e) =>
                    handleInputChange("firstName", e.target.value)
                  }
                  className="h-9"
                />
              </div>
              <div>
                <Label
                  htmlFor="middleName"
                  className="text-sm font-medium mb-1 block"
                >
                  Middle Name
                </Label>
                <Input
                  id="middleName"
                  value={formData.middleName}
                  onChange={(e) =>
                    handleInputChange("middleName", e.target.value)
                  }
                  className="h-9"
                />
              </div>
              <div>
                <Label
                  htmlFor="lastName"
                  className="text-sm font-medium mb-1 block"
                >
                  Last Name *
                </Label>
                <Input
                  id="lastName"
                  value={formData.lastName}
                  onChange={(e) =>
                    handleInputChange("lastName", e.target.value)
                  }
                  className="h-9"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label
                  htmlFor="suffix"
                  className="text-sm font-medium mb-1 block"
                >
                  Suffix
                </Label>
                <Input
                  id="suffix"
                  value={formData.suffix}
                  onChange={(e) => handleInputChange("suffix", e.target.value)}
                  className="h-9"
                />
              </div>
              <div>
                <Label
                  htmlFor="email"
                  className="text-sm font-medium mb-1 block"
                >
                  Email Address (Necessary for onboarding)
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  className="h-9"
                />
              </div>
              <div>
                <Label
                  htmlFor="dateOfBirth"
                  className="text-sm font-medium mb-1 block"
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
                    className="h-9 pr-10"
                  />
                  <Calendar className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                </div>
              </div>
            </div>

            {/* Divider */}
            <div className="border-t border-gray-200 my-4"></div>

            {/* Address Information */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2">
                <Label
                  htmlFor="mailingAddress"
                  className="text-sm font-medium mb-1 block"
                >
                  Mailing Address
                </Label>
                <Textarea
                  id="mailingAddress"
                  value={formData.mailingAddress}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                    handleInputChange("mailingAddress", e.target.value)
                  }
                  className="min-h-[80px] resize-none"
                />
              </div>
              <div>
                <Label
                  htmlFor="city"
                  className="text-sm font-medium mb-1 block"
                >
                  City
                </Label>
                <Input
                  id="city"
                  value={formData.city}
                  onChange={(e) => handleInputChange("city", e.target.value)}
                  className="h-9"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label
                  htmlFor="state"
                  className="text-sm font-medium mb-1 block"
                >
                  State
                </Label>
                <Select
                  value={formData.state}
                  onValueChange={(value: string) =>
                    handleInputChange("state", value)
                  }
                >
                  <SelectTrigger className="h-9">
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
              <div>
                <Label
                  htmlFor="zipCode"
                  className="text-sm font-medium mb-1 block"
                >
                  Zip Code
                </Label>
                <Input
                  id="zipCode"
                  value={formData.zipCode}
                  onChange={(e) => handleInputChange("zipCode", e.target.value)}
                  className="h-9"
                />
              </div>
              <div>
                <Label
                  htmlFor="country"
                  className="text-sm font-medium mb-1 block"
                >
                  Country
                </Label>
                <Input
                  id="country"
                  value={formData.country}
                  onChange={(e) => handleInputChange("country", e.target.value)}
                  className="h-9"
                />
              </div>
            </div>

            {/* Divider */}
            <div className="border-t border-gray-200 my-4"></div>

            {/* Contact Information */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <Label
                  htmlFor="phoneMobile"
                  className="text-sm font-medium mb-1 block"
                >
                  Phone (Mobile)
                </Label>
                <Input
                  id="phoneMobile"
                  type="tel"
                  value={formData.phoneMobile}
                  onChange={(e) =>
                    handleInputChange("phoneMobile", e.target.value)
                  }
                  className="h-9"
                />
              </div>
              <div>
                <Label
                  htmlFor="phoneAlternate"
                  className="text-sm font-medium mb-1 block"
                >
                  Phone (Alternate)
                </Label>
                <Input
                  id="phoneAlternate"
                  type="tel"
                  value={formData.phoneAlternate}
                  onChange={(e) =>
                    handleInputChange("phoneAlternate", e.target.value)
                  }
                  className="h-9"
                />
              </div>
              <div>
                <Label
                  htmlFor="phoneWork"
                  className="text-sm font-medium mb-1 block"
                >
                  Phone (Work)
                </Label>
                <Input
                  id="phoneWork"
                  type="tel"
                  value={formData.phoneWork}
                  onChange={(e) =>
                    handleInputChange("phoneWork", e.target.value)
                  }
                  className="h-9"
                />
              </div>
              <div>
                <Label htmlFor="fax" className="text-sm font-medium mb-1 block">
                  Fax
                </Label>
                <Input
                  id="fax"
                  type="tel"
                  value={formData.fax}
                  onChange={(e) => handleInputChange("fax", e.target.value)}
                  className="h-9"
                />
              </div>
            </div>

            {/* Divider */}
            <div className="border-t border-gray-200 my-4"></div>

            {/* Additional Information */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="ssn" className="text-sm font-medium mb-1 block">
                  SSN
                </Label>
                <Input
                  id="ssn"
                  value={formData.ssn}
                  onChange={(e) => handleInputChange("ssn", e.target.value)}
                  className="h-9"
                />
              </div>
              <div>
                <Label
                  htmlFor="experianReportNumber"
                  className="text-sm font-medium mb-1 block"
                >
                  Experian Report Number
                </Label>
                <Input
                  id="experianReportNumber"
                  value={formData.experianReportNumber}
                  onChange={(e) =>
                    handleInputChange("experianReportNumber", e.target.value)
                  }
                  className="h-9"
                />
              </div>
              <div>
                <Label
                  htmlFor="transUnionFileNumber"
                  className="text-sm font-medium mb-1 block"
                >
                  TransUnion File Number
                </Label>
                <Input
                  id="transUnionFileNumber"
                  value={formData.transUnionFileNumber}
                  onChange={(e) =>
                    handleInputChange("transUnionFileNumber", e.target.value)
                  }
                  className="h-9"
                />
              </div>
            </div>

            {/* Divider */}
            <div className="border-t border-gray-200 my-6"></div>

            {/* Upload Documents */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Upload Documents</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                {[
                  {
                    key: "driversLicense",
                    label: "Upload for Driver's License",
                  },
                  { key: "proofOfSS", label: "Upload for Proof of SS" },
                  {
                    key: "proofOfAddress",
                    label: "Upload for Proof of Address",
                  },
                ].map(({ key, label }) => (
                  <div
                    key={key}
                    className="border border-gray-200 rounded-lg p-4 text-center"
                  >
                    <div className="text-sm text-gray-600 mb-3">{label}</div>
                    <input
                      type="file"
                      id={key}
                      className="hidden"
                      onChange={(e) => handleFileUpload(key, e)}
                      accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                    />
                    <label htmlFor={key} className="cursor-pointer">
                      <Button
                        variant="outline"
                        size="sm"
                        className="cursor-pointer bg-blue-600 text-white hover:bg-blue-700 h-8 px-3"
                      >
                        <Upload className="h-3 w-3 mr-1" />
                        Upload
                      </Button>
                    </label>
                    {uploadedFiles[key] && (
                      <div className="text-xs text-green-600 mt-2">
                        {uploadedFiles[key]?.name}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* FTC Report Upload */}
              <div>
                <h4 className="font-medium mb-3 text-sm">
                  Upload Your FTC Report
                </h4>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  <div className="mb-3">
                    <Upload className="h-8 w-8 mx-auto text-gray-400" />
                  </div>
                  <input
                    type="file"
                    id="ftcReport"
                    className="hidden"
                    onChange={(e) => handleFileUpload("ftcReport", e)}
                    accept=".pdf"
                  />
                  <label htmlFor="ftcReport" className="cursor-pointer">
                    <div className="text-sm text-gray-600 mb-1">
                      Drop your file here, or{" "}
                      <span className="text-blue-600 underline">Browse</span>
                    </div>
                    <div className="text-xs text-gray-400">
                      Supports: pdf Max file size 80MB
                    </div>
                  </label>
                  {uploadedFiles.ftcReport && (
                    <div className="text-sm text-green-600 mt-2">
                      Uploaded: {uploadedFiles.ftcReport.name}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

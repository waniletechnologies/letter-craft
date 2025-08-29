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
import { Calendar, Upload, X } from "lucide-react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { UploadFile } from "../../../../public/images";

export default function EditClientPage() {
  const router = useRouter();

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

  const [formData, setFormData] = useState<ClientData>({
    firstName: "John",
    middleName: "Alex",
    lastName: "Doe",
    suffix: "Jr, sr, etc",
    email: "johndoe@example.com",
    dateOfBirth: "2002-05-25",
    mailingAddress: "Mailing Address",
    city: "United Kingdom",
    state: "",
    zipCode: "",
    country: "United States",
    phoneMobile: "(208) 555-0112",
    phoneAlternate: "(208) 555-0112",
    phoneWork: "(208) 555-0112",
    fax: "",
    ssn: "232135465456",
    experianReportNumber: "354854564879",
    transUnionFileNumber: "65456",
  });

  const [uploadedFiles, setUploadedFiles] = useState<{
    [key: string]: { name: string; size: string } | null;
  }>({
    driversLicense: { name: "Driver's License.jpg", size: "900kb" },
    proofOfSS: { name: "Proof of SS.jpg", size: "900kb" },
    proofOfAddress: { name: "Proof of Address.jpg", size: "900kb" },
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
    const file = event.target.files?.[0];
    if (file) {
      const sizeInKb = Math.round(file.size / 1024);
      setUploadedFiles((prev) => ({
        ...prev,
        [type]: { name: file.name, size: `${sizeInKb}kb` },
      }));
    }
  };

  const handleFileRemove = (type: string) => {
    setUploadedFiles((prev) => ({
      ...prev,
      [type]: null,
    }));
  };

  const handleSubmit = () => {
    console.log("Client Data:", formData);
    console.log("Uploaded Files:", uploadedFiles);
    alert("Client updated successfully!");
    router.push("/clients");
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
                Edit Client
              </h1>
            </div>
            <div className="flex gap-2">
              <Button variant="ghost" className="text-sm h-9 text-gray-600">
                Back to clients list
              </Button>
              <Button
                onClick={handleSubmit}
                className="bg-[#2196F3] hover:bg-blue-700 text-white h-9 px-4"
              >
                Add Client
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
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4"></div>
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
                  htmlFor="experianReportNumber"
                  className="text-sm font-medium mb-2 block"
                >
                  Experian Report Number
                </Label>
                <Input
                  id="experianReportNumber"
                  value={formData.experianReportNumber}
                  onChange={(e) =>
                    handleInputChange("experianReportNumber", e.target.value)
                  }
                  className="h-10"
                />
              </div>
              <div>
                <Label
                  htmlFor="transUnionFileNumber"
                  className="text-sm font-medium mb-2 block"
                >
                  TransUnion File Number
                </Label>
                <Input
                  id="transUnionFileNumber"
                  value={formData.transUnionFileNumber}
                  onChange={(e) =>
                    handleInputChange("transUnionFileNumber", e.target.value)
                  }
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
                { key: "driversLicense", label: "Driver's License.jpg" },
                { key: "proofOfSS", label: "Proof of SS.jpg" },
                { key: "proofOfAddress", label: "Proof of Address.jpg" },
              ].map(({ key, label }) => (
                <div key={key} className="space-y-2">
                  {uploadedFiles[key] ? (
                    <div className="flex items-center justify-between p-3 rounded-lg bg-[#EFEFEF]">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-blue-100 rounded flex items-center justify-center overflow-hidden relative">
                          <Image
                            src={UploadFile || "/placeholder.svg"}
                            alt="file icon"
                            fill
                            className="object-contain"
                            priority
                          />
                        </div>

                        <div>
                          <div className="text-[12px] font-medium text-gray-900">
                            {uploadedFiles[key]?.name}
                          </div>
                          <div className="text-[12px] text-gray-500">
                            {uploadedFiles[key]?.size}
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={() => handleFileRemove(key)}
                        className="p-1 bg-[#BBBBBB] hover:bg-gray-200 rounded-xl border-[#BBBBBB]"
                      >
                        <X className="h-4 w-4 text-gray-400" />
                      </button>
                    </div>
                  ) : (
                    <div className="border border-gray-200 rounded-lg p-4 text-center">
                      <div className="text-sm text-gray-600 mb-3">
                        Upload for {label}
                      </div>
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
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* FTC Report Upload */}
            {/* <div>
              <h3 className="font-medium mb-3 text-sm text-gray-900">
                Upload Your FTC Report
              </h3>
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
            </div> */}
          </div>
        </div>
      </div>
    </div>
  );
}

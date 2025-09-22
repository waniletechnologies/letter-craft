"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Image from "next/image";

import { CloudUpload } from "@/public/images";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar, Upload, Info, X, FileText, Download } from "lucide-react";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useCreateClient, useUploadClientFile } from "@/hooks/clients";
import { toast } from "sonner";

interface UploadedFile {
  _id: string;
  fileName: string;
  originalName: string;
  mimeType: string;
  size: number;
  uploadedAt: string;
  url: string;
  fileObject: File; // Store the actual file object
}
export default function AddClientPage() {
  const router = useRouter();
  const [showFtcDialog, setShowFtcDialog] = useState(false);
  const [showSsnInfo, setShowSsnInfo] = useState(false);
  const { mutate: createClient, isPending: isCreating } = useCreateClient();
  const { mutateAsync: uploadFile } = useUploadClientFile();
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

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
    [key: string]: UploadedFile[];
  }>({
    driversLicense: [],
    proofOfSS: [],
    proofOfAddress: [],
    ftcReport: [],
  });

  const [isUploadingFiles, setIsUploadingFiles] = useState(false);

  const validateFileSize = (file: File): boolean => {
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      toast.error(
        `File size must be less than 10MB. Current size: ${(
          file.size /
          1024 /
          1024
        ).toFixed(2)}MB`
      );
      return false;
    }
    return true;
  };

  const handleFileUpload = async (
    field: string,
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file size
    if (!validateFileSize(file)) {
      return;
    }

    // Validate file type
    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/gif",
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "text/plain",
    ];

    if (!allowedTypes.includes(file.type)) {
      toast.error(
        "Invalid file type. Please upload images, PDFs, or documents."
      );
      return;
    }

    try {
      const tempFile: UploadedFile = {
        _id: `temp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        fileName: file.name,
        originalName: file.name,
        mimeType: file.type,
        size: file.size,
        uploadedAt: new Date().toISOString(),
        url: URL.createObjectURL(file),
        fileObject: file, // Store the actual file object
      };

      setUploadedFiles((prev) => ({
        ...prev,
        [field]: [...prev[field], tempFile],
      }));

      toast.success(`File "${file.name}" added successfully`);
    } catch (error) {
      toast.error("Failed to add file");
      console.error("File upload error:", error);
    } finally {
      // Reset the file input
      event.target.value = "";
    }
  };

  const removeUploadedFile = (field: string, fileId: string) => {
    setUploadedFiles((prev) => ({
      ...prev,
      [field]: prev[field].filter((file) => file._id !== fileId),
    }));
    toast.success("File removed");
  };

  const handleInputChange = (field: keyof ClientData, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  // Format phone number as user types
  const formatPhoneNumber = (value: string): string => {
    const numbers = value.replace(/\D/g, "");
    if (numbers.length <= 3) return numbers;
    if (numbers.length <= 6)
      return `${numbers.slice(0, 3)}-${numbers.slice(3)}`;
    return `${numbers.slice(0, 3)}-${numbers.slice(3, 6)}-${numbers.slice(
      6,
      10
    )}`;
  };

  const handlePhoneChange = (field: keyof ClientData, value: string) => {
    const formatted = formatPhoneNumber(value);
    handleInputChange(field, formatted);
  };

  // Format SSN as user types
  const formatSSN = (value: string): string => {
    const numbers = value.replace(/\D/g, "");
    if (numbers.length <= 3) return numbers;
    if (numbers.length <= 5)
      return `${numbers.slice(0, 3)}-${numbers.slice(3)}`;
    return `${numbers.slice(0, 3)}-${numbers.slice(3, 5)}-${numbers.slice(
      5,
      9
    )}`;
  };

  const handleSSNChange = (value: string) => {
    const formatted = formatSSN(value);
    handleInputChange("ssn", formatted);
  };

  // Format zip code as user types
  const formatZipCode = (value: string): string => {
    const numbers = value.replace(/\D/g, "");
    if (numbers.length <= 5) return numbers;
    return `${numbers.slice(0, 5)}-${numbers.slice(5, 9)}`;
  };

  const handleZipCodeChange = (value: string) => {
    const formatted = formatZipCode(value);
    handleInputChange("zipCode", formatted);
  };

  const handleSubmit = async () => {
    // Clear previous errors
    setErrors({});

    createClient(
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
        onSuccess: async (response) => {
          const clientId = response.data._id;
          toast.success("Client created successfully");

          // Upload files after client is created
          if (Object.values(uploadedFiles).some((files) => files.length > 0)) {
            setIsUploadingFiles(true);
            try {
              await uploadAllFiles(clientId);
              toast.success("All files uploaded successfully");
            } catch (error) {
              toast.error("Some files failed to upload");
              console.error("File upload error:", error);
            } finally {
              setIsUploadingFiles(false);
            }
          }

          router.push("/clients");
        },
        onError: (error) => {
          try {
            const errorData = JSON.parse((error).message);
            console.log("Error Data: ", errorData);

            if (errorData.errors && Array.isArray(errorData.errors)) {
              const fieldErrors: { [key: string]: string } = {};
              errorData.errors.forEach(
                (err: { field: string; message: string }) => {
                  fieldErrors[err.field] = err.message;
                }
              );

              setErrors(fieldErrors);
              toast.error(errorData.message || "Validation failed");
            } else {
              toast.error(errorData.message || "Failed to create client");
            }
          } catch (error) {
            toast.error((error as Error)?.message || "Failed to create client");
          }
        },
      }
    );
  };

  const uploadAllFiles = async (clientId: string) => {
    const uploadPromises = [];

    for (const [field, files] of Object.entries(uploadedFiles)) {
      for (const file of files) {
        if (file.fileObject) {
          uploadPromises.push(
            uploadFile({
              clientId,
              field,
              file: file.fileObject,
            })
          );
        }
      }
    }

    // Execute all uploads in parallel
    await Promise.all(uploadPromises);
  };

  const FilePreview = ({
    file,
    onRemove,
  }: {
    file: UploadedFile;
    onRemove: () => void;
  }) => (
    <div className="flex items-center justify-between p-2 bg-gray-50 rounded-md border">
      <div className="flex items-center gap-2 flex-1 min-w-0">
        <FileText className="h-4 w-4 text-gray-500 flex-shrink-0" />
        <span className="text-sm text-gray-700 truncate flex-1">
          {file.originalName}
        </span>
        <span className="text-xs text-gray-500 flex-shrink-0">
          ({(file.size / 1024).toFixed(1)} KB)
        </span>
      </div>
      <div className="flex items-center gap-1 flex-shrink-0">
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6"
          onClick={() => window.open(file.url, "_blank")}
          title="Download file"
        >
          <Download className="h-3 w-3" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6 text-red-500"
          onClick={onRemove}
          title="Remove file"
        >
          <X className="h-3 w-3" />
        </Button>
      </div>
    </div>
  );

  const getFieldError = (fieldName: string): string | undefined => {
    return errors[fieldName];
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
        <div className="bg-[#F6F6F6] px-4 sm:px-6 py-4 border-b border-gray-200">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <h1 className="text-lg sm:text-xl font-semibold text-gray-900">
              Add Client
            </h1>
            <div className="flex flex-wrap gap-2">
              <Button
                variant="ghost"
                className="text-sm h-9 w-full sm:w-auto"
                onClick={() => router.push("/clients")}
              >
                Back to clients list
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={isCreating || isUploadingFiles}
                className="primary hover:bg-blue-700 text-white h-9 px-4 w-full sm:w-auto"
              >
                {isCreating
                  ? "Creating..."
                  : isUploadingFiles
                  ? "Uploading files..."
                  : "Add Client"}
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
                  className={`h-10 ${
                    getFieldError("firstName") ? "border-red-500" : ""
                  }`}
                  placeholder="John"
                />
                {getFieldError("firstName") && (
                  <p className="text-red-500 text-xs mt-1">
                    {getFieldError("firstName")}
                  </p>
                )}
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
                  placeholder="Michael"
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
                  className={`h-10 ${
                    getFieldError("lastName") ? "border-red-500" : ""
                  }`}
                  placeholder="Doe"
                />
                {getFieldError("lastName") && (
                  <p className="text-red-500 text-xs mt-1">
                    {getFieldError("lastName")}
                  </p>
                )}
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
                  placeholder="Jr."
                />
              </div>
              <div>
                <Label
                  htmlFor="email"
                  className="text-sm font-medium mb-2 block"
                >
                  Email Address <span className="text-[#DC2626]"> *</span>
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  className={`h-10 ${
                    getFieldError("email") ? "border-red-500" : ""
                  }`}
                  placeholder="john.doe@example.com"
                />
                {getFieldError("email") && (
                  <p className="text-red-500 text-xs mt-1">
                    {getFieldError("email")}
                  </p>
                )}
              </div>
              <div>
                <Label
                  htmlFor="dateOfBirth"
                  className="text-sm font-medium mb-2 block"
                >
                  Date of Birth <span className="text-[#DC2626]"> *</span>
                </Label>
                <div className="relative">
                  <Input
                    id="dateOfBirth"
                    type="date"
                    value={formData.dateOfBirth}
                    onChange={(e) =>
                      handleInputChange("dateOfBirth", e.target.value)
                    }
                    className={`h-10 pr-10 ${
                      getFieldError("dateOfBirth") ? "border-red-500" : ""
                    }`}
                  />
                  <Calendar className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                </div>
                {getFieldError("dateOfBirth") && (
                  <p className="text-red-500 text-xs mt-1">
                    {getFieldError("dateOfBirth")}
                  </p>
                )}
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
                  Mailing Address <span className="text-[#DC2626]"> *</span>
                </Label>
                <Input
                  id="mailingAddress"
                  value={formData.mailingAddress}
                  onChange={(e) =>
                    handleInputChange("mailingAddress", e.target.value)
                  }
                  className={`h-10 ${
                    getFieldError("mailingAddress") ? "border-red-500" : ""
                  }`}
                  placeholder="123 Main St"
                />
                {getFieldError("mailingAddress") && (
                  <p className="text-red-500 text-xs mt-1">
                    {getFieldError("mailingAddress")}
                  </p>
                )}
              </div>

              <div className="w-[315px]">
                <Label
                  htmlFor="city"
                  className="text-sm font-medium mb-2 block"
                >
                  City <span className="text-[#DC2626]"> *</span>
                </Label>
                <Input
                  id="city"
                  value={formData.city}
                  onChange={(e) => handleInputChange("city", e.target.value)}
                  className={`h-10 ${
                    getFieldError("city") ? "border-red-500" : ""
                  }`}
                  placeholder="New York"
                />
                {getFieldError("city") && (
                  <p className="text-red-500 text-xs mt-1">
                    {getFieldError("city")}
                  </p>
                )}
              </div>

              <div className="w-[148px]">
                <Label
                  htmlFor="state"
                  className="text-sm font-medium mb-2 block"
                >
                  State <span className="text-[#DC2626]"> *</span>
                </Label>
                <Select
                  value={formData.state}
                  onValueChange={(value: string) =>
                    handleInputChange("state", value)
                  }
                >
                  <SelectTrigger
                    className={`h-10 w-[148px] ${
                      getFieldError("state") ? "border-red-500" : ""
                    }`}
                  >
                    <SelectValue placeholder="Select state" />
                  </SelectTrigger>
                  <SelectContent>
                    {states.map((state) => (
                      <SelectItem key={state} value={state}>
                        {state}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {getFieldError("state") && (
                  <p className="text-red-500 text-xs mt-1">
                    {getFieldError("state")}
                  </p>
                )}
              </div>

              <div className="w-[148px]">
                <Label
                  htmlFor="zipCode"
                  className="text-sm font-medium mb-2 block"
                >
                  Zip Code <span className="text-[#DC2626]"> *</span>
                </Label>
                <Input
                  id="zipCode"
                  value={formData.zipCode}
                  onChange={(e) => handleZipCodeChange(e.target.value)}
                  className={`h-10 ${
                    getFieldError("zipCode") ? "border-red-500" : ""
                  }`}
                  placeholder="12345 or 12345-6789"
                  maxLength={10}
                />
                {getFieldError("zipCode") && (
                  <p className="text-red-500 text-xs mt-1">
                    {getFieldError("zipCode")}
                  </p>
                )}
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
                  placeholder="United States"
                />
              </div>

              {/* Phone Mobile */}
              <div className="w-[148px]">
                <Label
                  htmlFor="phoneMobile"
                  className="text-sm font-medium mb-2 block"
                >
                  Phone Mobile <span className="text-[#DC2626]"> *</span>
                </Label>
                <Input
                  id="phoneMobile"
                  value={formData.phoneMobile}
                  onChange={(e) =>
                    handlePhoneChange("phoneMobile", e.target.value)
                  }
                  className={`h-10 ${
                    getFieldError("phoneMobile") ? "border-red-500" : ""
                  }`}
                  placeholder="555-123-4567"
                  maxLength={12}
                />
                {getFieldError("phoneMobile") && (
                  <p className="text-red-500 text-xs mt-1">
                    {getFieldError("phoneMobile")}
                  </p>
                )}
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
                    handlePhoneChange("phoneAlternate", e.target.value)
                  }
                  className="h-10"
                  placeholder="555-123-4567"
                  maxLength={12}
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
                    handlePhoneChange("phoneWork", e.target.value)
                  }
                  className="h-10"
                  placeholder="555-123-4567"
                  maxLength={12}
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
                  onChange={(e) => handlePhoneChange("fax", e.target.value)}
                  className="h-10"
                  placeholder="555-123-4567"
                  maxLength={12}
                />
              </div>
            </div>
          </div>
          {/* Additional Information */}
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="ssn" className="text-sm font-medium mb-2 block">
                  SSN <span className="text-[#DC2626]"> *</span>
                </Label>
                <div className="flex items-center gap-2">
                  <Input
                    id="ssn"
                    value={formData.ssn}
                    onChange={(e) => handleSSNChange(e.target.value)}
                    className={`h-10 flex-1 ${
                      getFieldError("ssn") ? "border-red-500" : ""
                    }`}
                    placeholder="123-45-6789"
                    maxLength={11}
                  />
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          className="h-10 w-10"
                          onClick={() => setShowSsnInfo(true)}
                        >
                          <Info className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>SSN Format Information</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
                {getFieldError("ssn") && (
                  <p className="text-red-500 text-xs mt-1">
                    {getFieldError("ssn")}
                  </p>
                )}
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
                  placeholder="EX123456789"
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
                  placeholder="TU123456789"
                />
              </div>
            </div>
          </div>
          {/* Dispute Schedule Information */}
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label
                  htmlFor="disputeScheduleDate"
                  className="text-sm font-medium mb-2 block"
                >
                  Dispute Schedule Date
                </Label>
                <Input
                  id="disputeScheduleDate"
                  type="date"
                  value={formData.disputeScheduleDate}
                  onChange={(e) =>
                    handleInputChange("disputeScheduleDate", e.target.value)
                  }
                  className="h-10"
                />
              </div>
              <div>
                <Label
                  htmlFor="disputeScheduleTime"
                  className="text-sm font-medium mb-2 block"
                >
                  Dispute Schedule Time
                </Label>
                <Input
                  id="disputeScheduleTime"
                  type="time"
                  value={formData.disputeScheduleTime}
                  onChange={(e) =>
                    handleInputChange("disputeScheduleTime", e.target.value)
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

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {[
                { key: "driversLicense", label: "Driver's License" },
                { key: "proofOfSS", label: "Proof of SS" },
                { key: "proofOfAddress", label: "Proof of Address" },
              ].map(({ key, label }) => (
                <div key={key} className="space-y-2">
                  <Label className="text-sm font-medium">{label}</Label>
                  <div className="flex items-center justify-between border border-gray-200 rounded-lg px-3 sm:px-4 py-3 h-auto w-full">
                    <div className="text-[12px] text-[#9D9D9D] truncate">
                      {uploadedFiles[key]?.length > 0
                        ? `${uploadedFiles[key].length} file(s)`
                        : `No files`}
                    </div>
                    <input
                      type="file"
                      id={key}
                      className="hidden"
                      onChange={(e) => handleFileUpload(key, e)}
                      accept=".pdf,.jpg,.jpeg,.png,.doc,.docx,image/*"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="bg-[#2196F3] text-white hover:bg-blue-700 h-8 px-3 shrink-0"
                      onClick={() => document.getElementById(key)?.click()}
                    >
                      <Upload className="h-3 w-3 mr-1" />
                      Upload
                    </Button>
                  </div>

                  {/* Show uploaded files preview */}
                  {uploadedFiles[key]?.length > 0 && (
                    <div className="space-y-2">
                      {uploadedFiles[key].map((file) => (
                        <FilePreview
                          key={file._id}
                          file={file}
                          onRemove={() => removeUploadedFile(key, file._id)}
                        />
                      ))}
                    </div>
                  )}
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
                  <Image
                    src={CloudUpload}
                    alt="Upload"
                    width={51}
                    height={44}
                    className="mx-auto mb-6"
                  />
                </div>
                <div className="text-sm text-gray-600 mb-1">
                  Drop your file here, or{" "}
                  <span className="text-blue-600 underline">Browse</span>
                </div>
                <div className="text-xs text-gray-400">
                  Supports: pdf Max file size 10MB
                </div>
                {uploadedFiles.ftcReport.length > 0 && (
                  <div className="text-sm text-green-600 mt-2">
                    Uploaded: {uploadedFiles.ftcReport.length} file(s)
                    {uploadedFiles.ftcReport.map((file, index) => (
                      <div key={file._id} className="text-xs">
                        {index + 1}. {file.originalName}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* SSN Information Dialog */}
      <Dialog open={showSsnInfo} onOpenChange={setShowSsnInfo}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>SSN Format Information</DialogTitle>
            <DialogDescription>
              Social Security Numbers must be 9 digits and cannot be all zeros.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <p className="text-sm text-gray-600">Valid formats:</p>
            <ul className="text-sm text-gray-600 list-disc list-inside space-y-1">
              <li>123456789 (no dashes)</li>
              <li>123-45-6789 (with dashes)</li>
            </ul>
            <p className="text-sm text-red-500 mt-2">
              Invalid: 000-00-0000 or any all-zero combination
            </p>
          </div>
        </DialogContent>
      </Dialog>
      {/* FTC Report Dialog */}
      <Dialog open={showFtcDialog} onOpenChange={setShowFtcDialog}>
        <DialogContent className="sm:max-w-[974px]">
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold text-[#292524]">
              Upload Your FTC Report
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 flex flex-col lg:flex-row gap-8">
            <div
              className="border-2 border-dashed border-blue-300 rounded-lg p-8 text-center cursor-pointer bg-[#E4E4E7] transition-colors flex-1"
              onClick={() => document.getElementById("ftcReportInput")?.click()}
            >
              <div className="mb-4">
                <Image
                  src={CloudUpload}
                  alt="Upload"
                  width={51}
                  height={44}
                  className="mx-auto mb-6"
                />
              </div>
              <div className="w-full">
                <div className="text-[16px] text-[#040415] mb-1">
                  Drop your file here, or{" "}
                  <span className="text-[16px] text-[#2196F3] underline hover:text-blue-800">
                    Browse
                  </span>
                </div>
                <div className="text-sm text-gray-500">
                  Supports: pdf Max file size 10MB
                </div>
              </div>
              {uploadedFiles.ftcReport.length > 0 && (
                <div className="mt-3 text-sm text-green-600 font-medium">
                  {uploadedFiles.ftcReport.length} file(s) uploaded
                </div>
              )}
            </div>

            <div className="flex-1 space-y-4">
              <div>
                <Label
                  htmlFor="ftcTitle"
                  className="text-sm font-medium text-gray-700"
                >
                  FTC Report Title
                </Label>
                <Input
                  id="ftcTitle"
                  placeholder="Enter report title"
                  className="mt-1 h-10"
                />
              </div>

              {uploadedFiles.ftcReport.length > 0 && (
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-700">
                    Uploaded Files:
                  </Label>
                  {uploadedFiles.ftcReport.map((file) => (
                    <FilePreview
                      key={file._id}
                      file={file}
                      onRemove={() => removeUploadedFile("ftcReport", file._id)}
                    />
                  ))}
                </div>
              )}
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
  );
}

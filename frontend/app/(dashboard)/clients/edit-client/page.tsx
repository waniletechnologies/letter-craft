// EditClientForm.tsx - Complete updated component
"use client";
import React, { useEffect, useMemo, useState, Suspense } from "react";
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
import { Calendar, Upload, X, FileText, Download, Trash2 } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import { UploadFile } from "../../../../public/images";
import {
  useGetClient,
  useUpdateClient,
  useUploadClientFile,
  useDeleteClientFile,
  useGetClientFiles,
  type UploadedFile,
  type ClientFiles,
} from "@/hooks/clients";
import { toast } from "sonner";
import Loader from "@/components/Loader";

function EditClientForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const clientId = useMemo(() => searchParams.get("id") || "", [searchParams]);
  const { data, isLoading, error } = useGetClient(clientId);
  const { data: clientFiles, refetch: refetchFiles } =
    useGetClientFiles(clientId);
  const updateMutation = useUpdateClient(clientId);
  const uploadFileMutation = useUploadClientFile();
  const deleteFileMutation = useDeleteClientFile();

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
    
    fax: string;
    ssn: string;
    experianReportNumber: string;
    transUnionFileNumber: string;
    
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
    
    fax: "",
    ssn: "",
    experianReportNumber: "",
    transUnionFileNumber: "",
    
  });

  const [tempFiles, setTempFiles] = useState<{
    [key: string]: File[];
  }>({
    driversLicense: [],
    proofOfSS: [],
    proofOfAddress: [],
    ftcReport: [],
  });

  useEffect(() => {
    const client = data?.data;
    if (!client) return;

    setFormData({
      firstName: client.firstName || "",
      middleName: client.middleName || "",
      lastName: client.lastName || "",
      suffix: client.suffix || "",
      email: client.email || "",
      dateOfBirth: client.dateOfBirth
        ? new Date(client.dateOfBirth).toISOString().split("T")[0]
        : "",
      mailingAddress: client.mailingAddress || "",
      city: client.city || "",
      state: client.state || "",
      zipCode: client.zipCode || "",
      country: client.country || "United States",
      phoneMobile: client.phoneMobile || "",
      
      fax: client.fax || "",
      ssn: client.ssn || "", // keep hidden; not returned by API by default
      experianReportNumber: client.experianReport || "",
      transUnionFileNumber: client.transunionFileNumber || "",
      
    });
  }, [data]);

  const handleInputChange = (field: keyof ClientData, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleFileUpload = async (
    field: string,
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file size (10MB limit)
    if (file.size > 10 * 1024 * 1024) {
      toast.error("File size must be less than 10MB");
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
      // Upload file immediately for existing client
      if (clientId) {
        await uploadFileMutation.mutateAsync({
          clientId,
          field,
          file,
        });
        toast.success(`File "${file.name}" uploaded successfully`);
        refetchFiles();
      } else {
        // For new clients, store temporarily
        setTempFiles((prev) => ({
          ...prev,
          [field]: [...prev[field], file],
        }));
        toast.success(`File "${file.name}" added successfully`);
      }
    } catch (error) {
      toast.error("Failed to upload file");
      console.error("File upload error:", error);
    }

    // Reset the file input
    event.target.value = "";
  };

  const handleFileDelete = async (field: string, fileId: string) => {
    try {
      await deleteFileMutation.mutateAsync({
        clientId,
        field,
        fileId,
      });
      toast.success("File deleted successfully");
      refetchFiles();
    } catch (error) {
      toast.error("Failed to delete file");
      console.error("File delete error:", error);
    }
  };

  const handleSubmit = () => {
    updateMutation.mutate(
      {
        firstName: formData.firstName,
        middleName: formData.middleName || undefined,
        lastName: formData.lastName,
        suffix: formData.suffix || undefined,
        email: formData.email,
        dateOfBirth: formData.dateOfBirth,
        mailingAddress: formData.mailingAddress,
        city: formData.city,
        state: formData.state,
        zipCode: formData.zipCode,
        country: formData.country,
        phoneMobile: formData.phoneMobile,
        fax: formData.fax || undefined,
        experianReport: formData.experianReportNumber || undefined,
        transunionFileNumber: formData.transUnionFileNumber || undefined,
      },
      {
        onSuccess: () => {
          toast.success("Client updated successfully");
          router.push("/clients");
        },
        onError: (error) => {
          console.error(error);
          toast.error(
            (error as { response?: { data?: { message?: string } } }).response
              ?.data?.message || "Failed to update client"
          );
        },
      }
    );
  };

  // Helper function to get file icon based on type
  const getFileIcon = (mimeType: string) => {
    if (mimeType.startsWith("image/")) return "🖼️";
    if (mimeType === "application/pdf") return "📄";
    if (mimeType.includes("word") || mimeType.includes("document")) return "📝";
    return "📁";
  };

  // Helper function to format file size
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  if (!clientId) {
    return <div className="p-6">Missing client id</div>;
  }

  if (isLoading) {
    return <Loader />;
  }

  if (error) {
    return <div className="p-6">Failed to load client</div>;
  }

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
              Edit Client
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
                disabled={updateMutation.isPending}
                className="primary hover:bg-blue-700 text-white h-9 px-4 w-full sm:w-auto"
              >
                {updateMutation.isPending ? "Updating..." : "Update Client"}
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

              <div className="w-[148px]">
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
                  className="h-10"
                />
              </div>
            </div>
          </div>

          {/* Contact Information */}
          <div className="space-y-4">
            <div className="flex flex-wrap gap-4">
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

              <div className="w-[311px]">
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

          

              <div className="w-[311px]">
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

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { key: "driversLicense", label: "Driver's License" },
                { key: "proofOfSS", label: "Proof of SS" },
                { key: "proofOfAddress", label: "Proof of Address" },
                { key: "ftcReport", label: "FTC Report" },
              ].map(({ key, label }) => (
                <div key={key} className="space-y-3">
                  <Label className="text-sm font-medium">{label}</Label>

                  {/* File upload input */}
                  <div className="border border-gray-200 rounded-lg p-4 text-center">
                    <input
                      type="file"
                      id={key}
                      className="hidden"
                      onChange={(e) => handleFileUpload(key, e)}
                      accept=".pdf,.jpg,.jpeg,.png,.doc,.docx,image/*"
                    />
                    <label htmlFor={key} className="cursor-pointer block">
                      <div className="text-sm text-gray-600 mb-3">
                        Upload {label}
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        className="cursor-pointer bg-[#2196F3] text-white hover:bg-blue-700 h-8 px-3 w-full"
                      >
                        <Upload className="h-3 w-3 mr-1" />
                        Upload
                      </Button>
                    </label>
                  </div>

                  {/* Uploaded files list */}
                  <div className="space-y-2">
                    {/* Show actual uploaded files from server */}
                    {clientFiles?.data?.[key]?.map((file: UploadedFile) => (
                      <div
                        key={file._id}
                        className="flex items-center justify-between p-2 bg-gray-50 rounded-md border"
                      >
                        <div className="flex items-center gap-2 flex-1 min-w-0">
                          <span className="text-sm">
                            {getFileIcon(file.mimeType)}
                          </span>
                          <div className="flex-1 min-w-0">
                            <div className="text-sm text-gray-700 truncate">
                              {file.originalName}
                            </div>
                            <div className="text-xs text-gray-500">
                              {formatFileSize(file.size)}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6"
                            onClick={() =>
                              window.open(
                                `/api/clients/${clientId}/files/${key}/${file._id}`,
                                "_blank"
                              )
                            }
                          >
                            <Download className="h-3 w-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 text-red-500"
                            onClick={() => handleFileDelete(key, file._id)}
                            disabled={deleteFileMutation.isPending}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    ))}

                    {/* Show temporary files (for new uploads) */}
                    {tempFiles[key]?.map((file, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-2 bg-blue-50 rounded-md border"
                      >
                        <div className="flex items-center gap-2 flex-1 min-w-0">
                          <span className="text-sm">
                            {getFileIcon(file.type)}
                          </span>
                          <div className="flex-1 min-w-0">
                            <div className="text-sm text-gray-700 truncate">
                              {file.name}
                            </div>
                            <div className="text-xs text-gray-500">
                              {formatFileSize(file.size)}
                            </div>
                          </div>
                        </div>
                        <span className="text-xs text-blue-600">
                          Pending upload
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function EditClientPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gray-50 p-6">
          <div className="max-w-5xl mx-auto bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="bg-[#F6F6F6] px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <h1 className="text-xl font-semibold text-gray-900">
                    Edit Client
                  </h1>
                </div>
                <div className="flex gap-2">
                  <div className="h-9 w-32 bg-gray-200 rounded animate-pulse"></div>
                  <div className="h-9 w-24 bg-gray-200 rounded animate-pulse"></div>
                </div>
              </div>
            </div>
            <div className="p-6">
              <div className="animate-pulse space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="h-10 bg-gray-200 rounded"></div>
                  <div className="h-10 bg-gray-200 rounded"></div>
                  <div className="h-10 bg-gray-200 rounded"></div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="h-10 bg-gray-200 rounded"></div>
                  <div className="h-10 bg-gray-200 rounded"></div>
                  <div className="h-10 bg-gray-200 rounded"></div>
                </div>
                <div className="flex flex-wrap gap-4">
                  <div className="h-10 bg-gray-200 rounded w-[311px]"></div>
                  <div className="h-10 bg-gray-200 rounded w-[315px]"></div>
                  <div className="h-10 bg-gray-200 rounded w-[148px]"></div>
                  <div className="h-10 bg-gray-200 rounded w-[148px]"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      }
    >
      <EditClientForm />
    </Suspense>
  );
}

"use client"

import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Clock, 
  CheckCircle, 
  XCircle, 
  Eye, 
  FileEdit, 
  Download,
  AlertCircle
} from "lucide-react";
import { cn } from "@/lib/utils";

export interface DisputeCardProps {
  id: string;
  clientName: string;
  round: number;
  status: "in-progress" | "completed" | "pending" | "failed";
  progress: number;
  bureau: string;
  accountsCount: number;
  createdDate: string;
  expectedResponseDate: string;
  onViewDetails?: () => void;
  onEditDispute?: () => void;
  onDownloadLetters?: () => void;
}

const getStatusIcon = (status: DisputeCardProps["status"]) => {
  switch (status) {
    case "in-progress":
      return <Clock className="h-4 w-4 text-primary" />;
    case "completed":
      return <CheckCircle className="h-4 w-4 text-[#00A650]" />;
    case "pending":
      return <AlertCircle className="h-4 w-4 text-[#FFA048]" />;
    case "failed":
      return <XCircle className="h-5 w-5 text-red-600" />;
    default:
      return <Clock className="h-5 w-5 text-blue-600" />;
  }
};

const getStatusBadge = (status: DisputeCardProps["status"]) => {
  const baseClasses = "px-3 py-1 rounded-full text-xs font-medium text-white";
  
  switch (status) {
    case "in-progress":
      return (
        <Badge className={cn(baseClasses, "bg-[#5881F0]")}>
          In Progress
        </Badge>
      );
    case "completed":
      return (
        <Badge className={cn(baseClasses, "bg-[#00A650]")}>
          Completed
        </Badge>
      );
    case "pending":
      return (
        <Badge className={cn(baseClasses, "bg-[#FFA048]")}>
          Pending
        </Badge>
      );
    case "failed":
      return (
        <Badge className={cn(baseClasses, "bg-red-600")}>
          Failed
        </Badge>
      );
    default:
      return (
        <Badge className={cn(baseClasses, "bg-gray-600")}>
          Unknown
        </Badge>
      );
  }
};

const getProgressBarColor = (status: DisputeCardProps["status"]) => {
  switch (status) {
    case "in-progress":
      return "bg-blue-600";
    case "completed":
      return "bg-green-600";
    case "pending":
      return "bg-orange-600";
    case "failed":
      return "bg-red-600";
    default:
      return "bg-blue-600";
  }
};

export const DisputeCard: React.FC<DisputeCardProps> = ({
  clientName,
  round,
  status,
  progress,
  bureau,
  accountsCount,
  createdDate,
  expectedResponseDate,
  onViewDetails,
  onEditDispute,
  onDownloadLetters,
}) => {
  const progressBarColor = getProgressBarColor(status);

  return (
    <Card className="w-full bg-white border-none shadow-none p-0">
      <CardContent className="px-8 py-6">
        {/* Header Section */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="flex flex-col gap-2">
                <div className="flex gap-1 items-center">
                    {getStatusIcon(status)}
                    <h3 className="font-semibold text-[24px] leading-[17.84px] -tracking-[0.03em] text-[#3D3D3D]">
                        {clientName} - Round {round}
                    </h3>
              </div>
              <p className="font-medium text-xs leading-[11px] -tracking-[0.03em] ml-5 text-[#9F98AA]">
                Dispute with {bureau} • {accountsCount} account{accountsCount !== 1 ? 's' : ''}
              </p>
            </div>
          </div>
          {getStatusBadge(status)}
        </div>

        {/* Progress Section */}
        <div className="mb-6 px-4">
          <div className="flex items-center justify-between mb-2">
            <span className="font-medium text-xs leading-[11px] -tracking-[0.03em] text-[#3D3D3D]">Progress</span>
            <span className="font-medium text-xs leading-[11px] -tracking-[0.03em] text-[#3D3D3D]">{progress}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-[11px]">
            <div 
              className={cn("h-[11px] rounded-full transition-all duration-300", progressBarColor)}
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Date Information */}
        <div className="flex justify-between max-w-[425px] mb-6 px-4">
          <div>
            <p className="font-medium text-xs leading-[11px] -tracking-[0.03em] text-[#3D3D3DB2]/70 mb-1">Created</p>
            <p className="font-medium text-xs leading-[11px] -tracking-[0.03em] text-[#3D3D3D]">{createdDate}</p>
          </div>
          <div>
            <p className="font-medium text-xs leading-[11px] -tracking-[0.03em] text-[#3D3D3DB2]/70 mb-1">Expected Response</p>
            <p className="font-medium text-xs leading-[11px] -tracking-[0.03em] text-[#3D3D3D]">{expectedResponseDate}</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex w-1/2 gap-3 px-4">
          <Button
            variant="outline"
            size="sm"
            onClick={onViewDetails}
            className="bg-[#FFFFFF] lg:min-w-[177px] shadow-none border-[#00000014] text-[#3D3D3D] py-4"
          >
            <Eye className="h-4 w-4" />
            View Details
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={onEditDispute}
            className="bg-[#FFFFFF] lg:min-w-[177px] shadow-none border-[#00000014] text-[#3D3D3D] py-4"
          >
            <FileEdit className="h-4 w-4" />
            Edit Dispute
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={onDownloadLetters}
            className="bg-[#FFFFFF] lg:min-w-[177px] shadow-none border-[#00000014] text-[#3D3D3D] py-4"
          >
            <Download className="h-4 w-4" />
            Download Letters
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default DisputeCard;

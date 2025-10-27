/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect, JSX } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  CreditCard,
  TrendingUp,
  AlertCircle,
  FileText,
} from "lucide-react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { useGetClient } from "@/hooks/clients";
import { getAccountGroupsByEmail } from "@/lib/accountGroupApi";
import { Equifax, Experian, TransUnion } from "@/public/images";

/* ------------------------------- TYPES ------------------------------- */
interface Account {
  accountName?: string;
  accountNumber?: string;
  bureau: "Experian" | "Equifax" | "TransUnion";
  currentBalance?: string | number;
  dateOpened?: string;
  payStatus?: string;
  groupName?: string; // added dynamically
}

interface AccountGroup {
  groups: Record<string, unknown[]>; // loosened
  groupOrder: string[];
}


interface BureauData {
  Experian: Account[];
  Equifax: Account[];
  TransUnion: Account[];
}

export default function ClientDetailPage() {
  const params = useParams();
  const router = useRouter();
  const clientId = params.id as string;

  const [selectedBureau, setSelectedBureau] = useState<
    "Experian" | "Equifax" | "TransUnion" | null
  >(null);
  const [accountGroups, setAccountGroups] = useState<AccountGroup | null>(null);
  const [bureauData, setBureauData] = useState<BureauData>({
    Experian: [],
    Equifax: [],
    TransUnion: [],
  });
  const [loading, setLoading] = useState(true);

  const {
    data: clientResponse,
    isLoading: clientLoading,
    error: clientError,
  } = useGetClient(clientId);
  const client = clientResponse?.data;

  useEffect(() => {
    if (client?.email) loadAccountGroups(client.email);
  }, [client]);

  const loadAccountGroups = async (email: string) => {
    try {
      setLoading(true);
      const response = await getAccountGroupsByEmail(email);
      if (response.success && response.data) {
        setAccountGroups(response.data);

        const bureauAccounts = {
          Experian: [],
          Equifax: [],
          TransUnion: [],
        } as BureauData;
        Object.entries(response.data.groups).forEach(
          ([groupName, accounts]) => {
            accounts.forEach((account: any) => {
              bureauAccounts[account.bureau as keyof BureauData].push({
                ...account,
                groupName,
              });
            });
          }
        );
        setBureauData(bureauAccounts);

        if (bureauAccounts.Experian.length) setSelectedBureau("Experian");
        else if (bureauAccounts.Equifax.length) setSelectedBureau("Equifax");
        else if (bureauAccounts.TransUnion.length)
          setSelectedBureau("TransUnion");
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to load account groups");
    } finally {
      setLoading(false);
    }
  };

  const getBureauCount = (b: keyof BureauData) => bureauData[b].length;
  const getTotalDisputeAccounts = () =>
    bureauData.Experian.length +
    bureauData.Equifax.length +
    bureauData.TransUnion.length;

  if (clientLoading)
    return (
      <div className="flex items-center justify-center min-h-screen text-lg text-gray-700">
        Loading client details...
      </div>
    );

  if (clientError || !client)
    return (
      <div className="flex items-center justify-center min-h-screen text-lg text-red-600">
        Client not found
      </div>
    );

  return (
    <div className="min-h-screen ">
      <div className="p-4 sm:p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            onClick={() => router.back()}
            className="flex items-center gap-2 border-gray-300 hover:bg-gray-50"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
            {client.fullName || `${client.firstName} ${client.lastName}`}
          </h1>
        </div>

        <div className="space-y-6 ">
          {/* Client Info */}
          <Card className="shadow-sm border border-gray-200 ">
            <CardHeader className="border-b border-gray-200 bg-white pb-4 ">
              <CardTitle className="flex items-center gap-2 text-lg font-semibold text-gray-900 ">
                <User className="h-5 w-5 text-gray-700" />
                Client Information
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <InfoItem
                  icon={<Mail className="h-4 w-4" />}
                  label="Email"
                  value={client.email}
                />
                <InfoItem
                  icon={<Phone className="h-4 w-4" />}
                  label="Phone"
                  value={client.phoneMobile}
                />
                <InfoItem
                  icon={<MapPin className="h-4 w-4" />}
                  label="Address"
                  value={`${client.mailingAddress}, ${client.city}, ${client.state} ${client.zipCode}`}
                  className="md:col-span-2"
                />
                <InfoItem
                  icon={<Calendar className="h-4 w-4" />}
                  label="Date of Birth"
                  value={new Date(client.dateOfBirth).toLocaleDateString()}
                />
                <div className="flex items-center justify-between md:col-span-2 pt-2">
                  <span className="text-sm font-medium text-gray-700">
                    Status:
                  </span>
                  <Badge
                    className={`px-3 py-1 text-sm font-medium ${
                      client.status === "active"
                        ? "bg-green-100 text-green-800 border-green-200"
                        : "bg-red-100 text-red-800 border-red-200"
                    }`}
                  >
                    {client.status.charAt(0).toUpperCase() +
                      client.status.slice(1)}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Bureau Data */}
          <Card className="shadow-sm border border-gray-200">
            <CardHeader className="border-b border-gray-200 bg-white pb-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <CardTitle className="flex items-center gap-2 text-lg font-semibold text-gray-900">
                  <CreditCard className="h-5 w-5 text-gray-700" />
                  Dispute Accounts by Bureau
                </CardTitle>
                <div className="flex gap-4 text-sm">
                  <div className="flex items-center gap-1 bg-gray-100 px-3 py-1 rounded-full">
                    <TrendingUp className="h-4 w-4 text-gray-600" />
                    <span className="text-gray-700">
                      {getTotalDisputeAccounts()} accounts
                    </span>
                  </div>
                  <div className="flex items-center gap-1 bg-gray-100 px-3 py-1 rounded-full">
                    <AlertCircle className="h-4 w-4 text-gray-600" />
                    <span className="text-gray-700">
                      {accountGroups
                        ? Object.keys(accountGroups.groups).length
                        : 0}{" "}
                      groups
                    </span>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              {/* Bureau Buttons */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-8">
                {(["Experian", "Equifax", "TransUnion"] as const).map((b) => (
                  <Button
                    key={b}
                    onClick={() => setSelectedBureau(b)}
                    disabled={!getBureauCount(b)}
                    variant={selectedBureau === b ? "default" : "outline"}
                    className={`flex items-center gap-3 p-4 h-auto transition-all ${
                      selectedBureau === b
                        ? "bg-gray-900 text-white hover:bg-gray-800 shadow-md"
                        : "border-gray-300 hover:bg-gray-50 text-gray-700"
                    } ${
                      !getBureauCount(b) ? "opacity-50 cursor-not-allowed" : ""
                    }`}
                  >
                    <img
                      src={`/images/${b.toLowerCase()}.svg`}
                      alt={b}
                      className="h-6 w-6 rounded-full"
                    />
                    <div className="text-left flex-1">
                      <div className="font-semibold text-sm">{b}</div>
                      <div className="text-xs opacity-80">
                        {getBureauCount(b)} account
                        {getBureauCount(b) !== 1 ? "s" : ""}
                      </div>
                    </div>
                  </Button>
                ))}
              </div>

              {/* Bureau Accounts List */}
              {selectedBureau && (
                <div className="max-h-[50vh] overflow-y-auto pr-2 custom-scrollbar">
                  {loading ? (
                    <div className="text-center py-8">
                      <div className="animate-spin w-6 h-6 border-3 border-gray-900 border-t-transparent rounded-full mx-auto"></div>
                      <p className="text-sm text-gray-500 mt-2">
                        Loading accounts...
                      </p>
                    </div>
                  ) : bureauData[selectedBureau].length === 0 ? (
                    <div className="text-center py-8">
                      <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                        <FileText className="h-6 w-6 text-gray-400" />
                      </div>
                      <p className="text-sm text-gray-500">
                        No accounts found for {selectedBureau}
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {bureauData[selectedBureau].map((account, i) => (
                        <div
                          key={i}
                          className="p-4 border border-gray-200 rounded-lg bg-white hover:shadow-sm hover:border-gray-300 transition-all"
                        >
                          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2 mb-3">
                            <h4 className="font-semibold text-gray-900 text-sm">
                              {account.accountName || "Unknown Account"}
                            </h4>
                            <div className="flex items-center gap-2">
                              <Badge className="text-xs bg-blue-50 text-blue-700 border-blue-200">
                                {account.groupName || "Ungrouped"}
                              </Badge>
                              <div className="flex gap-1">
                                <div
                                  className={`w-6 h-6 flex items-center justify-center rounded ${
                                    account.bureau === "Experian"
                                      ? "bg-blue-100"
                                      : "bg-gray-100"
                                  }`}
                                >
                                  {account.bureau === "Experian" ? (
                                    <Image
                                      src={Experian}
                                      alt="Experian"
                                      width={20}
                                      height={10}
                                    />
                                  ) : (
                                    <span className="text-gray-400 text-xs">
                                      E
                                    </span>
                                  )}
                                </div>
                                <div
                                  className={`w-6 h-6 flex items-center justify-center rounded ${
                                    account.bureau === "Equifax"
                                      ? "bg-green-100"
                                      : "bg-gray-100"
                                  }`}
                                >
                                  {account.bureau === "Equifax" ? (
                                    <Image
                                      src={Equifax}
                                      alt="Equifax"
                                      width={20}
                                      height={10}
                                    />
                                  ) : (
                                    <span className="text-gray-400 text-xs">
                                      E
                                    </span>
                                  )}
                                </div>
                                <div
                                  className={`w-6 h-6 flex items-center justify-center rounded ${
                                    account.bureau === "TransUnion"
                                      ? "bg-purple-100"
                                      : "bg-gray-100"
                                  }`}
                                >
                                  {account.bureau === "TransUnion" ? (
                                    <Image
                                      src={TransUnion}
                                      alt="TransUnion"
                                      width={20}
                                      height={10}
                                    />
                                  ) : (
                                    <span className="text-gray-400 text-xs">
                                      T
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                          <p className="text-xs text-gray-500 mb-3">
                            Account #: {account.accountNumber}
                          </p>
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                            <DataItem
                              label="Balance"
                              value={account.currentBalance || "N/A"}
                            />
                            <DataItem
                              label="Date Opened"
                              value={account.dateOpened || "N/A"}
                            />
                            <DataItem
                              label="Status"
                              value={account.payStatus || "N/A"}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Smooth Scrollbar */}
      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background-color: rgba(156, 163, 175, 0.5);
          border-radius: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background-color: rgba(156, 163, 175, 0.7);
        }
      `}</style>
    </div>
  );
}

function InfoItem({
  icon,
  label,
  value,
  className = "",
}: {
  icon: JSX.Element;
  label: string;
  value: string;
  className?: string;
}) {
  return (
    <div
      className={`flex items-start gap-3 p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition ${className}`}
    >
      <div className="w-8 h-8 bg-white border border-gray-200 rounded-full flex items-center justify-center text-gray-600 flex-shrink-0">
        {icon}
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-gray-700">{label}</p>
        <p className="text-sm text-gray-600 truncate">{value}</p>
      </div>
    </div>
  );
}

function DataItem({ label, value }: { label: string; value: number |string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-gray-600">{label}:</span>
      <span className="font-medium text-gray-900">{value}</span>
    </div>
  );
}

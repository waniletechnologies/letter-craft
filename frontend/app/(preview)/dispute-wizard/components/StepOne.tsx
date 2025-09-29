"use client";

import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { useSearchParams, useRouter } from "next/navigation";
import Image from "next/image";
import { Equifax, Experian, TransUnion } from "@/public/images";
import AddDisputeItemsDialog from "./AddDisputeItemsDialog";
import { fetchStoredCreditReport } from "@/lib/creditReportApi"; // Assuming you have this client-side service
import { saveDispute } from "@/lib/disputeAPI";
import { DisputePayload, DisputedItemPayload } from "@/types/dispute";
import {  PersonalInfo } from "@/types/creditReport";
import { useDispute, DisputeItem } from "@/context/disputeContext";
import { Trash2 } from "lucide-react";
// The shape of personalInfo in CreditReportData
type PersonalInfoByBureau = {
  Experian: PersonalInfo;
  Equifax: PersonalInfo;
  TransUnion: PersonalInfo;
};
// Helper function to get full name
// ✅ Safely get the first name entry from personalInfo
const getClientName = (personalInfo: PersonalInfoByBureau): string => {
  const bureaus = ["Experian", "Equifax", "TransUnion"] as const;

  for (const bureau of bureaus) {
    const names = personalInfo?.[bureau]?.names;
    if (Array.isArray(names) && names.length > 0) {
      const { first = "", last = "" } = names[0];
      return `${first} ${last}`.trim() || "Client";
    }
  }
  return "Client";
};


const StepOne: React.FC = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email") || "";
  const [dialogOpen, setDialogOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const {
    disputeItems,
    addMultipleDisputeItems,
    removeDisputeItem,
    loadAccountGroups,
    saveDisputeItems,
  } = useDispute();

  useEffect(() => {
    if (email) {
      loadAccountGroups(email);
    }
  }, [email, loadAccountGroups]);

  const groupedDisputeItems = disputeItems.reduce((groups, item) => {
    const groupName = item.groupName || "Ungrouped";
    if (!groups[groupName]) {
      groups[groupName] = [];
    }
    groups[groupName].push(item);
    return groups;
  }, {} as Record<string, typeof disputeItems>);

  const handleAddDisputeItems = (ids: string[]) => {
    // This function remains for adding items to the list before saving
    const newItems: DisputeItem[] = ids.map((id) => ({
      id,
      creditor: "Creditor " + id.slice(-4),
      account: "5555" + id.slice(-4),
      dateOpened: "01/01/2023",
      balance: "$1,000",
      type: "Type",
      disputed: false,
      hasExperian: true,
      hasEquifax: true,
      hasTransUnion: false,
    }));

    const currentIds = new Set(disputeItems.map((item) => item.id));
    const uniqueNewItems = newItems.filter((item) => !currentIds.has(item.id));
    addMultipleDisputeItems([...disputeItems, ...uniqueNewItems]);
  };

  const handleSaveDisputes = async () => {
    if (disputeItems.length === 0) {
      alert("Please add dispute items before saving.");
      return;
    }
    setIsSaving(true);

    try {
      // 1. Fetch the full credit report data
      const reportResponse = await fetchStoredCreditReport(email);
      if (!reportResponse.success || !reportResponse.data) {
        throw new Error(
          reportResponse.message || "Could not fetch credit report."
        );
      }

      const creditReport = reportResponse.data;
      const clientName = getClientName(creditReport.personalInfo);

      // 2. Group selected dispute items by bureau
      const disputesByBureau: { [key: string]: DisputedItemPayload[] } = {
        Experian: [],
        Equifax: [],
        TransUnion: [],
      };

      const allBureauAccounts = {
        Experian: creditReport.accountInfo?.Experian || [],
        Equifax: creditReport.accountInfo?.Equifax || [],
        TransUnion: creditReport.accountInfo?.TransUnion || [],
      };

      for (const item of disputeItems) {
        const bureaus: ("Experian" | "Equifax" | "TransUnion")[] = [];
        if (item.hasExperian) bureaus.push("Experian");
        if (item.hasEquifax) bureaus.push("Equifax");
        if (item.hasTransUnion) bureaus.push("TransUnion");

        for (const bureau of bureaus) {
          // Find the matching account in the full report to get the title
          const accountDetails = allBureauAccounts[bureau].find(
            (acc: { accountNumber: string }) =>
              acc.accountNumber === item.account
          );

          // The title is the negative reason, e.g., "Coll/Chargeoff"
          const title =
            accountDetails?.worstPayStatus ||
            accountDetails?.payStatus ||
            "Derogatory";

          disputesByBureau[bureau].push({
            title,
            account: item.account,
            status: "Pending",
          });
        }
      }

      // 3. Create and save a dispute for each bureau with items
      for (const bureau of Object.keys(disputesByBureau)) {
        const itemsForBureau = disputesByBureau[bureau];
        if (itemsForBureau.length > 0) {
          const createdDate = new Date();
          const expectedResponseDate = new Date();
          expectedResponseDate.setDate(createdDate.getDate() + 14); // 2 weeks later

          const payload: DisputePayload = {
            clientName,
            bureau: bureau as "Experian" | "Equifax" | "TransUnion",
            round: 1, // Default round
            status: "pending", // Default status
            progress: 0, // Default progress
            createdDate,
            expectedResponseDate,
            accountsCount: itemsForBureau.length,
            items: itemsForBureau,
          };

          await saveDispute(payload);
        }
      }

      alert("Disputes saved successfully!");
      addMultipleDisputeItems([]); // Clear items after saving
      router.push("/disputes");
    } catch (error) {
      console.error("Failed to save disputes:", error);
      alert(
        `Error: ${
          error instanceof Error ? error.message : "Could not save disputes."
        }`
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveAndContinue = async () => {
    if (disputeItems.length === 0) {
      alert("Please add dispute items before saving.");
      return;
    }
    setIsSaving(true);

    try {
      // Save dispute items to context and localStorage
      saveDisputeItems(disputeItems);

      // Navigate to generate letter page with necessary parameters
      router.push(
        `/dispute-wizard/generate-letter?email=${encodeURIComponent(
          email
        )}&category=dispute&letter=dispute-letter`
      );
    } catch (error) {
      console.error("Failed to save disputes:", error);
      alert(
        `Error: ${
          error instanceof Error ? error.message : "Could not save disputes."
        }`
      );
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="rounded-lg border border-[#E5E7EB] bg-white">
      <div className="flex items-center justify-between px-4 py-3 border-b border-[#E5E7EB] bg-[#F9FAFB] rounded-t-lg">
        <div className="text-sm">
          <span className="font-semibold">Step 1:</span> Add Dispute Items
        </div>
        <div className="flex items-center gap-3">
          <button
            className="text-xs text-[#2563EB]"
            onClick={() => setDialogOpen(true)}
          >
            + Add Dispute Item
          </button>
          <Button
            className="bg-primary hover:bg-primary/90"
            onClick={handleSaveDisputes}
            disabled={isSaving}
          >
            {isSaving ? "Saving..." : "Saved Dispute Item"}
          </Button>
        </div>
      </div>

      <div className="p-4">
        {/* Grouped Display */}
        <div className="space-y-4">
          {Object.entries(groupedDisputeItems).map(([groupName, items]) => (
            <div key={groupName} className="border border-gray-200 rounded-lg">
              {/* Group Header */}
              <div className="bg-blue-50 px-3 py-2 border-b border-gray-200">
                <h3 className="font-semibold text-blue-800">
                  📁 {groupName} ({items.length} accounts)
                </h3>
              </div>

              {/* Group Content */}
              <div className="overflow-x-auto">
                <div className="grid grid-cols-10 min-w-[900px] bg-gray-50 text-xs font-medium text-gray-600 px-3 py-2 gap-2">
                  <div>Creditor</div>
                  <div>Account #</div>
                  <div>Date Opened</div>
                  <div>Balance</div>
                  <div>Type</div>
                  <div>Disputed</div>
                  <div className="text-center">
                    <Image
                      src={Experian}
                      alt="Experian"
                      width={54}
                      height={14}
                    />
                  </div>
                  <div className="text-center">
                    <Image src={Equifax} alt="Equifax" width={54} height={14} />
                  </div>
                  <div className="text-center">
                    <Image
                      src={TransUnion}
                      alt="TransUnion"
                      width={54}
                      height={14}
                    />
                  </div>
                  <div className="text-center">Action</div>
                </div>

                {items.map((item, idx) => (
                  <div
                    key={item.id}
                    className={`grid grid-cols-10 min-w-[900px] items-center px-3 py-2 border-t gap-2 ${
                      idx % 2 === 0 ? "bg-white" : "bg-gray-50"
                    }`}
                  >
                    <div className="truncate">{item.creditor}</div>
                    <div className="truncate">{item.account}</div>
                    <div className="truncate">{item.dateOpened}</div>
                    <div className="truncate">{item.balance}</div>
                    <div className="truncate">---</div>
                    <div className="truncate">
                      {item.disputed ? "YES" : "NO"}
                    </div>
                    <div className="ml-[10px] text-green-500">
                      {item.hasExperian && "✔"}
                    </div>
                    <div className="ml-[10px] text-green-500">
                      {item.hasEquifax && "✔"}
                    </div>
                    <div className="ml-[10px] text-green-500">
                      {item.hasTransUnion && "✔"}
                    </div>
                    <div
                      className="flex items-center justify-center text-red-500 cursor-pointer"
                      onClick={() => removeDisputeItem(item.id)}
                    >
                      <Trash2 className="h-3 w-3 text-red-500" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Show empty state */}
        {disputeItems.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            No dispute items added yet. Click &quot;+ Add Dispute Item&quot; to
            get started.
          </div>
        )}

        {/* Buttons */}
        {disputeItems.length > 0 && (
          <div className="flex justify-end mt-4">
            <Button
              className="bg-[#2196F3] hover:bg-[#1976D2]"
              onClick={handleSaveAndContinue}
              disabled={isSaving}
            >
              {isSaving ? "Saving..." : "Save & Continue"}
            </Button>
          </div>
        )}
      </div>

      <AddDisputeItemsDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onAdd={handleAddDisputeItems}
        email={email}
      />
    </div>
  );
};

export default StepOne;

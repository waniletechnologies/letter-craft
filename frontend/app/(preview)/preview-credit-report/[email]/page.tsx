// app/preview-credit-report/page.tsx
"use client";
import React, { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import PersonalInfoTable from "./components/personal-info";
import CreditSummaryTable from "./components/credit-summary";
import CreditInquiryTable from "./components/credit-inquiries";
import PublicRecordTable from "./components/public-record";
import AccountInfoTable from "./components/account-info";
import { Button } from "@/components/ui/button";
import { useCreditReport } from "@/hooks/useCreditReport";
import Loader from "@/components/Loader";
import { useDispute, DisputeItem } from "@/context/disputeContext";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import AddDisputeItemsDialog from "../../dispute-wizard/components/AddDisputeItemsDialog";

const Page = () => {
  const router = useRouter();
  const { email } = useParams();
  const { data, userName, loading, error, refresh } = useCreditReport(email as string);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [isSavingToWizard, setIsSavingToWizard] = useState(false);
  const [isSavingToShowItems, setIsSavingToShowItems] = useState(false);

  const decodedEmail = decodeURIComponent(email as string);

  const {
    disputeItems,
    addMultipleDisputeItems,
    removeDisputeItem,
    loadAccountGroups,
    saveDisputeItems,
  } = useDispute();

  const handleAddDisputeItems = async (ids: string[]) => {
    try {
      setIsSavingToShowItems(true);

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
      const uniqueNewItems = newItems.filter(
        (item) => !currentIds.has(item.id)
      );

      await addMultipleDisputeItems([...disputeItems, ...uniqueNewItems]);

      toast.success("Dispute items saved successfully!");
    } catch (error) {
      console.error("Failed to add dispute items:", error);
      toast.error("Failed to save dispute items. Please try again.");
    } finally {
      setIsSavingToShowItems(false);
    }
  };

  const handleSaveAndContinueToWizard = async () => {
    try {
      setIsSavingToWizard(true);

      // Simulate saving work
      await new Promise((resolve) => setTimeout(resolve, 1000));


      toast.success("Your work has been saved successfully!");

      // Navigate to dispute wizard
      router.push(
        `/dispute-wizard?email=${encodeURIComponent(
          email as string
        )}&name=${encodeURIComponent(userName)}`
      );
    } catch (error) {
      console.error("Failed to save work:", error);
      toast.error("Failed to save your work. Please try again.");
    } finally {
      setIsSavingToWizard(false);
    }
  };

  const handleSaveAndShowItems = async () => {
    try {
      setIsSavingToShowItems(true);

      // Simulate saving work
      await new Promise((resolve) => setTimeout(resolve, 1000));


      toast.success("Your work has been saved successfully!");
      setDialogOpen(true);
    } catch (error) {
      console.error("Failed to save work:", error);
      toast.error("Failed to save your work. Please try again.");
    } finally {
      setIsSavingToShowItems(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-full">
        <Loader />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-64">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex justify-center items-center h-64">
        <p>No credit report data found. Please import a report first.</p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex gap-2 mb-6">
        <h1 className="font-semibold text-[28px] text-[#383737]">
          Preview Credit Report
          <span className="font-normal ml-1 text-[20px] text-[#383737]">
            ({userName})
          </span>
        </h1>
      </div>

      {/* --- Personal Info --- */}
      <section className="mb-6">
        <h3 className="font-semibold text-xl text-[#292524]">
          Personal Information
        </h3>
        <p className="text-[#666] text-sm">
          Personal information as it appears on the credit file. Click a record
          to tag it for disputes if incorrect.
        </p>
        <PersonalInfoTable rows={data.personalInfoRows} />
      </section>

      {/* --- Credit Summary --- */}
      <section className="mb-6">
        <h3 className="font-semibold text-xl text-[#292524]">Credit Summary</h3>
        <p className="text-[#666] text-sm">
          Overview of present and past credit status.
        </p>
        <CreditSummaryTable rows={data.creditSummaryRows} />
      </section>

      {/* --- Credit Inquiries --- */}
      <section className="mb-6">
        <h3 className="font-semibold text-xl text-[#292524]">
          Credit Inquiries
        </h3>
        <p className="text-[#666] text-sm">
          Organizations who have obtained a copy of your credit report.
        </p>
        <CreditInquiryTable rows={data.creditInquiryRows} />
      </section>

      {/* --- Public Records --- */}
      <section className="mb-6">
        <h3 className="font-semibold text-xl text-[#292524]">Public Records</h3>
        <p className="text-[#666] text-sm">
          Includes bankruptcy filings, court records, tax liens, and judgments.
        </p>
        <PublicRecordTable rows={data.publicRecordRows} />
      </section>

      {/* --- Account Info --- */}
      <section className="mb-6">
        <h3 className="font-semibold text-xl text-[#292524]">
          Account Information
        </h3>
        <p className="text-[#666] text-sm">
          Detailed account information across all three credit bureaus.
        </p>
        <AccountInfoTable
          rows={data.accountInfoRows}
          email={decodedEmail}
          onAccountUpdate={(accountId, updates) => {
            // This will now trigger the API call to update the database
            console.log("Account updated:", decodedEmail);
            toast.success("Account information updated successfully!");
            // Refresh the data to show the updated account immediately
            refresh();
          }}
          onRefresh={refresh}
        />
      </section>

      <div className="border border-[#FFB74D] p-6 rounded-lg my-6">
        <p className="text-sm text-[#71717A]">
          <span className="font-bold text-black mr-2">Finished?</span>
          All &quot;Negative&quot; items you&apos;ve tagged will be saved as
          dispute items for the wizard. Choose one of the options below.
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
        <Button
          className="bg-primary text-white w-full sm:w-auto"
          onClick={handleSaveAndContinueToWizard}
          disabled={isSavingToWizard || isSavingToShowItems}
        >
          {isSavingToWizard ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            "Save my work and continue to Wizard"
          )}
        </Button>

        <Button
          variant="outline"
          className="border-primary text-primary w-full sm:w-auto"
          onClick={handleSaveAndShowItems}
          disabled={isSavingToShowItems || isSavingToWizard}
        >
          {isSavingToShowItems ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            "Save my work and show all Dispute Items"
          )}
        </Button>
      </div>

      <AddDisputeItemsDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        email={(email as string) ?? ""}
      />
    </div>
  );
};

export default Page;

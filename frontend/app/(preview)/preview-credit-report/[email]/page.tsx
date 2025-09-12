"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import PersonalInfoTable from "./components/personal-info";
import CreditSummaryTable from "./components/credit-summary";
import CreditInquiryTable from "./components/credit-inquiries";
import PublicRecordTable from "./components/public-record";
import AccountInfoTable from "./components/account-info";
import { Button } from "@/components/ui/button";
import { fetchStoredCreditReport } from "@/lib/creditReportApi"; // 👈 Use the new fetch function
import { transformCreditReportData } from "@/lib/dataTransform";

const Page = () => {
  const router = useRouter();
  const params = useParams();
  const email = params.email as string; // Get email from URL

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [transformedData, setTransformedData] = useState<any>(null);
  const [userName, setUserName] = useState("Client");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!email) return;

    const loadReportData = async () => {
      setLoading(true);
      setError(null);

      try {
        const decodedEmail = decodeURIComponent(email);
        const response = await fetchStoredCreditReport(decodedEmail);

        if (response.success && response.data) {
          const transformed = transformCreditReportData(
            response.data
          );
          setTransformedData(transformed);

          const reportData = response.data;
          if (reportData.personalInfo?.Experian?.names?.length > 0) {
            const firstName =
              reportData.personalInfo.Experian.names[0]?.first || "";
            const lastName =
              reportData.personalInfo.Experian.names[0]?.last || "";
            setUserName(`${firstName} ${lastName}`.trim());
          }
        } else {
          throw new Error(response.message || "Failed to load credit report.");
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "An unknown error occurred.");
      } finally {
        setLoading(false);
      }
    };

    loadReportData();
  }, [email]); // Re-run when email changes

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <p>Loading credit report...</p>
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

  if (!transformedData) {
    return (
      <div className="flex justify-center items-center h-64">
        <p>No credit report data found. Please import a report first.</p>
      </div>
    );
  }
  return (
    <div>
      {/* Page content remains the same... */}
      <div className="flex gap-2 mb-6">
        <h1 className="font-semibold text-[28px] leading-[32px] -tracking-[0.04em] text-[#383737] gap-2 ">
          Preview Credit Report<span className="font-normal ml-1 text-[20px] leading-[32px] -tracking-[0.04em] text-[#383737] ">({userName})</span>
        </h1>
      </div>

      <div className="flex flex-col gap-2 mb-3">
        <h3 className="font-semibold text-[24px] leading-[100%] tracking-normal text-[#292524] ">
          Personal Information
        </h3>
        <p className="font-normal text-[16px] leading-[25px] tracking-normal text-[#666666] ">
          Personal information as it appears on the credit file. Check
          carefully, as inaccuracies can mean identify theft. if any personal
          information is incorrect, click the record to save it as a saved
          dispute item for the wizard.
        </p>
      </div>

      <PersonalInfoTable rows={transformedData.personalInfoRows} />

      <div className="flex flex-col gap-2 mt-6 mb-3">
        <h3 className="font-semibold text-[24px] leading-[100%] tracking-normal text-[#292524] ">
          Credit Summary
        </h3>
        <p className="font-normal text-[16px] leading-[24px] tracking-normal text-[#666666] ">
          An overview of present and past credit status including open and
          closed accounts and balance information.
        </p>
      </div>

      <CreditSummaryTable rows={transformedData.creditSummaryRows} />

      <div className="flex flex-col gap-2 mt-6 mb-3">
        <h3 className="font-semibold text-[24px] leading-[100%] tracking-normal text-[#292524] ">
          Credit Inquiries
        </h3>
        <p className="font-normal text-[16px] leading-[24px] tracking-normal text-[#666666] ">
          Organizations who have obtained a copy of your credit report,
          Inquiries can remain on a credit file for up to years.
        </p>
      </div>

      <CreditInquiryTable rows={transformedData.creditInquiryRows} />

      <div className="flex flex-col gap-2 mt-6 mb-3">
        <h3 className="font-semibold text-[24px] leading-[100%] tracking-normal text-[#292524] ">
          Public Records
        </h3>
        <p className="font-normal text-[16px] leading-[24px] tracking-normal text-[#666666] ">
          Public records include bankruptcy filings, court records, tax lines
          and monetary judgments. They remain for 7-10 years.
        </p>
      </div>

      <PublicRecordTable rows={transformedData.publicRecordRows} />

      <div className="flex flex-col gap-2 mt-6 mb-3">
        <h3 className="font-semibold text-[24px] leading-[100%] tracking-normal text-[#292524] ">
          Account Information
        </h3>
        <p className="font-normal text-[16px] leading-[25px] tracking-normal text-[#666666] ">
          Detailed account information across all three credit bureaus. Check
          the boxes in the header to select specific bureaus for comparison.
        </p>
      </div>

      <AccountInfoTable rows={transformedData.accountInfoRows} />

      <div className="my-6 flex flex-col gap-2">
        <div className="border border-[#FFB74D] p-6 rounded-lg">
          <p className="font-medium text-sm leading-[20px] tracking-normal text-[#71717A] "><span className="font-bold text-sm leading-[20px] tracking-normal align-middle text-[#000000] mr-2">Finished?</span>All &quot;Negative&quot; items that you&apos;ve tagged with
            &quot;Reason and Instruction&quot; will be saved as &quot;Dispute
            Items&quot; to be merged into letters in the Wizard. Click either
            button below to save and continue.
          </p>
        </div>
      </div>

      <div className="flex justify-start gap-4">
        <Button
          className="bg-primary text-white px-4 py-2 rounded-lg"
          onClick={() =>
    router.push(
      `/dispute-wizard?email=${encodeURIComponent(email)}&name=${encodeURIComponent(
        userName
      )}`
    )
  }
        >
          Save my work and continue to Wizard
        </Button>
        <Button
          className="text-primary border border-primary px-4 py-2 rounded-lg"
          variant="outline"
        >
          Save my work and show all Dispute Items
        </Button>
      </div>
    </div>
  );
  };
  
  export default Page;
  
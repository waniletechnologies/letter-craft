"use client";
import React from "react";
import { useParams, useRouter } from "next/navigation";
import PersonalInfoTable from "./components/personal-info";
import CreditSummaryTable from "./components/credit-summary";
import CreditInquiryTable from "./components/credit-inquiries";
import PublicRecordTable from "./components/public-record";
import AccountInfoTable from "./components/account-info";
import { Button } from "@/components/ui/button";
import { useCreditReport } from "@/hooks/useCreditReport";

const Page = () => {
  const router = useRouter();
  const { email } = useParams();
  const { data, userName, loading, error } = useCreditReport(email as string);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <p>Loading credit report…</p>
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
        <AccountInfoTable rows={data.accountInfoRows} />
      </section>

      <div className="border border-[#FFB74D] p-6 rounded-lg my-6">
        <p className="text-sm text-[#71717A]">
          <span className="font-bold text-black mr-2">Finished?</span>
          All “Negative” items you’ve tagged will be saved as dispute items for
          the wizard. Choose one of the options below.
        </p>
      </div>

      <div className="flex gap-4">
        <Button
          className="bg-primary text-white"
          onClick={() =>
            router.push(
              `/dispute-wizard?email=${encodeURIComponent(
                email as string
              )}&name=${encodeURIComponent(userName)}`
            )
          }
        >
          Save my work and continue to Wizard
        </Button>
        <Button variant="outline" className="border-primary text-primary">
          Save my work and show all Dispute Items
        </Button>
      </div>
    </div>
  );
};

export default Page;

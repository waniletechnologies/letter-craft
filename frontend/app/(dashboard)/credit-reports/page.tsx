'use client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import React, { useState, useEffect } from 'react'
import { LuListFilter, LuSearch } from 'react-icons/lu'
import ReportCard from './components/report-card'
import ImportCreditReport from './components/import-credit-report'
import AutoImportOverlay, { ImportStepStatus } from './components/auto-import-overlay'
import ViewCreditReport from './components/view-credit-report'
import ExportCreditReport from './components/export-credit-report'
import CustomPagination from '@/components/Pagination'
import { useRouter } from 'next/navigation'
import { GoCreditCard } from 'react-icons/go'
import {
  fetchAllReports,
  NormalizedCreditReport,
} from "@/lib/creditReportApi";
import Loader from '@/components/Loader'



const Page = () => {
  const router = useRouter();
  const [currentPage, setCurrentPage] = useState(1);
  const [importDialogOpen, setImportDialogOpen] = useState(false);
  const [overlayOpen, setOverlayOpen] = useState(false);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [exportDialogOpen, setExportDialogOpen] = useState(false);
  
  // FIX 1: Use the correct, detailed type for the selected report.
  const [selectedReport, setSelectedReport] = useState<NormalizedCreditReport | null>(null);
  
  const [steps, setSteps] = useState<{ id: string; label: string; status: ImportStepStatus }[]>([
    { id: 'connect', label: 'Connecting to MyFreeScoreNow', status: 'pending' },
    { id: 'access', label: 'Accessing Report Data', status: 'pending' },
    { id: 'run', label: 'Auto Import Running', status: 'pending' },
  ]);
  const [reports, setReports] = useState<NormalizedCreditReport[]>([]);
  const [loading, setLoading] = useState(true);
  const reportsPerPage = 9;
  const totalPages = Math.ceil(reports.length / reportsPerPage);

  const startIndex = (currentPage - 1) * reportsPerPage;
  const endIndex = startIndex + reportsPerPage;
  const paginatedReports = reports.slice(startIndex, endIndex);


  useEffect(() => {
    const loadReports = async () => {
      try {
        setLoading(true);
        const data = await fetchAllReports();
        setReports(data);
      } catch (err) {
        console.error("Failed to load credit reports:", err);
      } finally {
        setLoading(false);
      }
    };
    loadReports();
  }, []);

  // Helper to get full name safely
  const getFullName = (report: NormalizedCreditReport | null): string => {
    if (!report) return "N/A";
    const firstName = report.personalInfo?.Experian?.names?.[0]?.first;
    const lastName = report.personalInfo?.Experian?.names?.[0]?.last;
    return firstName ? `${firstName} ${lastName || ""}`.trim() : "N/A";
  };
  
  // Compute a single credit score (average or highest among bureaus)
  const getCreditScore = (report: NormalizedCreditReport): number => {
    const scores = [
      report.personalInfo?.Experian?.creditScore,
      report.personalInfo?.TransUnion?.creditScore,
      report.personalInfo?.Equifax?.creditScore,
    ]
      .map((s) => (s ? Number(s) : null))
      .filter((s): s is number => s !== null && !isNaN(s));
  
    if (!scores.length) return 0;
    const avg = scores.reduce((a, b) => a + b, 0) / scores.length;
    return Math.round(avg);
  };

  
  // Build negative items array from accountInfo payStatus or worstPayStatus
  const getNegativeItems = (report: NormalizedCreditReport) => {
    const bureaus = ["Experian", "TransUnion", "Equifax"] as const;
    const negatives: { id: string; label: string; bureau: string; date: string; impact: string }[] = [];
  
    bureaus.forEach((bureau) => {
      const accounts = (report.accountInfo)?.[bureau] || [];
      accounts.forEach((acc, idx: number) => {
        const status = acc.worstPayStatus || acc.payStatus || "";
        if (status) {
          negatives.push({
            id: `${bureau}-${acc.accountNumber || idx}`,
            label: acc.worstPayStatus || acc.status || "N/A",
            bureau: acc.accountName,
            date: acc.lastVerified || acc.dateOpened || "",
            impact: /charge off|collection/i.test(status) ? "Very High Impact" : "High Impact",
          });
        }
      });
    });
  
    return negatives;
  };
  
  const startOverlay = async (email: string) => {
    setSteps((s) => s.map((x) => ({ ...x, status: "pending" })));
    setOverlayOpen(true);
    setTimeout(
      () =>
        setSteps((s) =>
          s.map((x, i) => ({
            ...x,
            status: i === 0 ? "done" : i === 1 ? "running" : "pending",
          }))
        ),
      800
    );
    setTimeout(
      () =>
        setSteps((s) =>
          s.map((x, i) => ({
            ...x,
            status:
              i === 0
                ? "done"
                : i === 1
                ? "done"
                : i === 2
                ? "running"
                : x.status,
          }))
        ),
      1600
    );
    setTimeout(
      () => setSteps((s) => s.map((x) => ({ ...x, status: "done" }))),
      2400
    );
    setTimeout(() => {
      setOverlayOpen(false);
      if (email) {
        router.push(`/preview-credit-report/${encodeURIComponent(email)}`);
      } else {
        console.error("Email not provided to startOverlay");
      }
    }, 6300);
  };

  return (
    <div className="p-0 md:p-6">
      <div className="mb-6">
        <h1 className="font-semibold text-[32px] leading-[100%] -tracking-[0.07em] text-[#3D3D3D] mb-2">
          Credit Reports
        </h1>
        <p className="font-medium text-[16px] leading-[100%] -tracking-[0.07em] text-[#606060]">
          Import and manage credit reports from various providers.
        </p>
      </div>

      <div className="mb-4 flex flex-col md:flex-row gap-4 md:gap-0 justify-between">
        <div className="flex items-center space-x-4">
          <div className="relative w-full md:w-[200px] xl:w-[300px]">
            <LuSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-[#848484]" />
            <Input
              placeholder="Search Reports"
              className="pl-10 bg-[#FFFFFF] w-full md:w-[200px] xl:w-[300px] border-none shadow-none focus:outline-none focus-visible:ring-1 focus-visible:ring-primary transition-colors"
            />
          </div>
          <Button
            variant="ghost"
            className="text-[#292524] cursor-pointer bg-white hover:bg-transparent hover:text-[#2563EB] transition"
          >
            <LuListFilter className="h-5 w-5 mr-2" />
            <span className="hidden md:block">Filter</span>
          </Button>
        </div>
        <div className="flex flex-col md:flex-row gap-4 md:gap-0 space-x-4">
          <Button
            onClick={() => setImportDialogOpen(true)}
            className="bg-primary text-white px-4 py-2 rounded hover:bg-primary/90 transition"
          >
            Import Credit Report
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading ? (
          <Loader />
        ) : reports.length === 0 ? (
          <p className="text-gray-500">No credit reports found.</p>
        ) : (
          paginatedReports.map((report) => {
            const importedOn = new Date(
              report.createdAt || report.updatedAt || ""
            ).toLocaleDateString();
            const negativeItems = getNegativeItems(report);

            return (
              <ReportCard
                key={report._id}
                fullName={getFullName(report)}
                statusLabel="Complete"
                importedOn={importedOn}
                importedVia={report.provider || "MyFreeScoreNow"}
                creditBureaus={report.bureaus || []}
                accountsCount={report.accounts.length}
                negativeItemsCount={negativeItems.length}
                onView={() => {
                  // FIX 2: Store the entire rich report object.
                  setSelectedReport(report);
                  setViewDialogOpen(true);
                }}
                onExport={() => {
                  // FIX 2.1: Also store the entire object for export.
                  setSelectedReport(report);
                  setExportDialogOpen(true);
                }}
              />
            );
          })
        )}
      </div>

      <div className="flex justify-center sm:justify-between mt-4 w-full">
        <div className="font-manrope hidden sm:block font-medium text-xs leading-[21.62px] -tracking-[0.02em] text-[#595858]">
          Showing page {currentPage} of {totalPages}
        </div>
        <CustomPagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
      </div>

      <ImportCreditReport
        open={importDialogOpen}
        onOpenChange={setImportDialogOpen}
        onStartImport={({ email }) => {
          setImportDialogOpen(false);
          startOverlay(email);
        }}
      />

      <AutoImportOverlay
        open={overlayOpen}
        onOpenChange={setOverlayOpen}
        steps={steps}
      />

      {/* FIX 3: Pass real, computed data to the ViewCreditReport component */}
      {selectedReport && (
        <ViewCreditReport
          open={viewDialogOpen}
          onOpenChange={setViewDialogOpen}
          fullName={getFullName(selectedReport)}
          status="Complete"
          importedOn={new Date(
            selectedReport.createdAt || selectedReport.updatedAt || ""
          ).toLocaleDateString()}
          bureaus={selectedReport.bureaus || []}
          score={getCreditScore(selectedReport)}
          accounts={selectedReport.accounts.map((acc, i) => ({
            id: `${acc.accountNumber || i}`,
            icon: GoCreditCard, // This could be dynamic based on account type later
            name: acc.accountName || "Unnamed Account",
            type: acc.worstPayStatus || acc.status || "N/A",
            balance: acc.currentBalance ? `${acc.currentBalance}` : "$0",
            status: acc.payStatus || acc.worstPayStatus || acc.status || "N/A",
          }))}
          negativeItems={getNegativeItems(selectedReport)}
        />
      )}

      {/* FIX 4: Pass correct props to ExportCreditReport */}
      {selectedReport && (
        <ExportCreditReport
          open={exportDialogOpen}
          onOpenChange={setExportDialogOpen}
          fullName={getFullName(selectedReport)}
          status="Complete"
          importedOn={new Date(
            selectedReport.createdAt || selectedReport.updatedAt || ""
          ).toLocaleDateString()}
          provider={selectedReport.provider || "N/A"}
          bureaus={selectedReport.bureaus || []}
          score={getCreditScore(selectedReport)}
          accounts={selectedReport.accounts.map((acc, i) => ({
            id: `${acc.accountNumber || i}`,
            name: acc.accountName || "Unnamed Account",
            type: acc.worstPayStatus || acc.status || "N/A",
            balance: acc.currentBalance ? `${acc.currentBalance}` : "$0",
            status: acc.payStatus || acc.worstPayStatus || acc.status || "N/A",
          }))}
          negativeItems={getNegativeItems(selectedReport)}
        />
      )}
    </div>
  );
}

export default Page

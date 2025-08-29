'use client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import React, { useState } from 'react'
import { FaRegFile } from 'react-icons/fa'
import { LuListFilter, LuSearch } from 'react-icons/lu'
import ReportCard from './components/report-card'
import ImportCreditReport from './components/import-credit-report'
import AutoImportOverlay, { ImportStepStatus } from './components/auto-import-overlay'
import ViewCreditReport from './components/view-credit-report'
import ExportCreditReport from './components/export-credit-report'
import { creditReports } from '@/lib/data'
import CustomPagination from '@/components/Pagination'
import { useRouter } from 'next/navigation'

interface CreditReport {
  id: number;
  name: string;
  status: string;
  imported_on: string;
  source: string;
  credit_bureaus: string[];
  accounts: number;
  negative_items: number;
}

const Page = () => {
  const router = useRouter();
  const [currentPage, setCurrentPage] = useState(1);
  const [importDialogOpen, setImportDialogOpen] = useState(false);
  const [overlayOpen, setOverlayOpen] = useState(false);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [exportDialogOpen, setExportDialogOpen] = useState(false);
  const [selectedReport, setSelectedReport] = useState<CreditReport | null>(null);
  const [steps, setSteps] = useState<{ id: string; label: string; status: ImportStepStatus }[]>([
    { id: 'connect', label: 'Connecting to MyFreeScoreNow', status: 'pending' },
    { id: 'access', label: 'Accessing Report Data', status: 'pending' },
    { id: 'run', label: 'Auto Import Running', status: 'pending' },
  ]);
  const totalPages = Math.ceil(creditReports.length / 10);

  const startOverlay = () => {
    setSteps((s) => s.map((x) => ({ ...x, status: 'pending' })));
    setOverlayOpen(true);
    setTimeout(() => setSteps((s) => s.map((x, i) => ({ ...x, status: i === 0 ? 'done' : i === 1 ? 'running' : 'pending' }))), 800);
    setTimeout(() => setSteps((s) => s.map((x, i) => ({ ...x, status: i === 0 ? 'done' : i === 1 ? 'done' : i === 2 ? 'running' : x.status }))), 1600);
    setTimeout(() => setSteps((s) => s.map((x) => ({ ...x, status: 'done' }))), 2400);
    setTimeout(() => setOverlayOpen(false), 3300);

    router.push('/preview-credit-report');
  };

  return (
    <div className='p-6'>
      <div className="mb-6">
        <h1 className="font-semibold text-[32px] leading-[100%] -tracking-[0.07em] text-[#3D3D3D] mb-2">Credit Reports</h1>
        <p className="font-medium text-[16px] leading-[100%] -tracking-[0.07em] text-[#606060]">Import and manage credit reports from various providers.</p>
      </div>

      <div className="mb-4 flex justify-between">
        <div className="flex items-center space-x-4">
          <div className="relative w-full md:w-[200px] xl:w-[300px]">
            <LuSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-[#848484]" />
            <Input
              placeholder="Search Bookings"
              className="pl-10 bg-[#FFFFFF] w-full md:w-[200px] xl:w-[300px] border-none shadow-none focus:outline-none focus-visible:ring-1 focus-visible:ring-primary transition-colors"
            />
          </div>
          <Button
            variant="ghost"
            className="text-[#292524] cursor-pointer bg-white hover:bg-transparent hover:text-[#2563EB] transition"
          >
            <LuListFilter className="h-5 w-5 mr-2" />
            Filter
          </Button>
        </div>
        <div className='flex space-x-4'>
          <Button
          variant="outline"
           className="bg-[#EFEFEF] text-[#3E3E3E] !hover:[#EFEFEF]/90 px-4 py-2 rounded transition">
            <FaRegFile className="h-4 w-4 mr-0" />
            View Groups 
          </Button>
          <Button 
            onClick={() => setImportDialogOpen(true)}
            className="bg-primary text-white px-4 py-2 rounded hover:bg-primary/90 transition">
            Import Credit Report
          </Button>
        </div>
      </div>

      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
        {creditReports.map((report) => (
        <ReportCard
        key={report.id}
          fullName={report.name}
          statusLabel={report.status}
          importedOn={report.imported_on}
          importedVia={report.source}
          creditBureaus={report.credit_bureaus}
          accountsCount={report.accounts}
          negativeItemsCount={report.negative_items}
          onView={() => { setSelectedReport(report); setViewDialogOpen(true); }}
          onExport={() => { setSelectedReport(report); setExportDialogOpen(true); }}
        />
        ))}
      </div>

      <div className="mhidden sm:flex justify-between mt-4 w-full">
      <div className="font-manrope font-medium text-xs leading-[21.62px] -tracking-[0.02em] text-[#595858]">
        {currentPage} of {totalPages} Credit Reports shows
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
        onStartImport={() => {
          setImportDialogOpen(false);
          startOverlay();
        }}
      />

      <AutoImportOverlay open={overlayOpen} onOpenChange={setOverlayOpen} steps={steps} />

      {selectedReport && (
        <ViewCreditReport
          open={viewDialogOpen}
          onOpenChange={setViewDialogOpen}
          fullName={selectedReport.name}
          status={selectedReport.status}
          importedOn={selectedReport.imported_on}
          bureaus={selectedReport.credit_bureaus}
          accounts={[
            { id: '1', name: 'Chase Freedom', type: 'Credit Card', balance: '$2,650', status: 'Current' },
            { id: '2', name: 'Wells Fargo Home Loan', type: 'Mortgage', balance: '$245,000', status: 'Current' },
            { id: '3', name: 'Ford Credit', type: 'Auto Loan', balance: '$18,600', status: '30 Days Late' },
            { id: '4', name: 'Federal Loan', type: 'Student', balance: '$12,300', status: 'Current' },
          ]}
          negativeItems={[
            { id: 'n1', label: 'Late Payment', bureau: 'Chase Freedom', date: '2024-05-15', impact: 'High Impact' },
            { id: 'n2', label: 'Collection Account', bureau: 'Medical Collections', date: '2024-03-10', impact: 'Very High Impact' },
            { id: 'n3', label: 'Charge Off', bureau: 'Capital One', date: '2023-12-01', impact: 'Very High Impact' },
          ]}
        />
      )}

      {selectedReport && (
        <ExportCreditReport
          open={exportDialogOpen}
          onOpenChange={setExportDialogOpen}
          fullName={selectedReport.name}
          status={selectedReport.status}
          importedOn={selectedReport.imported_on}
          provider={selectedReport.source}
          bureaus={selectedReport.credit_bureaus}
        />
      )}
    </div>
  )
}

export default Page
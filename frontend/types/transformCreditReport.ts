// types/transformedCreditReport.ts
import { CreditInquiryRow } from "@/lib/dataTransform";

export interface TransformedRow {
  id: string;
  label: string | { name: string; date: string };
  values: {
    Experian: string | number;
    Equifax: string | number;
    TransUnion: string | number;
  };
  selectable?: boolean;
}

export interface TransformedAccountRow {
  id: string;
  accountName: string;
  accountNumber: string;
  highBalance: string;
  lastVerified: string;
  status: string;
  values: {
    Experian: any;
    Equifax: any;
    TransUnion: any;
  };
}

export interface TransformedCreditReport {
  personalInfoRows: TransformedRow[];
  creditSummaryRows: TransformedRow[];
  creditInquiryRows: CreditInquiryRow[];
  publicRecordRows: TransformedRow[];
  accountInfoRows: TransformedAccountRow[];
}

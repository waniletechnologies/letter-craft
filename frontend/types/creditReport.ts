// types/creditReport.ts
export interface CreditReportData {
  negatives: {
    Experian: NegativeAccount[];
    TransUnion: NegativeAccount[];
    Equifax: NegativeAccount[];
  };
  inquiries: {
    Experian: Inquiry[];
    TransUnion: Inquiry[];
    Equifax: Inquiry[];
  };
  accountInfo: {
    Experian: AccountInfo[];
    TransUnion: AccountInfo[];
    Equifax: AccountInfo[];
  };
  creditSummary: {
    Experian: CreditSummary;
    TransUnion: CreditSummary;
    Equifax: CreditSummary;
  };
  personalInfo: {
    Experian: PersonalInfo;
    TransUnion: PersonalInfo;
    Equifax: PersonalInfo;
  };
  publicRecords: {
    Experian: PublicRecord;
    TransUnion: PublicRecord;
    Equifax: PublicRecord;
  };
}

export interface PublicRecord {
  publicRecords: string; // Change from caseNumber to publicRecords
}

export interface NegativeAccount {
  accountName: string;
  accountNumber: string;
  highBalance: string;
  currentBalance: string;
  dateOpened: string;
  status: string;
}

export interface Inquiry {
  subscriberName: string;
  inquiryDate: string;
}

export interface AccountInfo {
  accountName: string;
  accountNumber: string;
  highBalance: string;
  currentBalance: string;
  dateOpened: string;
  status: string;
  payStatus: string;
  worstPayStatus: string;
  lastVerified: string;
  dateClosed: string;
  remarks: string[];
}

export interface CreditSummary {
  totalAccounts: number;
  openAccounts: number;
  closeAccounts: number;
  derogatoryAccounts: number;
  delinquentAccounts: number;
  totalBalance: string;
  inquiries2Years: string;
  publicRecords: string;
}

export interface PersonalInfo {
  names: Name[];
  employers: Employer[];
  ssns: SSN[];
  addresses: Address[];
  previousAddresses: Address[];
  births: Birth[];
  creditScore: string | null;
  creditReportDate: string | null;
}

export interface Name {
  first: string;
  middle: string;
  last: string;
  type: string;
}

export interface Employer {
  name: string;
  dateUpdated: string;
  city: string;
  state: string;
  street: string;
  postalCode: string;
}

export interface SSN {
  number: string;
  inquiryDate: string;
  reference: string;
}

export interface Address {
  dateReported: string;
  dateUpdated: string;
  city: string;
  state: string;
  street: string;
  postalCode: string;
}

export interface Birth {
  date: string;
  year: string;
  month: string;
  day: string;
  inquiryDate: string;
  reference: string;
}

export interface CreditReportRequest {
  email: string;
  password: string;
  provider: string;
  notes?: string;
}

export interface CreditReportResponse {
  success: boolean;
  message?: string;
  data?: CreditReportData;
}



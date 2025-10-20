// lib/dataTransform.ts
import {
  PersonalInfo as BureauPersonalInfo,
  CreditSummary,
  Inquiry,
  AccountInfo as ApiAccountInfo,
  CreditReportData,
} from "@/types/creditReport";

// lib/dataTransform.ts
interface PublicRecordRow {
  id: string;
  label: string;
  values: {
    Experian: string | number;
    Equifax: string | number;
    TransUnion: string | number;
  };
}

// Add this transformation function
export function transformPublicRecords(publicRecords: {
  Experian: { publicRecords: string };
  TransUnion: { publicRecords: string };
  Equifax: { publicRecords: string };
}): PublicRecordRow[] {
  return [
    {
      id: "public_records_count",
      label: "NUMBER OF PUBLIC RECORDS",
      values: {
        Experian: parseInt(publicRecords.Experian.publicRecords) || 0,
        Equifax: parseInt(publicRecords.Equifax.publicRecords) || 0,
        TransUnion: parseInt(publicRecords.TransUnion.publicRecords) || 0,
      },
    },
  ];
}

// Define the structure for transformed personal info rows
interface TransformedRow {
  id: string;
  label: string | { name: string; date: string };
  values: {
    Experian: string | number;
    Equifax: string | number;
    TransUnion: string | number;
  };
  selectable?: boolean;
}

// Define the structure for transformed account info rows
interface TransformedAccountRow {
  id: string;
  accountName: string;
  accountNumber: string;
  highBalance: string;
  dateOpened: string;
  status: string;
  values: {
    Experian: {
      accountName: string;
      accountNumber: string;
      highBalance: string;
      dateOpened: string;
      status: string;
    };
    Equifax: {
      accountName: string;
      accountNumber: string;
      highBalance: string;
      dateOpened: string;
      status: string;
    };
    TransUnion: {
      accountName: string;
      accountNumber: string;
      highBalance: string;
      dateOpened: string;
      status: string;
    };
  };
}

// Transform personal info from API to component format
export function transformPersonalInfo(personalInfo: {
  Experian: BureauPersonalInfo;
  Equifax: BureauPersonalInfo;
  TransUnion: BureauPersonalInfo;
}): TransformedRow[] {
  const rows: TransformedRow[] = [];
  const formatPostal = (postal?: string) => {
    if (!postal) return "";
    const digits = String(postal).replace(/\D/g, "");
    if (digits.length > 5) {
      return `${digits.slice(0, 5)}-${digits.slice(5, 9)}`;
    }
    return postal;
  };

  // Add credit score row
  rows.push({
    id: "score",
    label: "SCORE",
    values: {
      Experian: personalInfo.Experian.creditScore || "N/A",
      Equifax: personalInfo.Equifax.creditScore || "N/A",
      TransUnion: personalInfo.TransUnion.creditScore || "N/A",
    },
  });

  // Add report date row
  rows.push({
    id: "report_date",
    label: "CREDIT REPORT DATE:",
    values: {
      Experian: personalInfo.Experian.creditReportDate || "N/A",
      Equifax: personalInfo.Equifax.creditReportDate || "N/A",
      TransUnion: personalInfo.TransUnion.creditReportDate || "N/A",
    },
  });

  // Add name row (using the first name found)
  const experianName = personalInfo.Experian.names[0];
  const equifaxName = personalInfo.Equifax.names[0];
  const transunionName = personalInfo.TransUnion.names[0];

  rows.push({
    id: "name",
    label: "NAME",
    selectable: true,
    values: {
      Experian: experianName
        ? `${experianName.first} ${experianName.last}`.trim()
        : "N/A",
      Equifax: equifaxName
        ? `${equifaxName.first} ${equifaxName.last}`.trim()
        : "N/A",
      TransUnion: transunionName
        ? `${transunionName.first} ${transunionName.last}`.trim()
        : "N/A",
    },
  });

  // Add also known as row (only the first alias name per bureau)
  const alsoKnownAs = {
    Experian:
      (personalInfo.Experian.names[1]
        ? `${personalInfo.Experian.names[1].first} ${personalInfo.Experian.names[1].last}`.trim()
        : "") || "",
    Equifax:
      (personalInfo.Equifax.names[1]
        ? `${personalInfo.Equifax.names[1].first} ${personalInfo.Equifax.names[1].last}`.trim()
        : "") || "",
    TransUnion:
      (personalInfo.TransUnion.names[1]
        ? `${personalInfo.TransUnion.names[1].first} ${personalInfo.TransUnion.names[1].last}`.trim()
        : "") || "",
  };

  rows.push({
    id: "also_known",
    label: "ALSO KNOWN AS",
    selectable: true,
    values: alsoKnownAs,
  });

  // Add date of birth row
  const experianBirth = personalInfo.Experian.births[0];
  const equifaxBirth = personalInfo.Equifax.births[0];
  const transunionBirth = personalInfo.TransUnion.births[0];

  rows.push({
    id: "dob",
    label: "DATE OF BIRTH",
    selectable: true,
    values: {
      Experian: experianBirth?.date || experianBirth?.year || "N/A",
      Equifax: equifaxBirth?.date || equifaxBirth?.year || "N/A",
      TransUnion: transunionBirth?.date || transunionBirth?.year || "N/A",
    },
  });

  // Add current address row
  const experianAddress = personalInfo.Experian.addresses[0];
  const equifaxAddress = personalInfo.Equifax.addresses[0];
  const transunionAddress = personalInfo.TransUnion.addresses[0];

  rows.push({
    id: "current_address",
    label: "CURRENT ADDRESS",
    selectable: true,
    values: {
      Experian: experianAddress
        ? `${experianAddress.street}, ${experianAddress.city}, ${experianAddress.state} ${experianAddress.postalCode}`
        : "N/A",
      Equifax: equifaxAddress
        ? `${equifaxAddress.street}, ${equifaxAddress.city}, ${equifaxAddress.state} ${equifaxAddress.postalCode}`
        : "N/A",
      TransUnion: transunionAddress
        ? `${transunionAddress.street}, ${transunionAddress.city}, ${transunionAddress.state} ${transunionAddress.postalCode}`
        : "N/A",
    },
  });

  // Add employer row
  const experianEmployer = personalInfo.Experian.employers[0];
  const equifaxEmployer = personalInfo.Equifax.employers[0];
  const transunionEmployer = personalInfo.TransUnion.employers[0];

  rows.push({
    id: "employer",
    label: "EMPLOYER",
    selectable: true,
    values: {
      Experian: experianEmployer?.name || "",
      Equifax: equifaxEmployer?.name || "",
      TransUnion: transunionEmployer?.name || "",
    },
  });

  // Add previous addresses row
  const previousAddresses = {
    Experian:
      personalInfo.Experian.previousAddresses
        .map(
          (addr) =>
            `${addr.street}, ${addr.city}, ${addr.state} ${formatPostal(addr.postalCode)}`
        )
        .join("; ") || "",
    Equifax:
      personalInfo.Equifax.previousAddresses
        .map(
          (addr) =>
            `${addr.street}, ${addr.city}, ${addr.state} ${formatPostal(addr.postalCode)}`
        )
        .join("; ") || "",
    TransUnion:
      personalInfo.TransUnion.previousAddresses
        .map(
          (addr) =>
            `${addr.street}, ${addr.city}, ${addr.state} ${formatPostal(addr.postalCode)}`
        )
        .join("; ") || "",
  };

  rows.push({
    id: "previous_address",
    label: "PREVIOUS ADDRESS",
    selectable: true,
    values: previousAddresses,
  });

  return rows;
}

// Transform credit summary from API to component format
export function transformCreditSummary(creditSummary: {
  Experian: CreditSummary;
  Equifax: CreditSummary;
  TransUnion: CreditSummary;
}): TransformedRow[] {
  return [
    {
      id: "total_accounts",
      label: "TOTAL ACCOUNTS:",
      values: {
        Experian: creditSummary.Experian.totalAccounts,
        Equifax: creditSummary.Equifax.totalAccounts,
        TransUnion: creditSummary.TransUnion.totalAccounts,
      },
    },
    {
      id: "open_accounts",
      label: "OPEN ACCOUNTS:",
      values: {
        Experian: creditSummary.Experian.openAccounts,
        Equifax: creditSummary.Equifax.openAccounts,
        TransUnion: creditSummary.TransUnion.openAccounts,
      },
    },
    {
      id: "closed_accounts",
      label: "CLOSED ACCOUNTS:",
      values: {
        Experian: creditSummary.Experian.closeAccounts,
        Equifax: creditSummary.Equifax.closeAccounts,
        TransUnion: creditSummary.TransUnion.closeAccounts,
      },
    },
    {
      id: "delinquent",
      label: "DELINQUENT:",
      values: {
        Experian: creditSummary.Experian.delinquentAccounts,
        Equifax: creditSummary.Equifax.delinquentAccounts,
        TransUnion: creditSummary.TransUnion.delinquentAccounts,
      },
    },
    {
      id: "derogatory",
      label: "DEROGATORY:",
      values: {
        Experian: creditSummary.Experian.derogatoryAccounts,
        Equifax: creditSummary.Equifax.derogatoryAccounts,
        TransUnion: creditSummary.TransUnion.derogatoryAccounts,
      },
    },
    {
      id: "balances",
      label: "BALANCES:",
      values: {
        Experian: creditSummary.Experian.totalBalance,
        Equifax: creditSummary.Equifax.totalBalance,
        TransUnion: creditSummary.TransUnion.totalBalance,
      },
    },
    {
      id: "payments",
      label: "PAYMENTS",
      values: {
        Experian: "N/A", // This data might not be available in your API
        Equifax: "N/A",
        TransUnion: "N/A",
      },
    },
    {
      id: "public_records",
      label: "PUBLIC RECORDS",
      values: {
        Experian: parseInt(creditSummary.Experian.publicRecords) || 0,
        Equifax: parseInt(creditSummary.Equifax.publicRecords) || 0,
        TransUnion: parseInt(creditSummary.TransUnion.publicRecords) || 0,
      },
    },
    {
      id: "inquiries_2_years",
      label: "INQUIRIES (2 YEARS):",
      values: {
        Experian: parseInt(creditSummary.Experian.inquiries2Years) || 0,
        Equifax: parseInt(creditSummary.Equifax.inquiries2Years) || 0,
        TransUnion: parseInt(creditSummary.TransUnion.inquiries2Years) || 0,
      },
    },
  ];
}

type InquiryCell = "dispute" | "";

export interface CreditInquiryRow {
  id: string;
  label: { name: string; date: string };
  values: {
    Experian: InquiryCell;
    Equifax: InquiryCell;
    TransUnion: InquiryCell;
  };
}

// Transform inquiries from API to component format
export function transformInquiries(inquiries: {
  Experian: Inquiry[];
  Equifax: Inquiry[];
  TransUnion: Inquiry[];
}): CreditInquiryRow[] {
  const inquiryRows: CreditInquiryRow[] = [];

  // Process Experian inquiries
  inquiries.Experian.forEach((inquiry: Inquiry, index: number) => {
    inquiryRows.push({
      id: `exp_inq_${index}`,
      label: { name: inquiry.subscriberName, date: inquiry.inquiryDate },
      values: { Experian: "dispute", Equifax: "", TransUnion: "" },
    });
  });

  // Process Equifax inquiries
  inquiries.Equifax.forEach((inquiry: Inquiry, index: number) => {
    inquiryRows.push({
      id: `equ_inq_${index}`,
      label: { name: inquiry.subscriberName, date: inquiry.inquiryDate },
      values: { Experian: "", Equifax: "dispute", TransUnion: "" },
    });
  });

  // Process TransUnion inquiries
  inquiries.TransUnion.forEach((inquiry: Inquiry, index: number) => {
    inquiryRows.push({
      id: `tru_inq_${index}`,
      label: { name: inquiry.subscriberName, date: inquiry.inquiryDate },
      values: { Experian: "", Equifax: "", TransUnion: "dispute" },
    });
  });

  return inquiryRows;
}


// Transform account info from API to component format
// lib/dataTransform.ts
// Make sure the transformAccountInfo function preserves the original bureau-specific account numbers
export function transformAccountInfo(accountInfo: {
  Experian: ApiAccountInfo[];
  Equifax: ApiAccountInfo[];
  TransUnion: ApiAccountInfo[];
}): TransformedAccountRow[] {
  const accountRows: TransformedAccountRow[] = [];

  // Process Experian accounts
  accountInfo.Experian.forEach((account: ApiAccountInfo, index: number) => {
    if (!account.accountNumber) return; // Skip accounts without account numbers
    
    accountRows.push({
      id: `exp_acc_${index}`,
      accountName: account.accountName,
      accountNumber: account.accountNumber, // Use Experian's account number as main
      highBalance: account.highBalance,
      dateOpened: account.dateOpened,
      status: account.status,
      values: {
        Experian: {
          accountName: account.accountName,
          accountNumber: account.accountNumber, // Preserve Experian's format
          highBalance: account.highBalance,
          dateOpened: account.dateOpened,
          status: account.status,
        },
        Equifax: {
          accountName: "",
          accountNumber: "",
          highBalance: "",
          dateOpened: "",
          status: "",
        },
        TransUnion: {
          accountName: "",
          accountNumber: "",
          highBalance: "",
          dateOpened: "",
          status: "",
        },
      },
    });
  });

  // Process Equifax accounts
  accountInfo.Equifax.forEach((account: ApiAccountInfo, index: number) => {
    if (!account.accountNumber) return;
    
    // Try to find matching account by name or other criteria
    const existingIndex = accountRows.findIndex(
      (row) => row.accountName === account.accountName
    );

    if (existingIndex >= 0) {
      // Update existing row with Equifax data
      accountRows[existingIndex].values.Equifax = {
        accountName: account.accountName,
        accountNumber: account.accountNumber, // Preserve Equifax's format
        highBalance: account.highBalance,
        dateOpened: account.dateOpened,
        status: account.status,
      };
    } else {
      // Add new row
      accountRows.push({
        id: `equ_acc_${index}`,
        accountName: account.accountName,
        accountNumber: account.accountNumber, // Use Equifax's account number as main
        highBalance: account.highBalance,
        dateOpened: account.dateOpened,
        status: account.status,
        values: {
          Experian: {
            accountName: "",
            accountNumber: "",
            highBalance: "",
            dateOpened: "",
            status: "",
          },
          Equifax: {
            accountName: account.accountName,
            accountNumber: account.accountNumber,
            highBalance: account.highBalance,
            dateOpened: account.dateOpened,
            status: account.status,
          },
          TransUnion: {
            accountName: "",
            accountNumber: "",
            highBalance: "",
            dateOpened: "",
            status: "",
          },
        },
      });
    }
  });

  // Process TransUnion accounts similarly...
  accountInfo.TransUnion.forEach((account: ApiAccountInfo, index: number) => {
    if (!account.accountNumber) return;
    
    const existingIndex = accountRows.findIndex(
      (row) => row.accountName === account.accountName
    );

    if (existingIndex >= 0) {
      accountRows[existingIndex].values.TransUnion = {
        accountName: account.accountName,
        accountNumber: account.accountNumber, // Preserve TransUnion's format
        highBalance: account.highBalance,
        dateOpened: account.dateOpened,
        status: account.status,
      };
    } else {
      accountRows.push({
        id: `tru_acc_${index}`,
        accountName: account.accountName,
        accountNumber: account.accountNumber,
        highBalance: account.highBalance,
        dateOpened: account.dateOpened,
        status: account.status,
        values: {
          Experian: {
            accountName: "",
            accountNumber: "",
            highBalance: "",
            dateOpened: "",
            status: "",
          },
          Equifax: {
            accountName: "",
            accountNumber: "",
            highBalance: "",
            lastVerified: "",
            status: "",
          },
          TransUnion: {
            accountName: account.accountName,
            accountNumber: account.accountNumber,
            highBalance: account.highBalance,
            dateOpened: account.dateOpened,
            status: account.status,
          },
        },
      });
    }
  });

  return accountRows;
}

// Main function to transform all credit report data
// Main function to transform all credit report data
// Main function to transform all credit report data
export function transformCreditReportData(creditData: CreditReportData) {
  // Check if the data has the expected structure
  if (!creditData || typeof creditData !== 'object') {
    console.error('Invalid credit data format:', creditData);
    return {
      personalInfoRows: [],
      creditSummaryRows: [],
      creditInquiryRows: [],
      publicRecordRows: [],
      accountInfoRows: []
    };
  }

  try {
    return {
      personalInfoRows: transformPersonalInfo(creditData.personalInfo || {
        Experian: { names: [], employers: [], ssns: [], addresses: [], previousAddresses: [], births: [], creditScore: null, creditReportDate: null },
        Equifax: { names: [], employers: [], ssns: [], addresses: [], previousAddresses: [], births: [], creditScore: null, creditReportDate: null },
        TransUnion: { names: [], employers: [], ssns: [], addresses: [], previousAddresses: [], births: [], creditScore: null, creditReportDate: null }
      }),
      creditSummaryRows: transformCreditSummary(creditData.creditSummary || {
        Experian: { totalAccounts: 0, openAccounts: 0, closeAccounts: 0, derogatoryAccounts: 0, delinquentAccounts: 0, totalBalance: "0", inquiries2Years: "0", publicRecords: "0" },
        Equifax: { totalAccounts: 0, openAccounts: 0, closeAccounts: 0, derogatoryAccounts: 0, delinquentAccounts: 0, totalBalance: "0", inquiries2Years: "0", publicRecords: "0" },
        TransUnion: { totalAccounts: 0, openAccounts: 0, closeAccounts: 0, derogatoryAccounts: 0, delinquentAccounts: 0, totalBalance: "0", inquiries2Years: "0", publicRecords: "0" }
      }),
      creditInquiryRows: transformInquiries(creditData.inquiries || {
        Experian: [],
        Equifax: [],
        TransUnion: []
      }),
      publicRecordRows: transformPublicRecords(creditData.publicRecords || { // Use the new function
        Experian: { publicRecords: "0" },
        TransUnion: { publicRecords: "0" },
        Equifax: { publicRecords: "0" }
      }),
      accountInfoRows: transformAccountInfo(creditData.accountInfo || {
        Experian: [],
        Equifax: [],
        TransUnion: []
      }),
    };
  } catch (error) {
    console.error('Error transforming credit report data:', error);
    return {
      personalInfoRows: [],
      creditSummaryRows: [],
      creditInquiryRows: [],
      publicRecordRows: [],
      accountInfoRows: []
    };
  }
}
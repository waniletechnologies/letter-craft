import { apiFetch } from "./api";
import {
  CreditReportRequest,
  CreditReportResponse,
  CreditReportData,
  NegativeAccount,
  AccountInfo,
} from "@/types/creditReport";

// Function to import and create a new report
export async function importCreditReport(
  credentials: CreditReportRequest
): Promise<CreditReportResponse> {
  try {
    const data = await apiFetch("/credit-report", {
      method: "POST",
      body: JSON.stringify({
        username: credentials.email,
        password: credentials.password,
        provider: credentials.provider,
        notes: credentials.notes,
      }),
    });
    console.log("Data: ", data)
    return data;
  } catch (error) {
    console.error("Error importing credit report:", error);
    return {
      success: false,
      message:
        error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}

// 👇 New function to fetch a stored report by email
export async function fetchStoredCreditReport(
  email: string
): Promise<CreditReportResponse> {
  try {
    const data = await apiFetch(`/credit-report/${email}`, {
      method: "GET",
    });
    return data;
  } catch (error) {
    console.error("Error fetching stored credit report:", error);
    return {
      success: false,
      message:
        error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}

export interface NormalizedCreditReport extends CreditReportData {
  negativeItems: NegativeAccount[];
  accounts: AccountInfo[];
  bureaus: string[];
  // 👇 Add these optional fields to match backend response
  _id?: string;          // MongoDB document ID
  createdAt?: string;    // Timestamp from Mongoose (if timestamps enabled)
  updatedAt?: string;    // Timestamp from Mongoose
  provider?: string;     // Data source name
  email?: string;        // Email tied to the report
}


export async function fetchAllReports(): Promise<NormalizedCreditReport[]> {
  try {
    const response = await apiFetch("/credit-report", {
      method: "GET",
    });
    const rawReports: CreditReportData[] = response?.data || [];

    // Helper to safely flatten possibly-object "negatives"
    const normalizeNegatives = (
      negatives: CreditReportData["negatives"] | NegativeAccount[] | null | undefined
    ): NegativeAccount[] => {
      if (!negatives) return [];
      if (Array.isArray(negatives)) return negatives;
      if (typeof negatives === "object") {
        // values might be arrays per bureau -> flatten
        return Object.values(negatives).flatMap((v) => (Array.isArray(v) ? v : []));
      }
      return [];
    };

    const normalizeAccountInfo = (
      accountInfo: CreditReportData["accountInfo"] | null | undefined
    ): { accounts: AccountInfo[]; bureaus: string[] } => {
      if (!accountInfo) return { accounts: [], bureaus: [] };
      const bureaus = Object.keys(accountInfo || {}).filter((k) => {
        const val = accountInfo[k as keyof typeof accountInfo];
        return Array.isArray(val) && val.length >= 0;
      });
      const accounts = Object.values(accountInfo || {}).flatMap((v) => (Array.isArray(v) ? v : []));
      return { accounts, bureaus };
    };

    // Return normalized array
    return rawReports.map((r) => {
      const negativeItems = normalizeNegatives(r.negatives);
      const { accounts, bureaus } = normalizeAccountInfo(r.accountInfo);

      return {
        // keep original fields but add normalized ones
        ...r,
        negativeItems, // guaranteed array
        accounts, // guaranteed array of account objects
        bureaus, // array of strings
      };
    });
  } catch (error) {
    console.error("Error fetching all credit reports:", error);
    throw error;
  }
}



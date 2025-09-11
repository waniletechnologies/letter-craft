import { apiFetch } from "./api";
import {
  CreditReportRequest,
  CreditReportResponse,
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

export async function fetchAllReports(): Promise<any[]> {
  try {
    const response = await apiFetch("/credit-report", {
      method: "GET",
    });
    const rawReports = response?.data || [];

    // Helper to safely flatten possibly-object "negatives"
    const normalizeNegatives = (negatives: any) => {
      if (!negatives) return [];
      if (Array.isArray(negatives)) return negatives;
      if (typeof negatives === "object") {
        // values might be arrays per bureau -> flatten
        return Object.values(negatives).flatMap((v) => (Array.isArray(v) ? v : []));
      }
      return [];
    };

    const normalizeAccountInfo = (accountInfo: any) => {
      if (!accountInfo) return { accounts: [], bureaus: [] };
      const bureaus = Object.keys(accountInfo || {}).filter((k) => {
        const val = accountInfo[k];
        return Array.isArray(val) && val.length >= 0;
      });
      const accounts = Object.values(accountInfo || {}).flatMap((v) => (Array.isArray(v) ? v : []));
      return { accounts, bureaus };
    };

    // Return normalized array
    return rawReports.map((r: any) => {
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



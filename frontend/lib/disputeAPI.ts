import { apiFetch } from "./api";
import { DisputePayload } from "@/types/dispute"; // We will define this type next

/**
 * Saves a new dispute record to the backend.
 * @param disputeData The dispute data payload.
 * @returns The response from the server.
 */
export async function saveDispute(
  disputeData: DisputePayload
): Promise<{ success: boolean; data?: unknown; message?: string }> {
  try {
    const response = await apiFetch("/disputes", {
      // Assumes API endpoint is /api/disputes
      method: "POST",
      body: JSON.stringify(disputeData),
    });
    return response;
  } catch (error) {
    console.error("Error saving dispute:", error);
    const message =
      error instanceof Error ? error.message : "An unknown error occurred";
    return { success: false, message };
  }
}

export interface RawDispute {
  _id: string;
  clientName: string;
  round: number;
  status: string;
  progress: number;
  bureau: string;
  accountsCount: number;
  createdDate: string;
  expectedResponseDate: string;
  items: {
    _id: string;
    title: string;
    account: string;
    status: string;
  }[];
}

export async function fetchDisputes() {
  const res = await apiFetch("/disputes");
  if (!res.success) throw new Error(res.message || "Failed to fetch disputes");
  return res.data as RawDispute[];
}

export async function updateDispute(
  id: string,
  data: Partial<DisputePayload> // 👈 Allow partial payloads
): Promise<{ success: boolean; data?: unknown; message?: string }> {
  try {
    const res = await apiFetch(`/disputes/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
    return res;
  } catch (err) {
    console.error("Error updating dispute:", err);
    const message =
      err instanceof Error ? err.message : "Unknown error occurred";
    return { success: false, message };
  }
}

export async function fetchDisputeStats(): Promise<{
  success: boolean;
  total: number;
  monthlyCounts: { month: string; disputes: number }[];
}> {
  try {
    const res = await apiFetch("/disputes/stats", { method: "GET" });
    return res;
  } catch (err) {
    console.error("Error fetching dispute stats:", err);
    return { success: false, total: 0, monthlyCounts: [] };
  }
}

export interface DisputeLetterDownloadInfo {
  title: string;
  category: string;
  name: string;
  bureau?: string;
  round?: number;
  key: string;
  downloadUrl: string;
}

export async function fetchSelectedLetterDownloads(disputeId: string) {
  const res = await apiFetch(`/disputes/${disputeId}/letters/downloads`, {
    method: "GET",
  });
  if (!res.success) throw new Error(res.message || "Failed to get download URLs");
  return res.data as DisputeLetterDownloadInfo[];
}

export interface LetterCategory {
  category: string;
  letters: { name: string; key: string; lastModified?: string }[];
}

export async function fetchAvailableLetters() {
  const res = await apiFetch(`/letters`, { method: "GET" });
  if (!res.success) throw new Error(res.message || "Failed to fetch letters");
  return res.data as LetterCategory[];
}


// lib/lettersApi.ts
import { apiFetch } from "./api";

export interface Letter {
  name: string;
  key: string;
  lastModified: string;
}

export interface LetterCategory {
  category: string;
  letters: Letter[];
}

export interface LetterContent {
  bodyHtml: string;
  toAddress(toAddress: unknown): unknown;
  fromAddress(fromAddress: unknown): unknown;
  html: string;
  downloadUrl: string;
  category: string;
  name: string;
}

export async function fetchLetters(): Promise<{
  success: boolean;
  data?: LetterCategory[];
  message?: string;
}> {
  try {
    const data = await apiFetch("/letters", {
      method: "GET",
    });
    return data;
  } catch (error) {
    console.error("Error fetching letters:", error);
    return {
      success: false,
      message:
        error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}

export async function fetchLetterContent(
  category: string,
  name: string
): Promise<{
  success: boolean;
  data?: LetterContent;
  message?: string;
}> {
  try {
    const encodedCategory = encodeURIComponent(category);
    const encodedName = encodeURIComponent(name);
    const data = await apiFetch(`/letters/${encodedCategory}/${encodedName}`, {
      method: "GET",
    });
    return data;
  } catch (error) {
    console.error("Error fetching letter content:", error);
    return {
      success: false,
      message:
        error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}

// Save a generated letter
export async function saveLetter(letterData: {
  clientId: string | null;
  letterName: string;
  abbreviation?: string;
  round: number;
  category: string;
  bureau: string;
  content: string;
  personalInfo: unknown;
  selectedFtcReports?: string[];
  followUpDays?: number;
  createFollowUpTask?: boolean;
}): Promise<{
  success: boolean;
  data?: unknown;
  message?: string;
}> {
  try {
    console.log("Sending letter data to backend:", letterData);
    const data = await apiFetch("/letters", {
      method: "POST",
      body: JSON.stringify(letterData),
      headers: {
        'x-user-id': 'mock-user-id', // Add mock user ID for testing
      },
    });
    return data;
  } catch (error) {
    console.error("Error saving letter:", error);
    return {
      success: false,
      message:
        error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}

// Get letters for a specific client
export async function getClientLetters(
  clientId: string,
  status?: string,
  bureau?: string
): Promise<{
  success: boolean;
  data?: unknown[];
  message?: string;
}> {
  try {
    const params = new URLSearchParams();
    if (status) params.append("status", status);
    if (bureau) params.append("bureau", bureau);
    
    const queryString = params.toString();
    const url = `/letters/client/${clientId}${queryString ? `?${queryString}` : ""}`;
    
    const data = await apiFetch(url, {
      method: "GET",
    });
    return data;
  } catch (error) {
    console.error("Error fetching client letters:", error);
    return {
      success: false,
      message:
        error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}

// Get a specific letter by ID
export async function getLetterById(letterId: string): Promise<{
  success: boolean;
  data?: unknown;
  message?: string;
}> {
  try {
    const data = await apiFetch(`/letters/letter/${letterId}`, {
      method: "GET",
    });
    return data;
  } catch (error) {
    console.error("Error fetching letter:", error);
    return {
      success: false,
      message:
        error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}

// Update letter status
export async function updateLetterStatus(
  letterId: string,
  statusData: {
    status: string;
    trackingNumber?: string;
    sendMethod?: string;
  }
): Promise<{
  success: boolean;
  data?: unknown;
  message?: string;
}> {
  try {
    const data = await apiFetch(`/letters/${letterId}/status`, {
      method: "PUT",
      body: JSON.stringify(statusData),
    });
    return data;
  } catch (error) {
    console.error("Error updating letter status:", error);
    return {
      success: false,
      message:
        error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}

// Delete a letter
export async function deleteLetter(letterId: string): Promise<{
  success: boolean;
  message?: string;
}> {
  try {
    const data = await apiFetch(`/letters/${letterId}`, {
      method: "DELETE",
    });
    return data;
  } catch (error) {
    console.error("Error deleting letter:", error);
    return {
      success: false,
      message:
        error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}

// Get all letters (dashboard)
export async function getAllLetters(): Promise<{
  success: boolean;
  data?: Letter[];
  message?: string;
}> {
  try {
    const data = await apiFetch(`/letters-all`, {
      method: "GET",
    });
    return data;
  } catch (error) {
    console.error("Error fetching all letters:", error);
    return { success: false, message: error instanceof Error ? error.message : "Unknown error" };
  }
}

// Send letter email (provider: 'localmail' | 'cloudmail')
export async function sendLetterEmail(letterId: string, provider: 'localmail' | 'cloudmail'): Promise<{
  success: boolean;
  data?: unknown;
  message?: string;
}> {
  try {
    const data = await apiFetch(`/letters/${letterId}/send`, {
      method: 'POST',
      body: JSON.stringify({ provider }),
    });
    return data;
  } catch (error) {
    console.error('Error sending letter email:', error);
    return { success: false, message: error instanceof Error ? error.message : 'Unknown error' };
  }
}
// Rewrite letter using AI
export async function rewriteLetter(body: string): Promise<{
  success: boolean;
  data?: { body: string };
  message?: string;
}> {
  try {
    const data = await apiFetch(`/letters/rewrite`, {
      method: "POST",
      body: JSON.stringify({ body }),
    });
    return data;
  } catch (error) {
    console.error("Error rewriting letter:", error);
    return {
      success: false,
      message: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}
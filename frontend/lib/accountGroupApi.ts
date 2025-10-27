// lib/accountGroupApi.ts
import { apiFetch } from "./api";

export interface AccountGroup {
  email: string;
  groups: Record<string, unknown[]>; // Changed from Map to Record
  groupOrder: string[];
  _id?: string;
  createdAt?: string;
  updatedAt?: string;
}

export async function reorderAllGroups(
  email: string,
  sortOrder: 'newest' | 'oldest'
): Promise<AccountGroupResponse> {
  try {
    const data = await apiFetch("/account-groups/reorder-all", {
      method: "POST",
      body: JSON.stringify({ email, sortOrder }),
    });
    return data;
  } catch (error) {
    console.error("Error reordering all groups:", error);
    return {
      success: false,
      message: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}

export interface AccountGroupResponse {
  success: boolean;
  message?: string;
  data?: AccountGroup;
}

// Helper function to properly encode email
const encodeEmail = (email: string): string => {
  return encodeURIComponent(email);
};

export async function createAccountGroups(
  email: string
): Promise<AccountGroupResponse> {
  try {
    const data = await apiFetch("/account-groups", {
      method: "POST",
      body: JSON.stringify({ email }),
    });
    return data;
  } catch (error) {
    console.error("Error creating account groups:", error);
    return {
      success: false,
      message:
        error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}

export async function getAccountGroups(
  email: string
): Promise<AccountGroupResponse> {
  try {
    // Use the helper function to encode the email properly
    const encodedEmail = encodeEmail(email);
    const data = await apiFetch(`/account-groups/${encodedEmail}`, {
      method: "GET",
    });
    return data;
  } catch (error) {
    console.error("Error fetching account groups:", error);
    return {
      success: false,
      message:
        error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}

export async function updateAccountGroups(
  email: string,
  groups: Map<string, unknown[]>,
  groupOrder: string[]
): Promise<AccountGroupResponse> {
  try {
    const data = await apiFetch("/account-groups", {
      method: "PUT",
      body: JSON.stringify({ email, groups, groupOrder }),
    });
    return data;
  } catch (error) {
    console.error("Error updating account groups:", error);
    return {
      success: false,
      message:
        error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}

export async function moveAccount(
  email: string,
  accountId: string,
  sourceGroup: string,
  targetGroup: string,
  newIndex: number
): Promise<AccountGroupResponse> {
  try {
    const data = await apiFetch("/account-groups/move-account", {
      method: "PATCH",
      body: JSON.stringify({
        email,
        accountId,
        sourceGroup,
        targetGroup,
        newIndex,
      }),
    });
    return data;
  } catch (error) {
    console.error("Error moving account:", error);
    return {
      success: false,
      message:
        error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}

export async function createGroup(
  email: string,
  groupName: string
): Promise<AccountGroupResponse> {
  try {
    const data = await apiFetch("/account-groups/create-group", {
      method: "POST",
      body: JSON.stringify({ email, groupName }),
    });
    return data;
  } catch (error) {
    console.error("Error creating group:", error);
    return {
      success: false,
      message:
        error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}

export async function renameGroup(
  email: string,
  oldGroupName: string,
  newGroupName: string
): Promise<AccountGroupResponse> {
  try {
    const data = await apiFetch("/account-groups/rename-group", {
      method: "PATCH",
      body: JSON.stringify({ email, oldGroupName, newGroupName }),
    });
    return data;
  } catch (error) {
    console.error("Error renaming group:", error);
    return {
      success: false,
      message:
        error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}

export async function deleteGroup(
  email: string,
  groupName: string,
  targetGroup?: string
): Promise<AccountGroupResponse> {
  try {
    const data = await apiFetch("/account-groups/delete-group", {
      method: "DELETE",
      body: JSON.stringify({ email, groupName, targetGroup }),
    });
    return data;
  } catch (error) {
    console.error("Error deleting group:", error);
    return {
      success: false,
      message:
        error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}

// Add this function to your lib/accountGroupApi.ts file
export async function createCustomGroup(
  email: string,
  groupName: string,
  accounts: unknown[]
): Promise<AccountGroupResponse> {
  try {
    const data = await apiFetch("/account-groups/custom", {
      method: "POST",
      body: JSON.stringify({ email, groupName, accounts }),
    });
    return data;
  } catch (error) {
    console.error("Error creating custom group:", error);
    return {
      success: false,
      message:
        error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}

// Add this function to lib/accountGroupApi.ts
export async function getAccountGroupsByEmail(
  email: string
): Promise<AccountGroupResponse> {
  try {
    const encodedEmail = encodeEmail(email);
    const data = await apiFetch(`/account-groups/${encodedEmail}`, {
      method: "GET",
    });
    return data;
  } catch (error) {
    console.error("Error fetching account groups:", error);
    return {
      success: false,
      message: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}

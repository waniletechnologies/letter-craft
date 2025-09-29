// context/disputeContext.tsx
"use client";
import React, { createContext, useContext, useState, useEffect } from "react";
import { getAccountGroupsByEmail } from "@/lib/accountGroupApi";
import { UploadedFile } from "@/hooks/clients";
export interface DisputeItem {
  id: string;
  creditor: string;
  account: string;
  dateOpened: string;
  balance: string;
  type: string;
  disputed: boolean;
  hasExperian: boolean;
  hasEquifax: boolean;
  hasTransUnion: boolean;
  groupName?: string;
  bureau?: "Experian" | "Equifax" | "TransUnion";
}

interface AccountGroups {
  groups: Map<string, any[]>;
  groupOrder: string[];
}

interface DisputeContextValue {
  disputeItems: DisputeItem[];
  accountGroups: AccountGroups;
  addOrUpdateDisputeItem: (item: DisputeItem) => void;
  addMultipleDisputeItems: (items: DisputeItem[]) => void;
  removeDisputeItem: (id: string) => void;
  loadAccountGroups: (email: string) => Promise<void>;
  getGroupNameForAccount: (
    accountNumber: string,
    bureau: string
  ) => string | undefined;
  clearDisputeItems: () => void;
  saveDisputeItems: (items: DisputeItem[]) => void;
  loadSavedDisputeItems: () => DisputeItem[];
  selectedFtcReport: UploadedFile[]; // Change from single to array
  setSelectedFtcReport: (reports: UploadedFile[]) => void;
}

const DisputeContext = createContext<DisputeContextValue | undefined>(
  undefined
);

export const DisputeProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [disputeItems, setDisputeItems] = useState<DisputeItem[]>([]);
  const [accountGroups, setAccountGroups] = useState<AccountGroups>({
    groups: new Map(),
    groupOrder: [],
  });
  const [selectedFtcReport, setSelectedFtcReport] =
    useState<UploadedFile[]>([]);

  // Load saved dispute items from localStorage on component mount
  useEffect(() => {
    const savedItems = loadSavedDisputeItems();
    if (savedItems.length > 0) {
      setDisputeItems(savedItems);
    }
  }, []);

  // Save dispute items to localStorage whenever they change
  useEffect(() => {
    if (disputeItems.length > 0) {
      localStorage.setItem("disputeItems", JSON.stringify(disputeItems));
    }
  }, [disputeItems]);

  // Load account groups from API
  const loadAccountGroups = async (email: string) => {
    try {
      const response = await getAccountGroupsByEmail(email);
      if (response.success && response.data) {
        let groupsMap: Map<string, any[]>;
        if (response.data.groups instanceof Map) {
          groupsMap = response.data.groups;
        } else if (typeof response.data.groups === "object") {
          groupsMap = new Map(Object.entries(response.data.groups));
        } else {
          groupsMap = new Map();
        }

        setAccountGroups({
          groups: groupsMap,
          groupOrder: response.data.groupOrder || [],
        });
      }
    } catch (error) {
      console.error("Failed to load account groups:", error);
    }
  };

  // Find group name for a specific account
  const getGroupNameForAccount = (
    accountNumber: string,
    bureau: string
  ): string | undefined => {
    try {
      for (const [groupName, accounts] of accountGroups.groups.entries()) {
        const foundAccount = accounts.find(
          (acc) => acc.accountNumber === accountNumber && acc.bureau === bureau
        );
        if (foundAccount) {
          return groupName;
        }
      }
    } catch (error) {
      console.error("Error looking up group for account:", error);
    }
    return undefined;
  };

  // Add or update dispute item with group name lookup
  const addOrUpdateDisputeItem = (item: DisputeItem) => {
    setDisputeItems((prev) => {
      const itemWithGroup = { ...item };
      if (item.account && item.bureau) {
        const groupName = getGroupNameForAccount(item.account, item.bureau);
        itemWithGroup.groupName = groupName;
      }

      const exists = prev.find((i) => i.id === itemWithGroup.id);
      if (exists) {
        return prev.map((i) => (i.id === itemWithGroup.id ? itemWithGroup : i));
      }
      return [...prev, itemWithGroup];
    });
  };

  // Add multiple dispute items with group name lookup
  const addMultipleDisputeItems = (items: DisputeItem[]) => {
    const itemsWithGroups = items.map((item) => {
      if (item.account && item.bureau) {
        const groupName = getGroupNameForAccount(item.account, item.bureau);
        return { ...item, groupName };
      }
      return item;
    });

    setDisputeItems((prev) => {
      const ids = new Set(prev.map((i) => i.id));
      const newOnes = itemsWithGroups.filter((i) => !ids.has(i.id));
      return [...prev, ...newOnes];
    });
  };

  // Remove dispute item
  const removeDisputeItem = (id: string) => {
    setDisputeItems((prev) => prev.filter((i) => i.id !== id));
  };

  // Clear all dispute items
  const clearDisputeItems = () => {
    setDisputeItems([]);
    localStorage.removeItem("disputeItems");
  };

  // Save dispute items explicitly
  const saveDisputeItems = (items: DisputeItem[]) => {
    setDisputeItems(items);
    localStorage.setItem("disputeItems", JSON.stringify(items));
  };

  // Load saved dispute items from localStorage
  const loadSavedDisputeItems = (): DisputeItem[] => {
    if (typeof window === "undefined") return [];

    try {
      const saved = localStorage.getItem("disputeItems");
      return saved ? JSON.parse(saved) : [];
    } catch (error) {
      console.error("Error loading saved dispute items:", error);
      return [];
    }
  };

  const contextValue = React.useMemo(
    () => ({
      disputeItems,
      accountGroups,
      addOrUpdateDisputeItem,
      addMultipleDisputeItems,
      removeDisputeItem,
      loadAccountGroups,
      getGroupNameForAccount,
      clearDisputeItems,
      saveDisputeItems,
      loadSavedDisputeItems,
      selectedFtcReport,
      setSelectedFtcReport,
    }),
    [
      disputeItems,
      accountGroups,
      selectedFtcReport,
      // The functions are stable, but if you ever memoize them, add them here
    ]
  );

  return (
    <DisputeContext.Provider value={contextValue}>
      {children}
    </DisputeContext.Provider>
  );
};

export const useDispute = () => {
  const ctx = useContext(DisputeContext);
  if (!ctx) throw new Error("useDispute must be used within DisputeProvider");
  return ctx;
};

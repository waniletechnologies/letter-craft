// context/disputeContext.tsx
"use client";
import React, { createContext, useContext, useState } from "react";

export interface DisputeItem {
  disputed: boolean;
  id: string;
  creditor: string;
  account: string;
  dateOpened: string;
  balance: string;
  type: string;
  hasExperian: boolean;
  hasEquifax: boolean;
  hasTransUnion: boolean;
}

interface DisputeContextValue {
  disputeItems: DisputeItem[];
  addOrUpdateDisputeItem: (item: DisputeItem) => void;
  addMultipleDisputeItems: (items: DisputeItem[]) => void;
  removeDisputeItem: (id: string) => void;
}

const DisputeContext = createContext<DisputeContextValue | undefined>(
  undefined
);

export const DisputeProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [disputeItems, setDisputeItems] = useState<DisputeItem[]>([]);

  const addOrUpdateDisputeItem = (item: DisputeItem) => {
    setDisputeItems((prev) => {
      const exists = prev.find((i) => i.id === item.id);
      if (exists) {
        return prev.map((i) => (i.id === item.id ? item : i));
      }
      return [...prev, item];
    });
  };

  const addMultipleDisputeItems = (items: DisputeItem[]) => {
    setDisputeItems((prev) => {
      const ids = new Set(prev.map((i) => i.id));
      const newOnes = items.filter((i) => !ids.has(i.id));
      return [...prev, ...newOnes];
    });
  };

  const removeDisputeItem = (id: string) =>
    setDisputeItems((prev) => prev.filter((i) => i.id !== id));

  return (
    <DisputeContext.Provider
      value={{
        disputeItems,
        addOrUpdateDisputeItem,
        addMultipleDisputeItems,
        removeDisputeItem,
      }}
    >
      {children}
    </DisputeContext.Provider>
  );
};

export const useDispute = () => {
  const ctx = useContext(DisputeContext);
  if (!ctx) throw new Error("useDispute must be used within DisputeProvider");
  return ctx;
};

// types/dispute.ts
export interface DisputedItemPayload {
  title: string;
  account: string;
  status: "Pending" | "In Review" | "Resolved";
  groupName?: string; // Add group name field
}

export interface DisputePayload {
  clientName: string;
  bureau: "Experian" | "Equifax" | "TransUnion";
  round: number;
  status: "in-progress" | "completed" | "pending" | "failed";
  progress: number;
  createdDate: Date;
  expectedResponseDate: Date;
  accountsCount: number;
  items: DisputedItemPayload[];
  groupName?: string; // Optional group name at dispute level
  selectedLetters?: SelectedLetter[]; // ✅ Add this line
}

interface SelectedLetter {
  category: string;
  name: string;
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
    groupName?: string; // Add group name field
  }[];
  groupName?: string; // Optional group name at dispute level
}

export interface DisputedItemPayload {
  title: string;
  account: string;
  status: "Pending" | "In Review" | "Resolved";
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
}

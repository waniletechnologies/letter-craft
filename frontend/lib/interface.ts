export type Bureau = "Experian" | "Equifax" | "TransUnion";

export interface AccountInfoRow {
  id: string;
  accountName: string;
  accountNumber: string;
  highBalance: string;
  lastVerified: string;
  status: string;
  values: Record<
    Bureau,
    {
      accountName: string;
      accountNumber: string;
      highBalance: string;
      lastVerified: string;
      status: string;
    }
  >;
}

export interface AccountInfoTableProps {
  rows: AccountInfoRow[];
  onAccountUpdate?: (
    accountId: string,
    updates: Partial<AccountInfoRow>
  ) => void;
  email: string;
}
export type Bureau = "Experian" | "Equifax" | "TransUnion";

export interface AccountInfoRow {
  id: string;
  accountName: string;
  accountNumber: string;
  highBalance: string;
  dateOpened: string;
  status: string;
  values: Record<
    Bureau,
    {
      lastVerified: string;
      dateOpened: string;
      accountName: string;
      accountNumber: string;
      highBalance: string;
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
  onRefresh?: () => void;
}
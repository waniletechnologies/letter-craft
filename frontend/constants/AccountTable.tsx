import {
  useState,
  Equifax,
  Experian,
  TransUnion,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  useDispute,
} from "@/lib/import";
import {BureauHeader, ValueCell} from "@/constants/account-info";
import { Bureau, AccountInfoRow } from "@/lib/interface";

export const AccountTable: React.FC<{
  account: AccountInfoRow;
  onAccountUpdate: (updates: Partial<AccountInfoRow>) => void;
  onSelectAccount: (
    accountId: string,
    bureau: Bureau,
    selected: boolean,
    bureauData: unknown
  ) => void;
  selectedBureaus: Record<string, boolean>;
}> = ({ account, onAccountUpdate, onSelectAccount, selectedBureaus }) => {
  const [editableAccount, setEditableAccount] = useState(account);

  const { addOrUpdateDisputeItem, removeDisputeItem } = useDispute();

  // Check if a bureau has data for this account
  const hasBureauData = (bureau: Bureau): boolean => {
    const bureauData = editableAccount.values[bureau];
    return (
      !!bureauData &&
      !!bureauData.accountName &&
      bureauData.accountName.trim() !== "" &&
      bureauData.accountName !== "N/A"
    );
  };

  // In your AccountTable component, update the handleBureauToggle function
  const handleBureauToggle = (bureau: Bureau, checked: boolean) => {
    if (!hasBureauData(bureau)) return;

    const bureauData = editableAccount.values[bureau];
    const disputeId = `${editableAccount.id}-${bureau}`;

    if (checked) {
      addOrUpdateDisputeItem({
        id: disputeId,
        creditor: bureauData.accountName,
        account: bureauData.accountNumber,
        dateOpened: bureauData.lastVerified,
        balance: bureauData.highBalance,
        type: editableAccount.status,
        disputed: false,
        hasExperian: bureau === "Experian",
        hasEquifax: bureau === "Equifax",
        hasTransUnion: bureau === "TransUnion",
        bureau: bureau, // Add bureau information for group lookup
      });
    } else {
      removeDisputeItem(disputeId);
    }

    onSelectAccount(account.id, bureau, checked, {
      ...bureauData,
      bureau,
      accountId: account.id,
    });
  };

  const handleBureauDataUpdate = (
    bureau: Bureau,
    field: string,
    value: string
  ) => {
    const updatedAccount = {
      ...editableAccount,
      values: {
        ...editableAccount.values,
        [bureau]: {
          ...editableAccount.values[bureau],
          [field]: value,
        },
      },
    };
    setEditableAccount(updatedAccount);
    onAccountUpdate({ values: updatedAccount.values });
  };

  const handleAccountUpdate = (field: keyof AccountInfoRow, value: string) => {
    const updatedAccount = {
      ...editableAccount,
      [field]: value,
    };
    setEditableAccount(updatedAccount);
    onAccountUpdate({ [field]: value });
  };

  const isNegative = editableAccount.status === "Negative";

  return (
    <div className="rounded-xl border-2 border-[#E5E7EB] bg-white overflow-hidden mb-6">
      <Table>
        <TableHeader>
          <TableRow className="bg-[#FAFAFA] border-b-2 border-[#00000014]">
            <TableHead className="w-[22%] items-start p-0" />
            <TableHead className="w-[26%] p-0">
              <BureauHeader
                src={Experian}
                alt="Experian"
                checked={selectedBureaus[`${account.id}-Experian`] || false}
                onToggle={(c) => handleBureauToggle("Experian", c)}
                disabled={!hasBureauData("Experian")}
              />
            </TableHead>
            <TableHead className="w-[26%] p-0">
              <BureauHeader
                src={Equifax}
                alt="Equifax"
                checked={selectedBureaus[`${account.id}-Equifax`] || false}
                onToggle={(c) => handleBureauToggle("Equifax", c)}
                disabled={!hasBureauData("Equifax")}
              />
            </TableHead>
            <TableHead className="w-[26%] p-0">
              <BureauHeader
                src={TransUnion}
                alt="TransUnion"
                checked={selectedBureaus[`${account.id}-TransUnion`] || false}
                onToggle={(c) => handleBureauToggle("TransUnion", c)}
                disabled={!hasBureauData("TransUnion")}
              />
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {[
            ["ACCOUNT NAME:", "accountName", true],
            ["ACCOUNT #:", "accountNumber", true],
            ["HIGH BALANCE:", "highBalance", false],
            ["LAST VERIFIED", "lastVerified", false],
          ].map(([label, key, isEditable]) => (
            <TableRow key={label} className="border-b border-[#00000014]">
              <TableCell className="font-medium text-xs leading-[1.5] -tracking-[0.03em] text-right w-[22%] text-[#292524] border-r border-[#00000014] p-3">
                {label}
              </TableCell>
              {(["Experian", "Equifax", "TransUnion"] as Bureau[]).map(
                (bureau, i) => (
                  <TableCell
                    key={i}
                    className={`px-2 w-[26%] ${
                      i < 2 ? "border-r" : ""
                    } border-[#00000014] py-2 ${
                      isNegative ? "bg-[#FFE2E2]" : ""
                    } ${!hasBureauData(bureau) ? "bg-gray-100" : ""}`}
                  >
                    <ValueCell
                      value={
                        editableAccount.values[bureau][
                          key as keyof (typeof editableAccount.values)[Bureau]
                        ]
                      }
                      isEditable={
                        (isEditable as boolean) && hasBureauData(bureau)
                      }
                      onEdit={(newValue) =>
                        handleBureauDataUpdate(bureau, key as string, newValue)
                      }
                    />
                  </TableCell>
                )
              )}
            </TableRow>
          ))}
          <TableRow className="border-b border-[#00000014]">
            <TableCell className="font-medium text-xs leading-[1.5] -tracking-[0.03em] text-right w-[22%] text-[#292524] bg-[#F6F6F6] border-r border-[#00000014] p-3">
              STATUS
            </TableCell>
            {(["Experian", "Equifax", "TransUnion"] as Bureau[]).map(
              (bureau, i) => (
                <TableCell
                  key={i}
                  className={`px-2 w-[26%] border-r border-[#00000014] py-2 bg-[#F6F6F6] ${
                    !hasBureauData(bureau) ? "bg-gray-100" : ""
                  }`}
                >
                  <ValueCell value={editableAccount.values[bureau].status} />
                </TableCell>
              )
            )}
          </TableRow>
        </TableBody>
      </Table>
    </div>
  );
};
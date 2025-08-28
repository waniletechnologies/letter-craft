export type Bureau = "Experian" | "Equifax" | "TransUnion";
export type InquiryCell = "dispute" | "";
export interface CreditInquiryRow {
  id: string;
  label: { name: string; date: string };
  values: Partial<Record<Bureau, InquiryCell>>;
}

export const creditReports = [
    {
      "id": 1,
      "name": "John Smith",
      "status": "Complete",
      "imported_on": "2024-08-15",
      "source": "MyFreeScore",
      "credit_bureaus": ["Equifax", "Experian", "TransUnion"],
      "accounts": 12,
      "negative_items": 3
    },
    {
      "id": 2,
      "name": "Sarah Johnson",
      "status": "Partial",
      "imported_on": "2024-08-16",
      "source": "MyFreeScore",
      "credit_bureaus": ["Equifax", "Experian"],
      "accounts": 8,
      "negative_items": 2
    },
    {
      "id": 3,
      "name": "Lisa Wilson",
      "status": "Complete",
      "imported_on": "2024-08-05",
      "source": "MyFreeScore",
      "credit_bureaus": ["Equifax", "Experian", "TransUnion"],
      "accounts": 15,
      "negative_items": 5
    },
    {
      "id": 4,
      "name": "John Smith",
      "status": "Complete",
      "imported_on": "2024-08-15",
      "source": "MyFreeScore",
      "credit_bureaus": ["Equifax", "Experian", "TransUnion"],
      "accounts": 12,
      "negative_items": 3
    },
    {
      "id": 5,
      "name": "Sarah Johnson",
      "status": "Partial",
      "imported_on": "2024-08-16",
      "source": "MyFreeScore",
      "credit_bureaus": ["Equifax", "Experian"],
      "accounts": 8,
      "negative_items": 2
    },
    {
      "id": 6,
      "name": "Lisa Wilson",
      "status": "Complete",
      "imported_on": "2024-08-05",
      "source": "MyFreeScore",
      "credit_bureaus": ["Equifax", "Experian", "TransUnion"],
      "accounts": 15,
      "negative_items": 5
    }
  ]

export const personalInfoRows = [
  { id: 'score', label: 'SCORE', values: { Experian: '724', Equifax: '686', TransUnion: '721' } },
  { id: 'report_date', label: 'CREDIT REPORT DATE:', values: { Experian: '05/23/2025', Equifax: '05/23/2025', TransUnion: '05/23/2025' } },
  { id: 'name', label: 'NAME', selectable: true, values: { Experian: 'MICHAEL YALDO', Equifax: 'MICHAEL YALDO', TransUnion: 'MICHAEL YALDO' } },
  { id: 'also_known', label: 'ALSO KNOWN AS', selectable: true, values: { Experian: '', Equifax: '', TransUnion: 'YALDO, MICHAEL, RON' } },
  { id: 'dob', label: 'DATE OF BIRTH', selectable: true, values: { Experian: '1987', Equifax: '1987', TransUnion: '1987' } },
  { id: 'current_address', label: 'CURRENT ADDRESS', selectable: true, values: {
    Experian: '4823 BANTRY DR W BLOOMFIELD, MI 48322-1527',
    Equifax: '4823 BANTRY DR W BLOOMFIELD, MI 48322-1527',
    TransUnion: '4823 BANTRY DR W BLOOMFIELD, MI 48322-1527'
  } },
  { id: 'employer', label: 'EMPLOYER', selectable: true, values: { Experian: '', Equifax: '', TransUnion: '' } },
  { id: 'previous_address', label: 'PREVIOUS ADDRESS', selectable: true, values: {
    Experian: ['4014 EDGAR AVE ROYAL OAK, MI 48073-2277', '29650 FAIRMBROOK VILLA CT SOUTHFIELD,MI 48034-1062'],
    Equifax: '28607 BRIARWOOD CT FARMINGTON HILLS, MI 48331',
    TransUnion: '206 CRAWFORD ST BILOXI, BILOXI, MS 39530'
  } },
];

export const creditSummaryRows = [
  { id: 'total_accounts', label: 'TOTAL ACCOUNTS:', values: { Experian: 16, Equifax: 16, TransUnion: 17 } },
  { id: 'open_accounts', label: "OPEN ACCOUNTS:", values: { Experian: 9, Equifax: 9, TransUnion: 8 } },
  { id: 'closed_accounts', label: 'CLOSED ACCOUNTS:', values: { Experian: 7, Equifax: 7, TransUnion: 9 } },
  { id: 'delinquent', label: 'DELINQUENT:', values: { Experian: 0, Equifax: 0, TransUnion: 0 } },
  { id: 'derogatory', label: 'DEROGATORY:', values: { Experian: 0, Equifax: 1, TransUnion: 0 } },
  { id: 'balances', label: 'BALANCES:', values: { Experian: '$11,339', Equifax: '$12,210', TransUnion: '$12,097' } },
  { id: 'payments', label: 'PAYMENTS', values: { Experian: '$718', Equifax: '$802', TransUnion: '$782' } },
  { id: 'public_records', label: 'PUBLIC RECORDS', values: { Experian: 0, Equifax: 0, TransUnion: 0 } },
  { id: 'inquiries_2_years', label: 'INQUIRIES (2 YEARS):', values: { Experian: 1, Equifax: 0, TransUnion: 2 } },
];

export const creditInquiryRows: CreditInquiryRow[] = [
  {
    id: 'inq_1',
    label: { name: '1ST INVESTOR', date: '05/07/2024' },
    values: { Experian: '', Equifax: '', TransUnion: '' },
  },
  {
    id: 'inq_2',
    label: { name: '1ST INVST SVC/FIRST', date: '05/07/2024' },
    values: { Experian: 'dispute', Equifax: '', TransUnion: '' },
  },
  {
    id: 'inq_3',
    label: { name: 'WFBNA CARD', date: '06/03/2023' },
    values: { Experian: '', Equifax: '', TransUnion: 'dispute' },
  },
];

export const publicRecordRows = [
  { id: 'bankruptcy', label: '', values: { Experian: '', Equifax: '', TransUnion: '' } },
];

export const accountInfoRows = [
  {
    id: 'amex',
    accountName: 'AMEX',
    accountNumber: '3499924260393523',
    highBalance: '$6,961',
    lastVerified: '05/08/2025',
    status: 'Positive',
    values: { 
      Experian: { accountName: 'AMEX', accountNumber: '3499924260393523', highBalance: '$6,961', lastVerified: '', status: 'Positive' },
      Equifax: { accountName: 'AMEX', accountNumber: '-3499924260393523', highBalance: '$0', lastVerified: '', status: 'Positive' },
      TransUnion: { accountName: 'AMEX', accountNumber: '3499924260393523', highBalance: '$6,961', lastVerified: '05/08/2025', status: 'Positive' }
    }
  },
  {
    id: 'capital_one',
    accountName: 'CAPITAL ONE',
    accountNumber: '517805925494',
    highBalance: '$4,884',
    lastVerified: '05/17/2025',
    status: 'Positive',
    values: { 
      Experian: { accountName: 'CAPITAL ONE', accountNumber: '517805925494', highBalance: '$4,884', lastVerified: '', status: 'Positive' },
      Equifax: { accountName: 'CAPITAL ONE', accountNumber: '517805925494', highBalance: '$0', lastVerified: '', status: 'Positive' },
      TransUnion: { accountName: 'CAPITAL ONE', accountNumber: '517805925494', highBalance: '$4,884', lastVerified: '05/17/2025', status: 'Positive' }
    }
  },
  {
    id: 'discover_card',
    accountName: 'DISCOVERCARD',
    accountNumber: '601100602255',
    highBalance: '$2,839',
    lastVerified: '05/11/2025',
    status: 'Negative',
    values: { 
      Experian: { accountName: 'DISCOVERCARD', accountNumber: '601100602255', highBalance: '$2,839', lastVerified: '', status: 'Negative' },
      Equifax: { accountName: 'DISCOVERCARD', accountNumber: '601100602255', highBalance: '$0', lastVerified: '', status: 'Negative' },
      TransUnion: { accountName: 'DISCOVERCARD', accountNumber: '601100602255', highBalance: '$2,839', lastVerified: '05/11/2025', status: 'Negative' }
    }
  },
  {
    id: 'ally_financial',
    accountName: 'ALLY FINCL',
    accountNumber: '227972474932',
    highBalance: '$20,874',
    lastVerified: '09/07/2023',
    status: 'Positive',
    values: { 
      Experian: { accountName: 'ALLY FINCL', accountNumber: '227972474932', highBalance: '$20,874', lastVerified: '', status: 'Positive' },
      Equifax: { accountName: 'ALLY FINCL', accountNumber: '227972474932', highBalance: '$20,874', lastVerified: '', status: 'Positive' },
      TransUnion: { accountName: 'ALLY FINCL', accountNumber: '227972474932', highBalance: '$20,874', lastVerified: '09/07/2023', status: 'Positive' }
    }
  },
];
  
import mongoose from "mongoose";

const NameSchema = new mongoose.Schema({
  first: String,
  middle: String,
  last: String,
  type: String,
});

const EmployerSchema = new mongoose.Schema({
  name: String,
  dateUpdated: String,
  city: String,
  state: String,
  street: String,
  postalCode: String,
});

const SSNSchema = new mongoose.Schema({
  number: String,
  inquiryDate: String,
  reference: String,
});

const AddressSchema = new mongoose.Schema({
  dateReported: String,
  dateUpdated: String,
  city: String,
  state: String,
  street: String,
  postalCode: String,
});

const BirthSchema = new mongoose.Schema({
  date: String,
  year: String,
  month: String,
  day: String,
  inquiryDate: String,
  reference: String,
});

const AccountInfoSchema = new mongoose.Schema({
  accountName: String,
  accountNumber: String,
  highBalance: String,
  currentBalance: String,
  dateOpened: String,
  status: String, // Will be "Negative" or "Positive"
  payStatus: String,
  worstPayStatus: String,
  dateClosed: String,
  remarks: [String],
});

const InquirySchema = new mongoose.Schema({
  subscriberName: String,
  inquiryDate: String,
});

const CreditSummarySchema = new mongoose.Schema({
  totalAccounts: Number,
  openAccounts: Number,
  closeAccounts: Number,
  derogatoryAccounts: Number,
  delinquentAccounts: Number,
  totalBalance: String,
  inquiries2Years: String,
  publicRecords: String,
});

const PersonalInfoSchema = new mongoose.Schema({
  names: [NameSchema],
  employers: [EmployerSchema],
  ssns: [SSNSchema],
  addresses: [AddressSchema],
  previousAddresses: [AddressSchema],
  births: [BirthSchema],
  creditScore: String,
  creditReportDate: String,
});

const CreditReportSchema = new mongoose.Schema(
  {
    email: { type: String, required: true },
    provider: { type: String, default: "myfreescorenow" },
    notes: String,
    negatives: Object,
    inquiries: Object,
    accountInfo: Object,
    creditSummary: Object,
    personalInfo: Object,
    publicRecords: Object,
  },
  { timestamps: true }
);

export default mongoose.model("CreditReport", CreditReportSchema);

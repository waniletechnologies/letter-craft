// models/accountGroup.model.js
import mongoose from "mongoose";

const AccountSchema = new mongoose.Schema({
  accountName: String,
  accountNumber: String,
  highBalance: String,
  currentBalance: String,
  dateOpened: String,
  status: String,
  payStatus: String,
  worstPayStatus: String,
  dateClosed: String,
  remarks: [String],
  bureau: String,
  originalIndex: Number,
  groupName: String,
  order: Number // For drag and drop ordering
});

const AccountGroupSchema = new mongoose.Schema(
  {
    email: { 
      type: String, 
      required: true,
      index: true 
    },
    groups: {
      type: Map,
      of: [AccountSchema],
      default: {}
    },
    groupOrder: {
      type: [String],
      default: []
    }
  },
  { timestamps: true }
);

export default mongoose.model("AccountGroup", AccountGroupSchema);
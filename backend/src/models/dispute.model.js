// models/Dispute.js
import mongoose from "mongoose";

const disputedItemSchema = new mongoose.Schema({
  title: { type: String, required: true },
  account: { type: String, required: true },
  status: {
    type: String,
    enum: ["Pending", "In Review", "Resolved"],
    default: "Pending",
  },
  groupName: { type: String }, // Add group name field
});

const disputeSchema = new mongoose.Schema(
  {
    clientName: { type: String, required: true },
    bureau: {
      type: String,
      enum: ["Experian", "Equifax", "TransUnion"],
      required: true,
    },
    round: { type: Number, default: 1 },
    status: {
      type: String,
      enum: ["in-progress", "completed", "pending", "failed"],
      default: "pending",
    },
    progress: { type: Number, default: 0 },
    createdDate: { type: Date, default: Date.now },
    expectedResponseDate: { type: Date },
    accountsCount: { type: Number, default: 0 },
    items: [disputedItemSchema],
    groupName: { type: String }, // Optional group name at dispute level
  },
  { timestamps: true }
);

const Dispute = mongoose.model("Dispute", disputeSchema);
export default Dispute;

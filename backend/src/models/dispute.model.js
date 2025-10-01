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

    // Selected letters metadata to persist choices for downloads
    selectedLetters: [
      new mongoose.Schema(
        {
          category: { type: String, required: true },
          name: { type: String, required: true },
          bureau: {
            type: String,
            enum: ["Experian", "Equifax", "TransUnion"],
          },
          round: { type: Number, min: 1 },
          s3Key: { type: String }, // optional direct key like letters/<category>/<name>.docx
          title: { type: String }, // display title if different from name
        },
        { _id: false }
      ),
    ],
  },
  { timestamps: true }
);

const Dispute = mongoose.model("Dispute", disputeSchema);
export default Dispute;

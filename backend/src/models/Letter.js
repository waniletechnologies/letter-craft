import mongoose from 'mongoose';

const LetterSchema = new mongoose.Schema(
  {
    // Client reference
    clientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Client",
      default: null,
    },

    email: {
      type: String,
      required: function () {
        // Email is required only when clientId is not provided
        return !this.clientId;
      },
      trim: true,
      lowercase: true,
    },

    // Letter details
    letterName: {
      type: String,
      required: true,
      trim: true,
    },

    abbreviation: {
      type: String,
      trim: true,
    },

    round: {
      type: Number,
      required: true,
      min: 1,
      max: 3,
    },

    // Letter content and metadata
    category: {
      type: String,
      required: true,
      trim: true,
    },

    bureau: {
      type: String,
      required: true,
      enum: ["Equifax", "Experian", "TransUnion"],
    },

    content: {
      type: String,
      required: true,
    },

    // Personal info used for letter generation
    personalInfo: {
      type: mongoose.Schema.Types.Mixed,
      required: true,
    },

    // Selected FTC reports
    selectedFtcReports: [
      {
        type: String,
      },
    ],

    // Letter status and tracking
    status: {
      type: String,
      enum: ["draft", "sent", "delivered", "failed"],
      default: "draft",
    },

    // Sending information
    sendMethod: {
      type: String,
      enum: ["mail", "fax", "email"],
    },

    trackingNumber: {
      type: String,
      trim: true,
    },

    dateSent: {
      type: Date,
    },

    dateDelivered: {
      type: Date,
    },

    // Follow-up task
    followUpDays: {
      type: Number,
      default: 2,
    },

    createFollowUpTask: {
      type: Boolean,
      default: true,
    },

    // File attachments
    attachments: [
      {
        fileName: String,
        s3Key: String,
        originalName: String,
        mimeType: String,
        size: Number,
        uploadedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],

    // User who created the letter
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    lastModifiedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform: function (doc, ret) {
        delete ret.__v;
        return ret;
      },
    },
  }
);

// Indexes for better query performance
LetterSchema.index({ clientId: 1, status: 1 });
LetterSchema.index({ clientId: 1, createdAt: -1 });
LetterSchema.index({ status: 1 });
LetterSchema.index({ bureau: 1 });

const Letter = mongoose.model('Letter', LetterSchema);

export default Letter;

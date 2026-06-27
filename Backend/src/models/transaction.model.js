import mongoose from "mongoose";

const transactionSchema = new mongoose.Schema(
  {
    // User who initiated the run
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    // Payment Gateway
    integrationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Integration",
      required: true,
      index: true,
    },

    // Flow executed
    flowId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Flow",
      required: true,
      index: true,
    },

    // Execution Status
    status: {
      type: String,
      enum: [
        "pending",
        "running",
        "waiting_for_user",
        "waiting_for_webhook",
        "completed",
        "error",
        "cancelled",
      ],
      default: "pending",
      index: true,
    },

    // User-entered values from editableFields
    runtimeVariables: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },

    // IDs returned by different providers
    providerData: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },

    // Final backend response
    finalResponse: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },

    // Execution error (if any)
    error: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },

    // Performance
    startedAt: {
      type: Date,
      default: Date.now,
    },

    completedAt: {
      type: Date,
      default: null,
    },

    duration: {
      type: Number,
      default: 0, // milliseconds
    },
  },
  {
    timestamps: true,
  }
);

transactionSchema.index({ userId: 1, createdAt: -1 });
transactionSchema.index({ integrationId: 1, flowId: 1 });


const Transaction = mongoose.model(
  "Transaction",
  transactionSchema
);

export default Transaction;
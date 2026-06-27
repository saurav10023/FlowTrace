import mongoose from "mongoose";

const webhookLogSchema = new mongoose.Schema(
  {
    transactionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Transaction",
      required: true,
      index: true,
    },

    timelineEventId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "TimelineEvent",
      default: null,
      index: true,
    },

    integrationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Integration",
      required: true,
      index: true,
    },

    flowId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Flow",
      required: true,
      index: true,
    },

    event: {
      type: String,
      required: true,
      trim: true,
    },

    webhookId: {
      type: String,
      default: "",
      trim: true,
    },

    signature: {
      type: String,
      default: "",
    },

    signatureVerified: {
      type: Boolean,
      default: false,
    },

    headers: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },

    payload: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },

    status: {
      type: String,
      enum: [
        "received",
        "verified",
        "processed",
        "ignored",
        "error",
      ],
      default: "received",
    },

    error: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },

    receivedAt: {
      type: Date,
      default: Date.now,
    },

    processedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

webhookLogSchema.index({
  transactionId: 1,
  receivedAt: 1,
});

webhookLogSchema.index({
  event: 1,
});

const WebhookLog = mongoose.model(
  "WebhookLog",
  webhookLogSchema
);

export default WebhookLog;
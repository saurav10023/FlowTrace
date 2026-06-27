import mongoose from "mongoose";

const apiLogSchema = new mongoose.Schema(
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

    stepKey: {
      type: String,
      required: true,
      trim: true,
    },

    title: {
      type: String,
      required: true,
      trim: true,
    },

    provider: {
      type: String,
      required: true,
      trim: true,
    },

    method: {
      type: String,
      enum: [
        "GET",
        "POST",
        "PUT",
        "PATCH",
        "DELETE",
      ],
      required: true,
    },

    endpoint: {
      type: String,
      required: true,
      trim: true,
    },

    requestHeaders: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },

    requestBody: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },

    responseHeaders: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },

    responseBody: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },

    statusCode: {
      type: Number,
      default: null,
    },

    status: {
      type: String,
      enum: [
        "success",
        "error",
      ],
      default: "success",
    },

    error: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },

    duration: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

apiLogSchema.index({
  transactionId: 1,
  createdAt: 1,
});

apiLogSchema.index({
  timelineEventId: 1,
});

const ApiLog = mongoose.model(
  "ApiLog",
  apiLogSchema
);

export default ApiLog;
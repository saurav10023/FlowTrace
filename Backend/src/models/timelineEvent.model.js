import mongoose from "mongoose";

const timelineEventSchema = new mongoose.Schema(
  {
    transactionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Transaction",
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

    description: {
      type: String,
      default: "",
      trim: true,
    },

    order: {
      type: Number,
      required: true,
    },

    status: {
      type: String,
      enum: [
        "pending",
        "running",
        "success",
        "error",
        "skipped",
      ],
      default: "pending",
      index: true,
    },

    message: {
      type: String,
      default: "",
      trim: true,
    },

    startedAt: {
      type: Date,
      default: null,
    },

    completedAt: {
      type: Date,
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

timelineEventSchema.index({
  transactionId: 1,
  order: 1,
});

const TimelineEvent = mongoose.model(
  "TimelineEvent",
  timelineEventSchema
);

export default TimelineEvent;
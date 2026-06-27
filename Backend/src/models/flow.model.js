import mongoose from "mongoose";

const editableFieldSchema = new mongoose.Schema(
  {
    key: {
      type: String,
      required: true,
      trim: true,
    },

    label: {
      type: String,
      required: true,
      trim: true,
    },

    type: {
      type: String,
      enum: [
        "text",
        "number",
        "email",
        "select",
        "boolean",
        "currency",
      ],
      default: "text",
    },

    defaultValue: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },

    required: {
      type: Boolean,
      default: false,
    },

    placeholder: {
      type: String,
      default: "",
    },

    options: [
      {
        type: String,
      },
    ],
  },
  { _id: false }
);

const stepSchema = new mongoose.Schema(
  {
    key: {
      type: String,
      required: true,
      trim: true,
    },

    title: {
      type: String,
      required: true,
    },

    description: {
      type: String,
      default: "",
    },

    order: {
      type: Number,
      required: true,
    },
  },
  { _id: false }
);

const flowSchema = new mongoose.Schema(
  {
    integrationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Integration",
      required: true,
      index: true,
    },

    name: {
      type: String,
      required: true,
      trim: true,
    },

    slug: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },

    description: {
      type: String,
      default: "",
      trim: true,
    },

    shortDescription: {
      type: String,
      default: "",
      trim: true,
    },

    // Standard Checkout
    // Payment Link
    // Subscription
    // Refund
    // Webhook
    type: {
      type: String,
      required: true,
      trim: true,
    },

    flowType: {
      type: String,
      enum: [
        "embedded",
        "redirect",
        "server_to_server",
        "webhook",
        "hybrid",
      ],
      default: "embedded",
    },

    editableFields: {
      type: [editableFieldSchema],
      default: [],
    },

    steps: {
      type: [stepSchema],
      default: [],
    },

    webhookSupported: {
      type: Boolean,
      default: false,
    },

    refundsSupported: {
      type: Boolean,
      default: false,
    },

    sandboxSupported: {
      type: Boolean,
      default: true,
    },

    isRunnable: {
      type: Boolean,
      default: true,
    },

    tags: [
      {
        type: String,
        trim: true,
      },
    ],

    sortOrder: {
      type: Number,
      default: 0,
    },

    isActive: {
      type: Boolean,
      default: true,
    },

    // Analytics

    totalRuns: {
      type: Number,
      default: 0,
    },

    successfulRuns: {
      type: Number,
      default: 0,
    },

    failedRuns: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

flowSchema.index({
  integrationId: 1,
  slug: 1,
});

const Flow = mongoose.model(
  "Flow",
  flowSchema
);

export default Flow;
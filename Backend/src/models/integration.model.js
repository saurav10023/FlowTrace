import mongoose from "mongoose";

const integrationSchema = new mongoose.Schema(
  {
    // Gateway Name
    name: {
      type: String,
      required: true,
      trim: true,
    },

    // razorpay, cashfree, phonepe
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
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

    // Company / Provider
    provider: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },

    // Branding
    logoUrl: {
      type: String,
      default: "",
    },

    websiteUrl: {
      type: String,
      default: "",
    },

    documentationUrl: {
      type: String,
      default: "",
    },

    // Supported Features
    supportedFeatures: [
      {
        type: String,
        trim: true,
      },
    ],

    // Example:
    // ["upi","cards","netbanking","wallets"]
    supportedPaymentMethods: [
      {
        type: String,
        trim: true,
      },
    ],

    // Example:
    // ["checkout","payment_link","subscription"]
    supportedFlows: [
      {
        type: String,
        trim: true,
      },
    ],

    tags: [
      {
        type: String,
        trim: true,
      },
    ],

    // Capability Flags
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

    // Admin Controls
    isFeatured: {
      type: Boolean,
      default: false,
    },

    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },

    sortOrder: {
      type: Number,
      default: 0,
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

integrationSchema.index({
  slug: 1,
});

integrationSchema.index({
  isActive: 1,
  sortOrder: 1,
});

const Integration = mongoose.model(
  "Integration",
  integrationSchema
);

export default Integration;
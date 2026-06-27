import mongoose from "mongoose";

const upiOrderSchema = new mongoose.Schema(
  {
    txnRef: {
      type: String,
      required: true,
      unique: true,
    },

    amount: {
      type: Number,
      required: true,
    },

    uniqueAmount: {
      type: Number,
      required: true,
    },

    productName: {
      type: String,
      default: "Order",
    },

    buyerName: {
      type: String,
      default: "",
    },

    buyerEmail: {
      type: String,
      default: "",
    },

    buyerPhone: {
      type: String,
      default: "",
    },

    status: {
      type: String,
      enum: ["pending", "success", "expired", "failed"],
      default: "pending",
    },

    utr: {
      type: String,
      unique: true,
      sparse: true,
    },

    paidAt: {
      type: Date,
      default: null,
    },

    expiresAt: {
      type: Date,
      default: () =>
        new Date(Date.now() + 10 * 60 * 1000),
    },

    smsSender: {
      type: String,
      default: null,
    },

    rawSMS: {
      type: String,
      default: null,
    },

    verificationSource: {
      type: String,
      enum: ["sms", "manual"],
      default: "sms",
    },
  },
  {
    timestamps: true,
  }
);

upiOrderSchema.index({ txnRef: 1 });

upiOrderSchema.index({
  status: 1,
  uniqueAmount: 1,
  expiresAt: 1,
});

export const UpiOrder = mongoose.model(
  "UpiOrder",
  upiOrderSchema
);